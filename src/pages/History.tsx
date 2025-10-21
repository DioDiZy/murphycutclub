import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";

type Transaction = {
  id: string;
  barber_id: string;
  service_id: string | null;
  product_id: string | null;
  total_price: number;
  transaction_date: string;
  barbers: { name: string };
  services: { service_name: string } | null;
  products: { product_name: string } | null;
};

export default function History() {
  const { user, isOwner } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userBarberId, setUserBarberId] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isOwner) {
      loadUserBarber();
    } else {
      loadTransactions();
    }
  }, [user, isOwner]);

  const loadUserBarber = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("barbers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error(error);
    } else if (data) {
      setUserBarberId(data.id);
      loadTransactions(data.id);
    }
  };

  const loadTransactions = async (barberId?: string) => {
    let query = supabase
      .from("transactions")
      .select(`
        *,
        barbers (name),
        services (service_name),
        products (product_name)
      `);

    // If cashier, filter by their barber_id
    if (barberId) {
      query = query.eq("barber_id", barberId);
    }

    const { data, error } = await query.order("transaction_date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setTransactions(data || []);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">
        {isOwner ? 'Riwayat Transaksi' : 'Riwayat Transaksi Saya'}
      </h2>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="bg-card border-border hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-foreground">
                  {transaction.barbers.name}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(transaction.transaction_date), "dd MMMM yyyy, HH:mm", { locale: id })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transaction.services && (
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">Jasa:</span> {transaction.services.service_name}
                  </p>
                )}
                {transaction.products && (
                  <p className="text-sm text-foreground">
                    <span className="text-muted-foreground">Produk:</span> {transaction.products.product_name}
                  </p>
                )}
                <p className="text-xl font-bold text-primary pt-2">
                  Total: Rp {Number(transaction.total_price).toLocaleString("id-ID")}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
