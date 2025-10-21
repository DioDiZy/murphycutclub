-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'cashier');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'owner')
$$;

-- Add user_id to barbers table to link cashiers to barber records
ALTER TABLE public.barbers ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Create trigger function for new user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'User'));
  RETURN new;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- Update RLS policies for barbers
DROP POLICY IF EXISTS "Enable read access for all users" ON public.barbers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.barbers;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.barbers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.barbers;

CREATE POLICY "Authenticated users can view barbers"
  ON public.barbers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage barbers"
  ON public.barbers FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- Update RLS policies for services
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.services;

CREATE POLICY "Authenticated users can view services"
  ON public.services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage services"
  ON public.services FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- Update RLS policies for products
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.products;

CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- Update RLS policies for transactions
DROP POLICY IF EXISTS "Enable read access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.transactions;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.transactions;

CREATE POLICY "Users can view own transactions or owners can view all"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    public.is_owner(auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM public.barbers 
      WHERE barbers.id = transactions.barber_id 
      AND barbers.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can update transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING (public.is_owner(auth.uid()));

CREATE POLICY "Owners can delete transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING (public.is_owner(auth.uid()));