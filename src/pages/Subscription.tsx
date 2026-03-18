import { useState, useEffect } from "react";
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

  // Trial state from DB
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(3);
  const [trialExpired, setTrialExpired] = useState(false);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscribed(data.subscribed);
      setSubscriptionEnd(data.subscription_end);
    } catch (err) {
      console.error("Error checking subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    checkSubscription();

    // Load trial info from DB
    const loadTrial = async () => {
      const { data } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
      if (data && data.status === "trial" && data.trial_start) {
        const elapsed = Math.floor((Date.now() - new Date(data.trial_start).getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysRemaining(Math.max(0, 3 - elapsed));
        if (elapsed >= 3) setTrialExpired(true);
      }
    };
    loadTrial();

    // Auto-refresh every 60s
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Handle return from checkout
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Pagamento realizado! Sua assinatura está ativa.");
      checkSubscription();
    }
    if (searchParams.get("canceled") === "true") {
      toast.info("Checkout cancelado.");
    }
  }, [searchParams]);

  const handleSubscribe = () => {
    window.open("https://buy.stripe.com/SEU_LINK_AQUI", "_blank");
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
      console.error("Portal error:", err);
      toast.error("Erro ao abrir portal. Tente novamente.");
    } finally {
      setPortalLoading(false);
    }
  };

  const status = subscribed ? "active" : trialExpired ? "expired" : "trial";

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Plano CutNow</h1>
        <p className="text-muted-foreground mb-6 text-center">Gerencie seu negócio de beleza de forma profissional</p>

        {status === "trial" && (
          <div className="glass-card p-4 mb-6 flex items-center gap-3 w-full max-w-md">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Período de teste gratuito</p>
              <p className="text-xs text-muted-foreground">
                {trialDaysRemaining} {trialDaysRemaining === 1 ? "dia" : "dias"} restantes
              </p>
            </div>
          </div>
        )}

        {status === "expired" && (
          <div className="glass-card p-4 mb-6 border-destructive w-full max-w-md">
            <Badge variant="destructive" className="mb-2">
              Expirado
            </Badge>
            <p className="text-sm text-muted-foreground">Seu período de teste encerrou. Assine para continuar.</p>
          </div>
        )}

        {status === "active" && (
          <div className="glass-card p-4 mb-6 w-full max-w-md">
            <Badge className="bg-primary/20 text-primary mb-2">Ativo</Badge>
            <p className="text-sm text-muted-foreground">Sua assinatura está ativa. Aproveite todos os recursos!</p>
            {subscriptionEnd && (
              <p className="text-xs text-muted-foreground mt-1">
                Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        )}

        <div className="glass-card p-6 w-full max-w-md">
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

          {loading ? (
            <Button disabled className="w-full">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verificando...
            </Button>
          ) : !subscribed ? (
            <Button
              onClick={handleSubscribe}
              disabled={checkoutLoading}
              className="w-full bg-gradient-gold text-primary-foreground font-semibold"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Redirecionando...
                </>
              ) : (
                "Assinar agora"
              )}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button disabled className="w-full">
                Assinatura ativa ✓
              </Button>
              <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading} className="w-full">
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Gerenciar assinatura
              </Button>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-3">Cancele quando quiser. Sem fidelidade.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
