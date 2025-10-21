import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Barber = { id: string; name: string };
type Service = { id: string; service_name: string; price: number };
type Product = { id: string; product_name: string; price: number };

export default function Transactions() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [selectedBarber, setSelectedBarber] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [barbersRes, servicesRes, productsRes] = await Promise.all([
      supabase.from("barbers").select("*").order("name"),
      supabase.from("services").select("*").order("service_name"),
      supabase.from("products").select("*").order("product_name"),
    ]);

    if (barbersRes.data) setBarbers(barbersRes.data);
    if (servicesRes.data) setServices(servicesRes.data);
    if (productsRes.data) setProducts(productsRes.data);
  };

  const calculateTotal = () => {
    let total = 0;
    if (selectedService) {
      const service = services.find(s => s.id === selectedService);
      if (service) total += Number(service.price);
    }
    if (selectedProduct) {
      const product = products.find(p => p.id === selectedProduct);
      if (product) total += Number(product.price);
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBarber) {
      toast({ title: "Error", description: "Pilih pemotong terlebih dahulu", variant: "destructive" });
      return;
    }

    const total = calculateTotal();
    if (total === 0) {
      toast({ title: "Error", description: "Pilih minimal satu jasa atau produk", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("transactions").insert([{
      barber_id: selectedBarber,
      service_id: selectedService || null,
      product_id: selectedProduct || null,
      total_price: total,
    }]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Transaksi berhasil dicatat" });
      setSelectedBarber("");
      setSelectedService("");
      setSelectedProduct("");
    }
  };

  const total = calculateTotal();

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Catat Transaksi</h2>
      
      <Card className="bg-card border-border max-w-2xl">
        <CardHeader>
          <CardTitle className="text-primary">Form Transaksi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Pemotong <span className="text-destructive">*</span>
              </label>
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Pilih pemotong" />
                </SelectTrigger>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Jasa
              </label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Pilih jasa (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.service_name} - Rp {Number(service.price).toLocaleString("id-ID")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Produk
              </label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Pilih produk (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.product_name} - Rp {Number(product.price).toLocaleString("id-ID")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-foreground">Total:</span>
                <span className="text-3xl font-bold text-primary">
                  Rp {total.toLocaleString("id-ID")}
                </span>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Simpan Transaksi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
