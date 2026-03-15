import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { availableTimes } from "@/lib/mock-data";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Sparkles, CalendarDays, Clock, User, Search, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
  category?: string;
  user_id: string;
}

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  date: string;
  time: string;
  status: string;
}

type ViewMode = "home" | "booking" | "manage";

const PublicBooking = () => {
  const { slug } = useParams();
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [foundAppointments, setFoundAppointments] = useState<Appointment[]>([]);
  const [searched, setSearched] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!slug) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, business_name")
        .eq("slug", slug)
        .maybeSingle();
      if (profile) {
        setOwnerId(profile.id);
        setBusinessName(profile.business_name);
        const { data: svcs } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", profile.id)
          .order("name");
        if (svcs) setServices(svcs);
      }
    };
    loadProfile();
  }, [slug]);

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setClientName("");
    setClientPhone("");
    setConfirmed(false);
  };

  const handleConfirm = async () => {
    if (!clientName.trim()) {
      toast.error("Digite seu nome");
      return;
    }
    if (!ownerId) return;
    const service = services.find((s) => s.id === selectedService);
    const { error } = await supabase.from("appointments").insert({
      user_id: ownerId,
      client_name: clientName.trim(),
      client_phone: clientPhone || null,
      service_id: selectedService,
      service_name: service?.name || "",
      date: format(selectedDate!, "yyyy-MM-dd"),
      time: selectedTime,
      status: "confirmed",
    });
    if (error) {
      toast.error("Erro ao agendar. Tente novamente.");
      return;
    }
    setConfirmed(true);
    toast.success("Agendamento confirmado!");
  };

  const handleSearch = async () => {
    if (!ownerId || !searchName.trim()) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", ownerId)
      .eq("status", "confirmed")
      .ilike("client_name", `%${searchName}%`);
    setFoundAppointments(data || []);
    setSearched(true);
  };

  const handleCancelAppointment = async (id: string) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setFoundAppointments((prev) => prev.filter((a) => a.id !== id));
    toast.success("Agendamento cancelado");
  };

  if (viewMode === "home") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">CutNow</h1>
          <p className="text-muted-foreground mb-8">{businessName || slug?.replace(/-/g, " ") || "Espaço de Beleza"}</p>
          <div className="space-y-3">
            <Button onClick={() => { resetBooking(); setViewMode("booking"); }} className="w-full bg-gradient-gold text-primary-foreground font-semibold py-6 text-base">
              <CalendarDays className="mr-2 h-5 w-5" /> Agendar horário
            </Button>
            <Button variant="outline" onClick={() => { setSearched(false); setSearchName(""); setViewMode("manage"); }} className="w-full py-6 text-base">
              <Search className="mr-2 h-5 w-5" /> Meus agendamentos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "manage") {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-md mx-auto">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="mb-4 text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <h2 className="text-xl font-bold text-foreground mb-4">Meus agendamentos</h2>
          <div className="flex gap-2 mb-4">
            <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="Seu nome" />
            <Button onClick={handleSearch} className="bg-gradient-gold text-primary-foreground">Buscar</Button>
          </div>
          {searched && foundAppointments.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>
          )}
          {foundAppointments.map((a) => (
            <div key={a.id} className="glass-card p-4 mb-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-foreground">{a.service_name}</p>
                <p className="text-xs text-muted-foreground">{a.date} às {a.time}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => handleCancelAppointment(a.id)}>
                Cancelar
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-md mx-auto">
        <Button variant="ghost" size="sm" onClick={() => setViewMode("home")} className="mb-4 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        {confirmed ? (
          <div className="text-center glass-card p-8">
            <Check className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Confirmado!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {services.find((s) => s.id === selectedService)?.name} — {format(selectedDate!, "dd/MM/yyyy")} às {selectedTime}
            </p>
            <Button onClick={() => setViewMode("home")} className="bg-gradient-gold text-primary-foreground">Voltar ao início</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className={cn("h-1 flex-1 rounded-full", step >= s ? "bg-primary" : "bg-muted")} />
              ))}
            </div>

            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Escolha o serviço</h2>
                <div className="space-y-2">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedService(s.id); setStep(2); }}
                      className={cn(
                        "w-full glass-card p-4 text-left flex justify-between items-center transition-colors",
                        selectedService === s.id && "border-primary"
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.duration}min{s.category ? ` • ${s.category}` : ""}</p>
                      </div>
                      {s.price && <span className="text-sm text-primary font-semibold">R${s.price}</span>}
                    </button>
                  ))}
                  {services.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum serviço disponível.</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Escolha a data</h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => { if (d) { setSelectedDate(d); setStep(3); } }}
                  locale={ptBR}
                  disabled={(date) => date < new Date()}
                  className="glass-card p-3"
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Escolha o horário</h2>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((t) => (
                    <button
                      key={t}
                      onClick={() => { setSelectedTime(t); setStep(4); }}
                      className={cn(
                        "glass-card p-3 text-sm font-mono text-center transition-colors",
                        selectedTime === t ? "border-primary text-primary" : "text-foreground"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Seus dados</h2>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome"
                  className="mb-3"
                />
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Telefone (opcional)"
                  className="mb-4"
                />
                <div className="glass-card p-4 mb-4 text-sm space-y-1">
                  <p className="text-muted-foreground flex items-center gap-2"><Sparkles className="h-3.5 w-3.5" /> {services.find((s) => s.id === selectedService)?.name}</p>
                  <p className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> {format(selectedDate!, "dd/MM/yyyy")}</p>
                  <p className="text-muted-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {selectedTime}</p>
                </div>
                <Button onClick={handleConfirm} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
                  Confirmar agendamento
                </Button>
              </div>
            )}

            {step > 1 && !confirmed && (
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="mt-4 text-muted-foreground">
                Voltar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;
