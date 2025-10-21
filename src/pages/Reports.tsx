import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BarberEarnings = {
  barber_id: string;
  barber_name: string;
  total_earnings: number;
  transaction_count: number;
};

export default function Reports() {
  const [barberEarnings, setBarberEarnings] = useState<BarberEarnings[]>([]);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadEarnings();
  }, [period, selectedDate]);

  const getDateRange = () => {
    const date = new Date(selectedDate);
    let startDate = new Date(date);
    let endDate = new Date(date);

    switch (period) {
      case "daily":
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "weekly":
        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(startDate.getDate() + 7);
        break;
      case "monthly":
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setDate(endDate.getDate() + 1);
        break;
    }

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
  };

  const loadEarnings = async () => {
    const { start, end } = getDateRange();

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        barber_id,
        total_price,
        barbers (name)
      `)
      .gte("transaction_date", start)
      .lt("transaction_date", end);

    if (error) {
      console.error(error);
      return;
    }

    const earningsMap = new Map<string, BarberEarnings>();
    
    data?.forEach((transaction: any) => {
      const barberId = transaction.barber_id;
      const barberName = transaction.barbers.name;
      
      if (!earningsMap.has(barberId)) {
        earningsMap.set(barberId, {
          barber_id: barberId,
          barber_name: barberName,
          total_earnings: 0,
          transaction_count: 0,
        });
      }
      
      const current = earningsMap.get(barberId)!;
      current.total_earnings += Number(transaction.total_price);
      current.transaction_count += 1;
    });

    const earnings = Array.from(earningsMap.values()).sort(
      (a, b) => b.total_earnings - a.total_earnings
    );
    
    setBarberEarnings(earnings);
  };

  const getPeriodLabel = () => {
    const date = new Date(selectedDate);
    switch (period) {
      case "daily":
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      case "weekly":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `Minggu ${startOfWeek.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;
      case "monthly":
        return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Laporan Gaji Pemotong</h2>
      
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-primary">Filter Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="bg-background border-input sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Harian</SelectItem>
                <SelectItem value="weekly">Mingguan</SelectItem>
                <SelectItem value="monthly">Bulanan</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-background border-input sm:w-52"
            />
            
            <Button onClick={loadEarnings} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Search className="h-4 w-4 mr-2" />
              Tampilkan
            </Button>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Menampilkan data untuk: <span className="text-primary font-semibold">{getPeriodLabel()}</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barberEarnings.map((earning) => (
          <Card key={earning.barber_id} className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-foreground mb-4">{earning.barber_name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Transaksi:</span>
                  <span className="font-semibold text-foreground">{earning.transaction_count}</span>
                </div>
                <div className="border-t border-border pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Pendapatan:</span>
                    <span className="text-2xl font-bold text-primary">
                      Rp {earning.total_earnings.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {barberEarnings.length === 0 && (
          <Card className="bg-card border-border col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Tidak ada data transaksi untuk periode ini</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
