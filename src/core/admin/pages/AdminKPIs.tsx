import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, TrendingDown, Users, Package, DollarSign, 
  Crown, Shield, Zap, Target, MousePointer, ShoppingCart,
  Clock, Share2, CheckCircle, Star, BarChart3, Percent
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface KPIData {
  growth: {
    totalPartnersActive: number;
    totalUsersActive: number;
    totalPartnersRegistered: number;
    totalUsersRegistered: number;
    partnerGrowthRate: number;
    userGrowthRate: number;
    newPartners: number;
    newUsers: number;
  };
  financial: {
    mrr: number;
    arr: number;
    arpu: number;
    churnRate: number;
    ltv: number;
    cac: number;
    payback: number;
    totalRevenue: number;
    churnMRR: number;
    profitMargin: number;
  };
  catalog: {
    avgProductsPerPartner: number;
    totalProducts: number;
    planDistribution: Array<{ plan: string; count: number; percentage: number }>;
  };
}

export function AdminKPIs() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIData();
  }, []);

  const loadKPIData = async () => {
    try {
      // Buscar dados dos parceiros
      const { data: partners, error: partnersError } = await supabase
        .from('profiles')
        .select('id, created_at, last_access_at')
        .eq('status', 'active');

      if (partnersError) throw partnersError;

      // Buscar assinaturas
      const { data: subscriptions, error: subsError } = await supabase
        .from('partner_subscriptions')
        .select('*');

      if (subsError) throw subsError;

      // Buscar produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('partner_id, status, created_at');

      if (productsError) throw productsError;

      // Calcular KPIs
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Crescimento
      const activePartners = partners?.filter(p => {
        const lastAccess = p.last_access_at ? new Date(p.last_access_at) : null;
        return lastAccess && lastAccess > thirtyDaysAgo;
      }) || [];

      const newPartnersThisMonth = partners?.filter(p => 
        new Date(p.created_at) > thirtyDaysAgo
      ).length || 0;

      const partnersLastMonth = partners?.filter(p => 
        new Date(p.created_at) > sixtyDaysAgo && new Date(p.created_at) <= thirtyDaysAgo
      ).length || 0;

      const partnerGrowthRate = partnersLastMonth > 0 
        ? ((newPartnersThisMonth - partnersLastMonth) / partnersLastMonth) * 100 
        : 0;

      // Financeiro
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
      const mrr = activeSubscriptions.reduce((sum, s) => sum + Number(s.monthly_revenue), 0);
      const arr = mrr * 12;
      const arpu = activePartners.length > 0 ? mrr / activePartners.length : 0;
      
      // Estimativas (em produção, esses valores viriam de dados reais)
      const churnRate = 5.2; // %
      const avgRetentionMonths = 18;
      const ltv = arpu * avgRetentionMonths;
      const cac = 450; // Custo estimado de aquisição
      const payback = arpu > 0 ? cac / arpu : 0;
      const profitMargin = 35; // %
      const churnMRR = (mrr * churnRate) / 100;

      // Catálogo
      const totalProducts = products?.length || 0;
      const avgProductsPerPartner = activePartners.length > 0 
        ? totalProducts / activePartners.length 
        : 0;

      // Distribuição por plano
      const planCounts = activeSubscriptions.reduce((acc, s) => {
        acc[s.plan] = (acc[s.plan] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalSubs = activeSubscriptions.length;
      const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
        plan,
        count,
        percentage: totalSubs > 0 ? (count / totalSubs) * 100 : 0
      }));

      setKpiData({
        growth: {
          totalPartnersActive: activePartners.length,
          totalUsersActive: 0, // Implementar quando houver tabela de usuários do app
          totalPartnersRegistered: partners?.length || 0,
          totalUsersRegistered: 0,
          partnerGrowthRate,
          userGrowthRate: 0,
          newPartners: newPartnersThisMonth,
          newUsers: 0,
        },
        financial: {
          mrr,
          arr,
          arpu,
          churnRate,
          ltv,
          cac,
          payback,
          totalRevenue: mrr,
          churnMRR,
          profitMargin,
        },
        catalog: {
          avgProductsPerPartner,
          totalProducts,
          planDistribution,
        },
      });
    } catch (error) {
      console.error('Erro ao carregar KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-primary animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando KPIs...</p>
        </div>
      </div>
    );
  }

  if (!kpiData) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">KPIs - Indicadores de Performance</h1>
        <p className="text-muted-foreground mt-1">Métricas estratégicas da plataforma ModCar</p>
      </div>

      <Tabs defaultValue="crescimento" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="crescimento">Crescimento</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="catalogo">Catálogo</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        {/* CRESCIMENTO */}
        <TabsContent value="crescimento" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lojistas Ativos (MAU)
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.growth.totalPartnersActive}</div>
                <p className="text-xs text-muted-foreground mt-1">Últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Lojistas Cadastrados
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.growth.totalPartnersRegistered}</div>
                <p className="text-xs text-muted-foreground mt-1">Total na plataforma</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Crescimento
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {kpiData.growth.partnerGrowthRate.toFixed(1)}%
                </div>
                <p className="text-xs text-primary mt-1">Crescimento mensal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Novos Lojistas (Mensal)
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.growth.newPartners}</div>
                <p className="text-xs text-muted-foreground mt-1">Este mês</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fórmulas de Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Taxa de Crescimento</p>
                <code className="text-xs text-muted-foreground">
                  [(Lojistas mês atual - Lojistas mês anterior) ÷ Lojistas mês anterior] × 100
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCEIRO */}
        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    MRR
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {kpiData.financial.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-primary mt-1">Receita Mensal Recorrente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ARR
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {kpiData.financial.arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Receita Anual Recorrente</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ARPU
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {kpiData.financial.arpu.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Receita por lojista</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Taxa de Churn
                  </CardTitle>
                  <TrendingDown className="h-5 w-5 text-destructive" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.financial.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Cancelamentos mensais</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    LTV
                  </CardTitle>
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {kpiData.financial.ltv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime Value</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    CAC
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  R$ {kpiData.financial.cac.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Custo de Aquisição</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Payback
                  </CardTitle>
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {kpiData.financial.payback.toFixed(1)} meses
                </div>
                <p className="text-xs text-muted-foreground mt-1">Retorno do investimento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Margem de Lucro
                  </CardTitle>
                  <Percent className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.financial.profitMargin}%</div>
                <p className="text-xs text-muted-foreground mt-1">Lucro líquido</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fórmulas de Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">ARPU (Receita por Lojista)</p>
                <code className="text-xs text-muted-foreground">
                  Receita total ÷ Nº de lojistas ativos
                </code>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Churn (%)</p>
                <code className="text-xs text-muted-foreground">
                  (Lojistas que cancelaram no mês ÷ Lojistas ativos no início do mês) × 100
                </code>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">LTV (Lifetime Value)</p>
                <code className="text-xs text-muted-foreground">
                  ARPU × Tempo médio de retenção (em meses)
                </code>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Payback</p>
                <code className="text-xs text-muted-foreground">
                  CAC ÷ ARPU
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CATÁLOGO */}
        <TabsContent value="catalogo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total de Produtos
                  </CardTitle>
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.catalog.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">Produtos no catálogo</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Média por Lojista
                  </CardTitle>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {kpiData.catalog.avgProductsPerPartner.toFixed(0)}
                </div>
                <p className="text-xs text-primary mt-1">Produtos cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lojistas Ativos
                  </CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpiData.growth.totalPartnersActive}</div>
                <p className="text-xs text-muted-foreground mt-1">Com produtos cadastrados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição dos Lojistas por Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {kpiData.catalog.planDistribution.map((item) => {
                  const Icon = item.plan === 'turbo' ? Zap : item.plan === 'v6' ? Shield : Crown;
                  const planName = item.plan === 'turbo' ? 'Turbo' : item.plan === 'v6' ? 'V6' : 'V12';
                  
                  return (
                    <div key={item.plan} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-medium">{planName}</span>
                          <Badge variant="secondary">{item.count} lojistas</Badge>
                        </div>
                        <span className="font-bold text-lg">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MARKETING */}
        <TabsContent value="marketing" className="space-y-6">
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-muted-foreground" />
                Em Desenvolvimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                KPIs de Marketing serão implementados quando houver integração com:
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Google Analytics para CTR e dados de conversão</li>
                <li>• Sistema de campanhas de marketing</li>
                <li>• Landing pages com rastreamento</li>
                <li>• Ferramentas de engajamento de usuários</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
