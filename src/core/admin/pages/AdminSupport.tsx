import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SupportTicket {
  id: string;
  partner_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  attachments: string[];
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface PartnerInfo {
  name: string;
  email: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Aberto", variant: "default" },
  in_progress: { label: "Em Andamento", variant: "secondary" },
  resolved: { label: "Resolvido", variant: "outline" },
  closed: { label: "Fechado", variant: "outline" }
};

const priorityMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Baixa", variant: "outline" },
  normal: { label: "Normal", variant: "default" },
  high: { label: "Alta", variant: "secondary" },
  urgent: { label: "Urgente", variant: "destructive" }
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [partners, setPartners] = useState<Record<string, PartnerInfo>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ticketData = data || [];
      setTickets(ticketData);

      // Load partner info
      const partnerIds = [...new Set(ticketData.map(t => t.partner_id))];
      const partnerInfoMap: Record<string, PartnerInfo> = {};

      for (const partnerId of partnerIds) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('id', partnerId)
          .single();

        if (profile) {
          partnerInfoMap[partnerId] = profile;
        }
      }

      setPartners(partnerInfoMap);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar chamados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId: string) => {
    try {
      const updates: any = {};
      if (adminNotes) updates.admin_notes = adminNotes;
      if (newStatus) updates.status = newStatus;

      if (newStatus === 'resolved' || newStatus === 'closed') {
        const { data: { user } } = await supabase.auth.getUser();
        updates.resolved_by = user?.id;
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Chamado atualizado com sucesso!",
      });

      setSelectedTicket(null);
      setAdminNotes("");
      setNewStatus("");
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar chamado.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suporte - Gerenciamento</h1>
        <p className="text-muted-foreground">
          Gerencie todos os chamados de suporte dos vendedores
        </p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum chamado encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{ticket.title}</CardTitle>
                    <CardDescription>
                      <div>
                        Vendedor: {partners[ticket.partner_id]?.name || 'Carregando...'}
                      </div>
                      <div>
                        Criado em {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={priorityMap[ticket.priority]?.variant || "default"}>
                      {priorityMap[ticket.priority]?.label || ticket.priority}
                    </Badge>
                    <Badge variant={statusMap[ticket.status]?.variant || "default"}>
                      {statusMap[ticket.status]?.label || ticket.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descrição:</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Anexos:</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {ticket.attachments.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={url}
                              alt={`Anexo ${index + 1}`}
                              className="w-full h-32 object-cover rounded border"
                            />
                          ) : (
                            <div className="w-full h-32 flex items-center justify-center bg-muted rounded border">
                              <span className="text-sm">Vídeo {index + 1}</span>
                            </div>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {ticket.admin_notes && (
                  <div className="bg-muted p-4 rounded">
                    <h4 className="font-medium mb-2">Resposta da Equipe:</h4>
                    <p className="text-sm whitespace-pre-wrap">{ticket.admin_notes}</p>
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setAdminNotes(ticket.admin_notes || "");
                        setNewStatus(ticket.status);
                      }}
                    >
                      Atualizar Chamado
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Atualizar Chamado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="resolved">Resolvido</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Resposta/Notas</label>
                        <Textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Digite sua resposta ao vendedor..."
                          rows={6}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => handleUpdateTicket(ticket.id)}
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
