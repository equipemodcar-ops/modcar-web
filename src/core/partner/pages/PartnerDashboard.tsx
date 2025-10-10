import { Package, TrendingUp, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { PLANS } from '@/core/types/plan';

const currentPlan = 'v6'; // Mock

const stats = [
  {
    title: 'Meus Produtos',
    value: '142',
    change: `${142} / ${PLANS[currentPlan].maxProducts}`,
    icon: Package,
  },
  {
    title: 'Produtos Ativos',
    value: '135',
    change: '95% do total',
    icon: CheckCircle,
  },
  {
    title: 'Estoque Baixo',
    value: '8',
    change: 'Requer atenção',
    icon: AlertCircle,
  },
  {
    title: 'Usuários Ativos',
    value: '4',
    change: `${4} / ${PLANS[currentPlan].maxUsers}`,
    icon: TrendingUp,
  },
];

export function PartnerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Dashboard do Fornecedor</h1>
            <Badge className="bg-gradient-primary">
              <Shield className="h-3 w-3 mr-1" />
              Plano {PLANS[currentPlan].name}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Gerencie seus produtos e estoque</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/partner/settings')}
          >
            Fazer Upgrade
          </Button>
          <Button
            className="bg-gradient-primary hover:bg-primary-hover"
            onClick={() => navigate('/partner/products')}
          >
            <Package className="h-4 w-4 mr-2" />
            Ver Produtos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/partner/products')}
              >
                <Package className="h-4 w-4 mr-2" />
                Adicionar Novo Produto
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/partner/import')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Importar Produtos em Lote
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Filtro de Óleo Premium', stock: 5 },
                { name: 'Pastilha de Freio', stock: 8 },
                { name: 'Vela de Ignição', stock: 3 },
              ].map((product, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-destructive">Estoque: {product.stock} unidades</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Atualizar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
