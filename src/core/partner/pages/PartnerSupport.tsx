import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddSupportTicketDialog } from "../components/AddSupportTicketDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  attachments: string[];
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
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

export default function PartnerSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
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

  useEffect(() => {
    loadTickets();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suporte</h1>
          <p className="text-muted-foreground">
            Gerencie seus chamados de suporte
          </p>
        </div>
        <AddSupportTicketDialog onSuccess={loadTickets} />
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum chamado encontrado. Crie um novo chamado para solicitar ajuda.
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
                      Criado em {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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
                    <div className="grid grid-cols-3 gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
