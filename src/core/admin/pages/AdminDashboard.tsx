import { Package, Users, TrendingUp, DollarSign, Crown, Shield, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const stats = [
  {
    title: 'Receita Mensal Recorrente',
    value: 'R$ 8.947,20',
    change: '+18.5%',
    icon: DollarSign,
    color: 'text-primary',
  },
  {
    title: 'Fornecedores Ativos',
    value: '35',
    change: '+5 este mês',
    icon: Users,
    color: 'text-primary',
  },
  {
    title: 'Total de Produtos',
    value: '6.842',
    change: '+234 esta semana',
    icon: Package,
    color: 'text-primary',
  },
  {
    title: 'Taxa de Retenção',
    value: '94.2%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'text-primary',
  },
];

const planStats = [
  { name: 'Turbo', count: 12, icon: Zap, color: 'text-blue-600', revenue: 1198.80 },
  { name: 'V6', count: 15, icon: Shield, color: 'text-orange-600', revenue: 3748.50 },
  { name: 'V12', count: 8, icon: Crown, color: 'text-primary', revenue: 3999.20 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-1">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-primary mt-1 font-medium">{stat.change} desde último mês</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planStats.map((plan) => (
                <div key={plan.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <plan.icon className={`h-4 w-4 ${plan.color}`} />
                      <span className="font-medium">{plan.name}</span>
                      <Badge variant="secondary" className="text-xs">{plan.count}</Badge>
                    </div>
                    <span className="text-sm font-medium">R$ {plan.revenue.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all"
                      style={{ width: `${(plan.count / 35) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novos Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'TurboMotors', plan: 'V6', date: 'Hoje' },
                { name: 'MegaParts', plan: 'Turbo', date: 'Ontem' },
                { name: 'AutoExpress', plan: 'V12', date: '2 dias atrás' },
              ].map((partner, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">Plano {partner.plan}</p>
                  </div>
                  <span className="text-xs text-primary">{partner.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Upgrade para V12', user: 'AutoPeças Premium', time: '5 min' },
                { action: '150 produtos importados', user: 'Distribuidora XYZ', time: '23 min' },
                { action: 'Nova assinatura', user: 'TurboMotors', time: '1 hora' },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.time} atrás</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
