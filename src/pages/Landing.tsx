import { Scissors, Calendar, BarChart3, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: Calendar, title: "Agendamento Online", desc: "Seus clientes agendam em menos de 30 segundos pelo celular." },
  { icon: Scissors, title: "Cadastro de Serviços", desc: "Cadastre atendentes e outros serviços como preço e duração." },
  { icon: Link2, title: "Link Exclusivo", desc: "Compartilhe seu link no WhatsApp, Instagram e em todas suas redes sociais." },
  { icon: BarChart3, title: "Métricas", desc: "Acompanhe agendamentos, serviços populares e horários de pico." },
];

const planFeatures = [
  "Agendamento online ilimitado",
  "Cadastro de serviços",
  "Link exclusivo para clientes",
  "Dashboard completo",
  "Métricas e relatórios",
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          <span className="text-gradient-gold">CutNow</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
          A plataforma completa para gerenciar sua barbearia. Agendamento online, métricas e muito mais.
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/register")} className="bg-gradient-gold text-primary-foreground font-semibold px-8 py-3 text-base">
            Começar grátis
          </Button>
          <Button variant="outline" onClick={() => navigate("/login")} className="border-border text-foreground px-8 py-3 text-base">
            Entrar
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-gradient-gold">
          Tudo que seu negócio precisa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 text-center">
              <f.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="font-semibold mb-2 text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold text-foreground mb-1">Plano Único</h3>
          <p className="text-3xl font-bold text-gradient-gold mb-1">R$19,90<span className="text-base text-muted-foreground font-normal">/mês</span></p>
          <p className="text-sm text-muted-foreground mb-6">3 dias de teste gratuito</p>
          <ul className="text-left space-y-2 mb-6">
            {planFeatures.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Button onClick={() => navigate("/register")} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            Começar teste grátis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-muted-foreground border-t border-border">
        © 2026 CutNow. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default Landing;
