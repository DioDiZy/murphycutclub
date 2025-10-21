import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        barbers (name),
        services (service_name),
        products (product_name)
      `)
      .order("transaction_date", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setTransactions(data || []);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Riwayat Transaksi</h2>
      
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
