import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Zap, Check } from 'lucide-react';
import { PLANS, PlanType } from '@/core/types/plan';

const planIcons = {
  turbo: Zap,
  v6: Shield,
  v12: Crown,
};

export function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie planos e configurações da plataforma</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>
            Configure os planos oferecidos aos fornecedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
              const Icon = planIcons[key as PlanType];
              const isPopular = key === 'v6';

              return (
                <div
                  key={key}
                  className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    isPopular ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">
                      Mais Popular
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-primary text-primary-foreground mb-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-2xl font-bold ${plan.color}`}>{plan.name}</h3>
                    <p className="text-3xl font-bold mt-2">
                      R$ {plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground">Limites:</p>
                      <p className="mt-1">
                        {plan.maxProducts > 0 ? `${plan.maxProducts} produtos` : 'Produtos ilimitados'}
                      </p>
                      <p>
                        {plan.maxUsers > 0 ? `${plan.maxUsers} usuários` : 'Usuários ilimitados'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <p className="text-sm font-medium mb-2">Recursos:</p>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button
                    variant={isPopular ? 'default' : 'outline'}
                    className={isPopular ? 'w-full bg-gradient-primary hover:bg-primary-hover' : 'w-full'}
                  >
                    Editar Plano
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Nome da Plataforma', value: 'ModCar' },
              { label: 'Email de Contato', value: 'contato@modcar.com' },
              { label: 'Suporte', value: 'suporte@modcar.com' },
              { label: 'Fuso Horário', value: 'America/Sao_Paulo' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Políticas da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Período de Teste', value: '14 dias' },
              { label: 'Taxa de Transação', value: '2.5%' },
              { label: 'Desconto Anual', value: '15%' },
              { label: 'Tempo de Reembolso', value: '30 dias' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-sm text-primary font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
