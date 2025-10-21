import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Product = {
  id: string;
  product_name: string;
  price: number;
  created_at: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !price) return;

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update({ product_name: productName, price: parseFloat(price) })
        .eq("id", editingId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Produk berhasil diupdate" });
        setEditingId(null);
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([{ product_name: productName, price: parseFloat(price) }]);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Berhasil", description: "Produk berhasil ditambahkan" });
      }
    }
    setProductName("");
    setPrice("");
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setProductName(product.product_name);
    setPrice(product.price.toString());
    setEditingId(product.id);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil", description: "Produk berhasil dihapus" });
      loadProducts();
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-foreground mb-8">Manajemen Produk</h2>
      
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingId ? "Edit Produk" : "Tambah Produk Baru"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Nama produk"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
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
                  setProductName("");
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
        {products.map((product) => (
          <Card key={product.id} className="bg-card border-border hover:border-primary transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{product.product_name}</h3>
                  <p className="text-2xl font-bold text-primary">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(product.id)}
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
