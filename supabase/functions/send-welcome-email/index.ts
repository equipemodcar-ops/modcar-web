import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  companyName: string;
  plan: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, companyName, plan }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "ModCar <onboarding@resend.dev>",
      to: [email],
      subject: "Bem-vindo à ModCar! 🚗",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #dc2626, #ef4444);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .logo {
                width: 60px;
                height: 60px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: 30px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .plan-badge {
                display: inline-block;
                background: #dc2626;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                margin: 10px 0;
              }
              .info-box {
                background: white;
                border-left: 4px solid #dc2626;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
              }
              .button {
                display: inline-block;
                background: linear-gradient(135deg, #dc2626, #ef4444);
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
              }
              .steps {
                background: white;
                padding: 20px;
                border-radius: 5px;
                margin: 20px 0;
              }
              .step {
                display: flex;
                gap: 15px;
                margin: 15px 0;
              }
              .step-number {
                width: 30px;
                height: 30px;
                background: #dc2626;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                flex-shrink: 0;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">A</div>
              <h1 style="margin: 10px 0;">Bem-vindo à ModCar!</h1>
              <p style="margin: 0; opacity: 0.9;">Sua jornada começa agora</p>
            </div>
            
            <div class="content">
              <h2 style="color: #dc2626; margin-top: 0;">Olá, ${name}! 👋</h2>
              
              <p>
                Ficamos muito felizes em ter você e a <strong>${companyName}</strong> 
                como parte da família ModCar!
              </p>
              
              <div class="info-box">
                <strong>🎯 Plano contratado:</strong>
                <div class="plan-badge">${plan}</div>
              </div>
              
              <div class="steps">
                <h3 style="color: #dc2626; margin-top: 0;">Próximos passos:</h3>
                
                <div class="step">
                  <div class="step-number">1</div>
                  <div>
                    <strong>Confirme seu email</strong>
                    <p style="margin: 5px 0 0 0; color: #6b7280;">
                      Clique no link de confirmação que enviamos para validar sua conta.
                    </p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">2</div>
                  <div>
                    <strong>Crie sua senha de acesso</strong>
                    <p style="margin: 5px 0 0 0; color: #6b7280;">
                      Defina uma senha segura para proteger sua conta.
                    </p>
                  </div>
                </div>
                
                <div class="step">
                  <div class="step-number">3</div>
                  <div>
                    <strong>Comece a cadastrar produtos</strong>
                    <p style="margin: 5px 0 0 0; color: #6b7280;">
                      Acesse a plataforma e comece a gerenciar seus produtos automotivos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${Deno.env.get("SUPABASE_URL")}" class="button">
                  Acessar Plataforma
                </a>
              </div>
              
              <div class="info-box" style="margin-top: 30px;">
                <strong>📧 Seus dados de acesso:</strong>
                <p style="margin: 10px 0 5px 0;">
                  <strong>Email:</strong> ${email}
                </p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                  Use este email para fazer login na plataforma.
                </p>
              </div>
              
              <p style="margin-top: 30px;">
                Se você tiver qualquer dúvida ou precisar de ajuda, nossa equipe de suporte
                está à disposição para auxiliá-lo.
              </p>
              
              <p>
                <strong>Sucesso com seu negócio!</strong><br>
                Equipe ModCar
              </p>
            </div>
            
            <div class="footer">
              <p>
                © 2025 ModCar. Todos os direitos reservados.<br>
                Este é um email automático, por favor não responda.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
