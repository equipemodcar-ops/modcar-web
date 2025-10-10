import { useState, useEffect } from 'react';
import { Plus, Search, Crown, Shield, Zap } from 'lucide-react';
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
import { PLANS, PlanType } from '@/core/types/plan';
import { supabase } from '@/integrations/supabase/client';
import { AddPartnerDialog } from '@/core/admin/components/AddPartnerDialog';

interface PartnerData {
  partnerId: string;
  partnerName: string;
  company: string;
  plan: PlanType;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: string;
  renewalDate: string;
  monthlyRevenue: number;
  productsCount: number;
  usersCount: number;
}


const planIcons = {
  turbo: Zap,
  v6: Shield,
  v12: Crown,
};

export function AdminPartners() {
  const [search, setSearch] = useState('');
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadPartners = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_subscriptions')
        .select(`
          *,
          profiles!partner_id (
            name,
            email,
            company
          )
        `);

      if (error) throw error;

      const formattedPartners: PartnerData[] = (data || []).map((sub: any) => ({
        partnerId: sub.partner_id,
        partnerName: sub.profiles?.name || 'Sem nome',
        company: sub.profiles?.company || 'Sem empresa',
        plan: sub.plan as PlanType,
        status: sub.status,
        startDate: sub.start_date,
        renewalDate: sub.renewal_date,
        monthlyRevenue: parseFloat(sub.monthly_revenue),
        productsCount: sub.products_count,
        usersCount: sub.users_count,
      }));

      setPartners(formattedPartners);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const activePartners = partners.filter(p => p.status === 'active').length;
  const totalRevenue = partners
    .filter(p => p.status === 'active')
    .reduce((acc, p) => acc + p.monthlyRevenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Gerencie fornecedores e seus planos</p>
        </div>
        <Button 
          className="bg-gradient-primary hover:bg-primary-hover"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Total de Fornecedores</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{partners.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Fornecedores Ativos</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{activePartners}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Receita Mensal</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">R$ {totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Receita Anual</p>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">R$ {(totalRevenue * 12).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Produtos</TableHead>
                <TableHead>Usuários</TableHead>
                <TableHead>Receita Mensal</TableHead>
                <TableHead>Renovação</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : partners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum fornecedor cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                partners.map((partner) => {
                const plan = PLANS[partner.plan];
                const PlanIcon = planIcons[partner.plan];
                
                return (
                  <TableRow key={partner.partnerId} className="hover:bg-muted/50 cursor-pointer">
                    <TableCell className="font-medium">{partner.partnerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <PlanIcon className={`h-4 w-4 ${plan.color}`} />
                        <span className={`font-medium ${plan.color}`}>{plan.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {partner.productsCount}
                        {plan.maxProducts > 0 && ` / ${plan.maxProducts}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {partner.usersCount}
                        {plan.maxUsers > 0 && ` / ${plan.maxUsers}`}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {partner.monthlyRevenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(partner.renewalDate).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={partner.status === 'active' ? 'default' : 'secondary'}
                        className={partner.status === 'active' ? 'bg-primary' : ''}
                      >
                        {partner.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddPartnerDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSuccess={loadPartners}
      />
    </div>
  );
}
