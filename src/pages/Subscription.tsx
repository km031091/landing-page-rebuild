import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap } from "lucide-react";
import { getTrialDaysRemaining, getSubscriptionStatus, activateSubscription } from "@/lib/subscription";
import { toast } from "sonner";
import { useState } from "react";

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
  const [status, setStatus] = useState(getSubscriptionStatus());
  const daysRemaining = getTrialDaysRemaining();

  const handleSubscribe = () => {
    activateSubscription();
    setStatus("active");
    toast.success("Assinatura ativada com sucesso!");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-2">Plano CutNow</h1>
      <p className="text-muted-foreground mb-6">Gerencie seu negócio de beleza de forma profissional</p>

      {status === "trial" && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3">
          <Crown className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Período de teste gratuito</p>
            <p className="text-xs text-muted-foreground">
              {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"} restantes
            </p>
          </div>
        </div>
      )}

      {status === "expired" && (
        <div className="glass-card p-4 mb-6 border-destructive">
          <Badge variant="destructive" className="mb-2">Expirado</Badge>
          <p className="text-sm text-muted-foreground">Seu período de teste encerrou. Assine para continuar recebendo agendamentos.</p>
        </div>
      )}

      {status === "active" && (
        <div className="glass-card p-4 mb-6">
          <Badge className="bg-primary/20 text-primary mb-2">Ativo</Badge>
          <p className="text-sm text-muted-foreground">Sua assinatura está ativa. Aproveite todos os recursos!</p>
        </div>
      )}

      <div className="glass-card p-6 max-w-md">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Plano mensal</h3>
        </div>
        <p className="text-3xl font-bold text-gradient-gold mb-6">
          R$29,90<span className="text-sm text-muted-foreground font-normal">/mês</span>
        </p>

        <ul className="space-y-2 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {status !== "active" ? (
          <Button onClick={handleSubscribe} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            Assinar agora
          </Button>
        ) : (
          <Button disabled className="w-full">Assinatura ativa</Button>
        )}

        <p className="text-center text-xs text-muted-foreground mt-3">Cancele quando quiser. Sem fidelidade.</p>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
