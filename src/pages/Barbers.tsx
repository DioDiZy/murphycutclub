import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Barber = {
  id: string;
  name: string;
  created_at: string;
};

export default function Barbers() {
  const { isOwner } = useAuth();
  const navigate = useNavigate();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [name, setName] = useState("");
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
      loadBarbers();
    }
  }, [isOwner, navigate]);

  const loadBarbers = async () => {
    const { data, error } = await supabase.from("barbers").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setBarbers(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const { error } = await supabase.from("barbers").update({ name }).eq("id", editingId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Pemotong berhasil diupdate" });
        setEditingId(null);
      }
    } else {
      const { error } = await supabase.from("barbers").insert([{ name }]);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Pemotong berhasil ditambahkan" });
      }
    }
    setName("");
    loadBarbers();
  };

  const handleEdit = (barber: Barber) => {
    setName(barber.name);
    setEditingId(barber.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("barbers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Pemotong berhasil dihapus" });
      loadBarbers();
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Manajemen Pemotong</h2>
      
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingId ? "Edit Pemotong" : "Tambah Pemotong Baru"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              placeholder="Nama pemotong"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-background border-input"
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
                  setName("");
                }}
              >
                Batal
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {barbers.map((barber) => (
          <Card key={barber.id} className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{barber.name}</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(barber)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(barber.id)}
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
