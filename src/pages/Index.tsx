import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            <span className="font-bold text-xl">ModCar</span>
          </div>
          <Button
            onClick={() => navigate('/login')}
            className="bg-gradient-primary hover:bg-primary-hover"
          >
            Acessar Plataforma
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Gerenciamento Inteligente de
            <br />
            Produtos Automotivos
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma completa para fornecedores e administradores gerenciarem produtos automotivos com eficiência e controle total.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="bg-gradient-primary hover:bg-primary-hover text-lg px-8 py-6 shadow-red"
          >
            Começar Agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: 'Gestão de Produtos',
                description: 'Cadastre e gerencie produtos com facilidade, incluindo importação em lote via planilhas.',
              },
              {
                icon: Users,
                title: 'Multi-Fornecedor',
                description: 'Sistema robusto com separação de acessos entre administradores e fornecedores.',
              },
              {
                icon: TrendingUp,
                title: 'Análise e Relatórios',
                description: 'Acompanhe performance, estoque e vendas com dashboards intuitivos.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-card border border-border hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Escolha seu Plano</h2>
            <p className="text-muted-foreground text-lg">
              Planos flexíveis para atender seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                id: 'v6',
                name: 'V6',
                price: 99.90,
                icon: '🚗',
                features: [
                  'Integração completa com o sistema ERP (via API)',
                  'Cadastro limitado a 150 produtos',
                  'Acesso a estatísticas/dados básicos',
                  'Acesso ao SAC',
                  'Sem destaque no catálogo',
                  'Baixa preferência na solicitação de modelagem de peças para o simulador'
                ],
              },
              {
                id: 'v8',
                name: 'V8',
                price: 249.90,
                icon: '🏎️',
                popular: true,
                features: [
                  'Integração completa com o sistema ERP (via API)',
                  'Cadastro limitado a 500 produtos',
                  'Acesso a estatísticas/dados intermediários',
                  'Acesso ao SAC',
                  'Destaque no catálogo (Intensidade Média)',
                  'Preferência na solicitação de modelagem de peças para o simulador',
                  'Premiações digitais (selos) para alocar no perfi do lojista por bater metas de vendas'
                ],
              },
              {
                id: 'v12',
                name: 'V12',
                price: 499.90,
                icon: '🏁',
                features: [
                  'Mesmos benefícios do plano V6 e V8',
                  'Premiações digitais (selos) para alocar no perfi do lojista por bater metas de vendas.',
                  'Selo de Empresa PRO',
                  'Acesso a um relatório mensal contendo estatísticas do app (Carros mais personalizados, peças mais vendidas,...)',
                  'Direito a 1 propaganda/mês nos banners espalhados pelo app'
                ],
              },
            ].map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular
                    ? 'border-primary shadow-red bg-card'
                    : 'border-border bg-card'
                } hover:shadow-lg transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">{plan.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-primary hover:bg-primary-hover'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => navigate(`/checkout/${plan.id}`)}
                >
                  Começar Agora
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-card border border-border shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Já possui uma conta?</h2>
            <p className="text-muted-foreground mb-6">
              Entre na plataforma e continue gerenciando seus produtos.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              variant="outline"
            >
              Fazer Login
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Modcar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
