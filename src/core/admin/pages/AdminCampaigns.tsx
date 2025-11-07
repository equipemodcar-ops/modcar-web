import { useState, useEffect } from 'react';
import { Eye, Check, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/core/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  start_date: string;
  end_date: string;
  status: string;
  impressions: number;
  clicks: number;
  partner_id: string;
  profiles: { name: string } | null;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'secondary' as const },
  approved: { label: 'Aprovado', variant: 'default' as const },
  rejected: { label: 'Rejeitado', variant: 'destructive' as const },
  active: { label: 'Ativo', variant: 'default' as const },
  expired: { label: 'Expirado', variant: 'outline' as const },
};

export function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadCampaigns = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch partner names separately
      const campaignsWithProfiles = await Promise.all(
        (data || []).map(async (campaign) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', campaign.partner_id)
            .single();
          
          return {
            ...campaign,
            profiles: profile ? { name: profile.name } : null,
          };
        })
      );

      setCampaigns(campaignsWithProfiles);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar anúncios',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Anúncio aprovado',
        description: 'O anúncio foi aprovado com sucesso.',
      });
      loadCampaigns();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao aprovar anúncio',
        description: error.message,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedCampaign || !rejectReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Informe o motivo da rejeição',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'rejected',
          rejection_reason: rejectReason,
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      toast({
        title: 'Anúncio rejeitado',
        description: 'O anúncio foi rejeitado.',
      });
      setShowRejectDialog(false);
      setSelectedCampaign(null);
      setRejectReason('');
      loadCampaigns();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao rejeitar anúncio',
        description: error.message,
      });
    }
  };

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: campaigns.length,
    pending: campaigns.filter((c) => c.status === 'pending').length,
    active: campaigns.filter((c) => c.status === 'active' || c.status === 'approved').length,
    totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Anúncios</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e aprove os anúncios dos vendedores
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Anúncios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Anúncios</CardTitle>
            <Input
              placeholder="Buscar anúncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Impressões</TableHead>
                  <TableHead>Cliques</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <img
                        src={campaign.image_url}
                        alt={campaign.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{campaign.title}</TableCell>
                    <TableCell>{campaign.profiles?.name || 'N/A'}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(campaign.start_date), 'dd/MM/yy', { locale: ptBR })} -{' '}
                      {format(new Date(campaign.end_date), 'dd/MM/yy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{campaign.impressions.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{campaign.clicks.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[campaign.status as keyof typeof statusConfig].variant}>
                        {statusConfig[campaign.status as keyof typeof statusConfig].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {campaign.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(campaign.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowRejectDialog(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição para o vendedor
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
