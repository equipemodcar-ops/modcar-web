import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';

export default function SignupSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Cadastro Realizado!</CardTitle>
          <CardDescription>
            Bem-vindo à ModCar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Verifique seu email</h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos um email de confirmação com instruções para criar seu primeiro acesso.
                  Verifique sua caixa de entrada e siga as instruções.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Próximos passos:</h4>
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="font-semibold text-primary">1.</span>
                <span>Confirme seu email clicando no link enviado</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">2.</span>
                <span>Crie sua senha de acesso</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary">3.</span>
                <span>Faça login e comece a cadastrar seus produtos</span>
              </li>
            </ol>
          </div>

          <div className="pt-4">
            <Button
              className="w-full bg-gradient-primary"
              onClick={() => navigate('/login')}
            >
              Ir para Login
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Não recebeu o email? Verifique sua caixa de spam ou entre em contato com o suporte.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
