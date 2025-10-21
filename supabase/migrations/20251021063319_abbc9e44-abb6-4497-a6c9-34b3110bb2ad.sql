-- Create barbers table
CREATE TABLE public.barbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create public access policies (for single admin usage)
CREATE POLICY "Enable read access for all users" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.barbers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.barbers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.barbers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.services FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.services FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.services FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.transactions FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_transactions_barber_id ON public.transactions(barber_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);