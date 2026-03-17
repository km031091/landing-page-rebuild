import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";

const features = [
  "Agendamentos ilimitados",
  "Link público exclusivo",
  "Painel de métricas completo",
  "Cadastro de serviços ilimitado",
  "Suporte prioritário",
  "Notificações de agendamento",
  "Multi-segmento (salão, barbearia, studio)",
];

const Subscription = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscribed(data.subscribed ?? false);
      setSubscriptionEnd(data.subscription_end ?? null);
    } catch (err) {
      console.error("Error checking subscription:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Assinatura ativada com sucesso!");
      checkSubscription();
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout cancelado.");
    }
  }, [searchParams, checkSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  const handleSubscribe = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao abrir portal. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Plano CutNow</h1>
        <p className="text-muted-foreground mb-6 text-center">Gerencie seu negócio de beleza de forma profissional</p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Verificando assinatura...
          </div>
        ) : (
          <>
            {subscribed ? (
              <div className="glass-card p-4 mb-6 max-w-md w-full">
                <Badge className="bg-primary/20 text-primary mb-2">Ativo</Badge>
                <p className="text-sm text-muted-foreground">
                  Sua assinatura está ativa.
                  {subscriptionEnd && (
                    <> Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString("pt-BR")}</>
                  )}
                </p>
              </div>
            ) : (
              <div className="glass-card p-4 mb-6 max-w-md w-full border-destructive">
                <Badge variant="destructive" className="mb-2">Sem assinatura</Badge>
                <p className="text-sm text-muted-foreground">Assine para acessar todos os recursos.</p>
              </div>
            )}

            <div className="glass-card p-6 max-w-md w-full">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Plano mensal</h3>
              </div>
              <p className="text-3xl font-bold text-gradient-gold mb-6">
                R$19,90<span className="text-sm text-muted-foreground font-normal">/mês</span>
              </p>

              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {!subscribed ? (
                <Button
                  onClick={handleSubscribe}
                  disabled={checkoutLoading}
                  className="w-full bg-gradient-gold text-primary-foreground font-semibold"
                >
                  {checkoutLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</>
                  ) : (
                    "Assinar agora"
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button disabled className="w-full">
                    <Crown className="h-4 w-4" /> Assinatura ativa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="w-full"
                  >
                    {portalLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Abrindo...</>
                    ) : (
                      <><ExternalLink className="h-4 w-4" /> Gerenciar assinatura</>
                    )}
                  </Button>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-3">Cancele quando quiser. Sem fidelidade.</p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
