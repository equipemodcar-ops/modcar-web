import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockProducts = [
  {
    id: '1',
    name: 'Filtro de Óleo Premium',
    code: 'FOP-001',
    category: 'Filtros',
    brand: 'Bosch',
    price: 45.90,
    stock: 120,
    partner: 'AutoPeças Premium',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Pastilha de Freio Dianteira',
    code: 'PFD-002',
    category: 'Freios',
    brand: 'TRW',
    price: 189.90,
    stock: 45,
    partner: 'Fornecedor ABC',
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Amortecedor Traseiro',
    code: 'AMT-003',
    category: 'Suspensão',
    brand: 'Monroe',
    price: 350.00,
    stock: 0,
    partner: 'AutoPeças Premium',
    status: 'inactive' as const,
  },
];

export function AdminProducts() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground mt-1">Gerencie todos os produtos da plataforma</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
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
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-mono text-sm">{product.code}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.partner}</TableCell>
                  <TableCell>
                    <span className={product.stock === 0 ? 'text-destructive font-medium' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === 'active' ? 'default' : 'secondary'}
                      className={product.status === 'active' ? 'bg-primary' : ''}
                    >
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
