import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Service = {
  id: string;
  service_name: string;
  price: number;
  created_at: string;
};

export default function Services() {
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOwner) {
      navigate('/transactions');
      toast({
        title: 'Akses Ditolak',
        description: 'Anda tidak memiliki akses ke halaman ini.',
        variant: 'destructive',
      });
    } else {
      loadServices();
    }
  }, [isOwner, navigate]);

  const loadServices = async () => {
    const { data, error } = await supabase.from("services").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setServices(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !price) return;

    if (editingId) {
      const { error } = await supabase
        .from("services")
        .update({ service_name: serviceName, price: parseFloat(price) })
        .eq("id", editingId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Jasa berhasil diupdate" });
        setEditingId(null);
      }
    } else {
      const { error } = await supabase
        .from("services")
        .insert([{ service_name: serviceName, price: parseFloat(price) }]);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Jasa berhasil ditambahkan" });
      }
    }
    setServiceName("");
    setPrice("");
    loadServices();
  };

  const handleEdit = (service: Service) => {
    setServiceName(service.service_name);
    setPrice(service.price.toString());
    setEditingId(service.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Jasa berhasil dihapus" });
      loadServices();
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Manajemen Jasa</h2>
      
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingId ? "Edit Jasa" : "Tambah Jasa Baru"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Nama jasa"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="flex-1 bg-background border-input"
            />
            <Input
              type="number"
              placeholder="Harga"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="sm:w-40 bg-background border-input"
            />
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              {editingId ? "Update" : "Tambah"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setServiceName("");
                  setPrice("");
                }}
              >
                Batal
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{service.service_name}</h3>
                  <p className="text-2xl font-bold text-primary">
                    Rp {Number(service.price).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(service)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
