import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Scissors, Package, DollarSign } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBarbers: 0,
    totalServices: 0,
    totalProducts: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [barbersRes, servicesRes, productsRes, transactionsRes] = await Promise.all([
      supabase.from("barbers").select("*", { count: "exact" }),
      supabase.from("services").select("*", { count: "exact" }),
      supabase.from("products").select("*", { count: "exact" }),
      supabase
        .from("transactions")
        .select("total_price")
        .gte("transaction_date", new Date().toISOString().split("T")[0]),
    ]);

    const todayTotal = transactionsRes.data?.reduce((sum, t) => sum + Number(t.total_price), 0) || 0;

    setStats({
      totalBarbers: barbersRes.count || 0,
      totalServices: servicesRes.count || 0,
      totalProducts: productsRes.count || 0,
      todayRevenue: todayTotal,
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pemotong</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalBarbers}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jasa</CardTitle>
            <Scissors className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalServices}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Produk</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              Rp {stats.todayRevenue.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
