import { useState, useEffect } from 'react';
import { Search, Filter, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: string;
  created_at: string;
  partner_id: string;
  rejection_reason?: string | null;
  approved_at?: string | null;
  partner_name?: string;
  partner_company?: string;
}

export function AdminProducts() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch partner info for each product
      const productsWithPartners = await Promise.all(
        (data || []).map(async (product) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, company')
            .eq('id', product.partner_id)
            .single();
          
          return {
            ...product,
            partner_name: profile?.name,
            partner_company: profile?.company,
          };
        })
      );

      setProducts(productsWithPartners);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const { error } = await supabase.rpc('approve_product', {
        _product_id: productId,
        _admin_id: user?.id,
      });

      if (error) throw error;

      toast({
        title: 'Produto aprovado',
        description: 'O produto foi aprovado com sucesso',
      });
      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar o produto',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe o motivo da rejeição',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('reject_product', {
        _product_id: selectedProduct.id,
        _admin_id: user?.id,
        _reason: rejectionReason,
      });

      if (error) throw error;

      toast({
        title: 'Produto rejeitado',
        description: 'O produto foi rejeitado',
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar o produto',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.code.toLowerCase().includes(search.toLowerCase()) ||
    product.brand.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string, rejectionReason?: string) => {
    if (status === 'active') {
      return <Badge className="bg-primary">Aprovado</Badge>;
    }
    if (status === 'pending') {
      return <Badge variant="secondary">Pendente</Badge>;
    }
    return (
      <Badge variant="destructive" title={rejectionReason}>
        Rejeitado
      </Badge>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-1">Gerencie e aprove produtos da plataforma</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando produtos...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum produto encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{product.code}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>
                        {product.partner_company || product.partner_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span className={product.stock === 0 ? 'text-destructive font-medium' : ''}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(product.created_at), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(product.status, product.rejection_reason)}
                      </TableCell>
                      <TableCell>
                        {product.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleApprove(product.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedProduct(product);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Produto</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do produto "{selectedProduct?.name}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Descreva o motivo da rejeição..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
                setSelectedProduct(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Rejeitar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
