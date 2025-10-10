import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Users, Package, Crown, Shield, Zap } from 'lucide-react';
import { PLANS } from '@/core/types/plan';

const monthlyData = [
  { month: 'Jan', revenue: 3200, partners: 12, products: 2400 },
  { month: 'Fev', revenue: 3800, partners: 15, products: 3100 },
  { month: 'Mar', revenue: 4500, partners: 18, products: 3800 },
  { month: 'Abr', revenue: 5200, partners: 22, products: 4500 },
  { month: 'Mai', revenue: 6100, partners: 28, products: 5200 },
  { month: 'Jun', revenue: 7300, partners: 35, products: 6800 },
];

const planDistribution = [
  { plan: 'turbo', count: 12, revenue: 1198.80 },
  { plan: 'v6', count: 15, revenue: 3748.50 },
  { plan: 'v12', count: 8, revenue: 3999.20 },
];

const topCategories = [
  { name: 'Filtros', products: 342, revenue: 45230 },
  { name: 'Freios', products: 289, revenue: 67890 },
  { name: 'Suspensão', products: 156, revenue: 89450 },
  { name: 'Motor', products: 234, revenue: 123560 },
  { name: 'Elétrica', products: 198, revenue: 34210 },
];

export function AdminReports() {
  const totalRevenue = monthlyData[monthlyData.length - 1].revenue;
  const totalPartners = monthlyData[monthlyData.length - 1].partners;
  const totalProducts = monthlyData[monthlyData.length - 1].products;
  const growth = ((monthlyData[5].revenue - monthlyData[0].revenue) / monthlyData[0].revenue * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">Análise de performance e métricas da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">R$ {(totalRevenue * 1000).toLocaleString('pt-BR')}</p>
            <p className="text-xs text-primary mt-1">+{growth}% nos últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Fornecedores Ativos</p>
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPartners}</p>
            <p className="text-xs text-muted-foreground mt-1">+{totalPartners - monthlyData[0].partners} este semestre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
            <p className="text-xs text-muted-foreground mt-1">Na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Taxa de Crescimento</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{growth}%</p>
            <p className="text-xs text-muted-foreground mt-1">Crescimento mensal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, i) => {
                const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
                const percentage = (data.revenue / maxRevenue) * 100;
                
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="text-muted-foreground">R$ {(data.revenue * 1000).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planDistribution.map((item) => {
                const plan = PLANS[item.plan as keyof typeof PLANS];
                const Icon = item.plan === 'turbo' ? Zap : item.plan === 'v6' ? Shield : Crown;
                const totalCount = planDistribution.reduce((acc, p) => acc + p.count, 0);
                const percentage = (item.count / totalCount) * 100;

                return (
                  <div key={item.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${plan.color}`} />
                        <span className="font-medium">{plan.name}</span>
                        <span className="text-sm text-muted-foreground">({item.count})</span>
                      </div>
                      <span className="text-sm font-medium">R$ {item.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Categorias por Receita</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, i) => {
              const maxRevenue = Math.max(...topCategories.map(c => c.revenue));
              const percentage = (category.revenue / maxRevenue) * 100;

              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">#{i + 1}</span>
                      <span className="font-medium">{category.name}</span>
                      <span className="text-muted-foreground">({category.products} produtos)</span>
                    </div>
                    <span className="font-medium">R$ {category.revenue.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
