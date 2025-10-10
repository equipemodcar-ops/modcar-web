export type PlanType = 'turbo' | 'v6' | 'v12';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  maxProducts: number;
  maxUsers: number;
  features: string[];
  color: string;
  icon: string;
}

export interface PartnerSubscription {
  partnerId: string;
  partnerName: string;
  plan: PlanType;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: string;
  renewalDate: string;
  monthlyRevenue: number;
  productsCount: number;
  usersCount: number;
}

export const PLANS: Record<PlanType, Plan> = {
  turbo: {
    id: 'turbo',
    name: 'Turbo',
    price: 99.90,
    maxProducts: 100,
    maxUsers: 2,
    features: [
      'Até 100 produtos',
      '2 usuários',
      'Importação de planilhas',
      'Suporte por email',
    ],
    color: 'text-blue-600',
    icon: '🚗',
  },
  v6: {
    id: 'v6',
    name: 'V6',
    price: 249.90,
    maxProducts: 500,
    maxUsers: 5,
    features: [
      'Até 500 produtos',
      '5 usuários',
      'Importação de planilhas',
      'API de integração',
      'Suporte prioritário',
      'Relatórios avançados',
    ],
    color: 'text-orange-600',
    icon: '🏎️',
  },
  v12: {
    id: 'v12',
    name: 'V12',
    price: 499.90,
    maxProducts: -1, // Ilimitado
    maxUsers: -1, // Ilimitado
    features: [
      'Produtos ilimitados',
      'Usuários ilimitados',
      'Importação de planilhas',
      'API de integração',
      'Suporte 24/7',
      'Relatórios avançados',
      'Gerente de conta dedicado',
      'Customizações',
    ],
    color: 'text-primary',
    icon: '🏁',
  },
};
