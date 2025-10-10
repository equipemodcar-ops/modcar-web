import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Ban, CheckCircle, MessageCircle, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  address: string | null;
  status: string;
  last_access_at: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  product_id: string;
  quantity: number;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [blockReason, setBlockReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setCustomerOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar histórico",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filterCustomers = () => {
    if (!searchTerm) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.cpf?.includes(searchTerm)
    );

    setFilteredCustomers(filtered);
  };

  const toggleCustomerStatus = async (customer: Customer, reason?: string) => {
    const newStatus = customer.status === "active" ? "blocked" : "active";

    try {
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === "blocked") {
        updateData.blocked_at = new Date().toISOString();
        updateData.blocked_reason = reason || null;
      } else {
        updateData.blocked_at = null;
        updateData.blocked_reason = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", customer.id);

      if (error) throw error;

      toast({
        title: newStatus === "blocked" ? "Cliente bloqueado" : "Cliente desbloqueado",
        description: `${customer.name} foi ${newStatus === "blocked" ? "bloqueado" : "desbloqueado"} com sucesso.`,
      });

      fetchCustomers();
      setShowBlockDialog(false);
      setBlockReason("");
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = (phone: string, customerName: string) => {
    const message = encodeURIComponent(`Olá ${customerName}, tudo bem?`);
    window.open(`https://wa.me/55${phone.replace(/\D/g, "")}?text=${message}`, "_blank");
  };

  const showCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await fetchCustomerOrders(customer.id);
    setShowDetailsDialog(true);
  };

  const getLastAccessText = (lastAccess: string | null) => {
    if (!lastAccess) return "Nunca acessou";
    
    try {
      return formatDistanceToNow(new Date(lastAccess), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-lg bg-gradient-primary animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie seus clientes, visualize histórico de compras e controle acessos
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome, email, telefone ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name || "Sem nome"}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {customer.phone ? (
                          <>
                            <span className="text-sm">{customer.phone}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openWhatsApp(customer.phone!, customer.name)}
                            >
                              <MessageCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Não informado</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {customer.cpf || <span className="text-muted-foreground">Não informado</span>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{getLastAccessText(customer.last_access_at)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === "active" ? "default" : "destructive"}>
                        {customer.status === "active" ? "Ativo" : "Bloqueado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showCustomerDetails(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {customer.status === "active" ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowBlockDialog(true);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => toggleCustomerStatus(customer)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear Cliente</DialogTitle>
            <DialogDescription>
              Informe o motivo do bloqueio de {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo do bloqueio</Label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo do bloqueio..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCustomer && toggleCustomerStatus(selectedCustomer, blockReason)}
            >
              Bloquear Cliente
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <p className="font-medium">{selectedCustomer.name || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <p className="font-medium">{selectedCustomer.phone || "Não informado"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CPF</Label>
                  <p className="font-medium">{selectedCustomer.cpf || "Não informado"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Endereço</Label>
                  <p className="font-medium">{selectedCustomer.address || "Não informado"}</p>
                </div>
                {selectedCustomer.status === "blocked" && selectedCustomer.blocked_reason && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Motivo do Bloqueio</Label>
                    <p className="font-medium text-destructive">{selectedCustomer.blocked_reason}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-4">Histórico de Compras</h3>
                {customerOrders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma compra realizada
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {new Date(order.created_at).toLocaleDateString("pt-BR")}
                            </TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(Number(order.total_price))}
                            </TableCell>
                            <TableCell>
                              <Badge>{order.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
