import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Zap, Check, ArrowUpCircle } from 'lucide-react';
import { PLANS } from '@/core/types/plan';
import { useAuth } from '@/core/contexts/AuthContext';

export function PartnerSettings() {
  const { user } = useAuth();
  const currentPlan = 'v6'; // Mock - em produção viria do perfil do usuário

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu plano e preferências</p>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seu Plano Atual</CardTitle>
              <CardDescription>Você está no plano {PLANS[currentPlan].name}</CardDescription>
            </div>
            <Badge className="bg-gradient-primary text-lg py-1 px-3">
              <Shield className="h-4 w-4 mr-2" />
              {PLANS[currentPlan].name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Produtos</p>
              <p className="text-2xl font-bold">
                142 <span className="text-sm font-normal text-muted-foreground">/ 500</span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Usuários</p>
              <p className="text-2xl font-bold">
                4 <span className="text-sm font-normal text-muted-foreground">/ 5</span>
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Próxima Cobrança</p>
              <p className="text-xl font-bold">15/03/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fazer Upgrade</CardTitle>
          <CardDescription>
            Compare planos e faça upgrade para desbloquear mais recursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
              const Icon = key === 'turbo' ? Zap : key === 'v6' ? Shield : Crown;
              const isCurrent = key === currentPlan;
              const isUpgrade = ['v6', 'v12'].indexOf(key) > ['v6', 'v12'].indexOf(currentPlan);

              return (
                <div
                  key={key}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                      Plano Atual
                    </Badge>
                  )}

                  <div className="text-center mb-4">
                    <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl mb-3 ${
                      isCurrent ? 'bg-gradient-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className={`text-xl font-bold ${plan.color}`}>{plan.name}</h3>
                    <p className="text-2xl font-bold mt-2">
                      R$ {plan.price.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? 'outline' : isUpgrade ? 'default' : 'outline'}
                    className={isUpgrade ? 'w-full bg-gradient-primary hover:bg-primary-hover' : 'w-full'}
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Plano Atual' : isUpgrade ? (
                      <>
                        <ArrowUpCircle className="h-4 w-4 mr-2" />
                        Fazer Upgrade
                      </>
                    ) : 'Ver Detalhes'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Empresa', value: user?.company || 'AutoPeças Premium' },
            { label: 'Email', value: user?.email || 'fornecedor@exemplo.com' },
            { label: 'CNPJ', value: '12.345.678/0001-90' },
            { label: 'Telefone', value: '(11) 98765-4321' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
