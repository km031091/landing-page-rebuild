import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CalendarDays, Clock, User, Sparkles, X, Pencil, Crown, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Appointment {
  id: string;
  client_name: string;
  service_name: string;
  date: string;
  time: string;
  status: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editName, setEditName] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("trial");
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(3);

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
    fetchSubscription();
  }, [user]);

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", user!.id)
      .order("time");
    if (data) setAppointments(data);
  };

  const fetchSubscription = async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    if (data) {
      setSubscriptionStatus(data.status);
      if (data.status === "trial" && data.trial_start) {
        const start = new Date(data.trial_start);
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDaysRemaining(Math.max(0, 3 - elapsed));
        if (elapsed >= 3) setSubscriptionStatus("expired");
      }
    }
  };

  const trialProgress = ((3 - trialDaysRemaining) / 3) * 100;
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayAppointments = appointments
    .filter((a) => a.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleCancel = async (id: string) => {
    await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
    toast.success("Agendamento cancelado");
  };

  const handleEdit = (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (appt) {
      setEditingId(id);
      setEditTime(appt.time);
      setEditName(appt.client_name);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await supabase.from("appointments").update({ time: editTime, client_name: editName }).eq("id", editingId);
    setAppointments((prev) =>
      prev.map((a) => (a.id === editingId ? { ...a, time: editTime, client_name: editName } : a))
    );
    setEditingId(null);
    toast.success("Agendamento atualizado");
  };

  return (
    <DashboardLayout>
      {subscriptionStatus === "trial" && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Teste grátis — {trialDaysRemaining} {trialDaysRemaining === 1 ? "dia" : "dias"} restantes
              </p>
              <Progress value={trialProgress} className="w-40 h-2 mt-1" />
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard/subscription")} className="bg-gradient-gold text-primary-foreground text-xs">
            Assinar
          </Button>
        </div>
      )}

      {subscriptionStatus === "expired" && (
        <div className="glass-card p-4 mb-6 flex items-center justify-between flex-wrap gap-3 border-destructive">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-foreground">Seu teste expirou. Assine para continuar.</p>
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard/subscription")} className="bg-gradient-gold text-primary-foreground text-xs">
            Assinar agora
          </Button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-foreground mb-6">Agenda</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => d && setSelectedDate(d)}
          locale={ptBR}
          className="glass-card p-3"
        />

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {format(selectedDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </h2>
          {dayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum agendamento neste dia.</p>
          ) : (
            dayAppointments.map((a) => (
              <div key={a.id} className={cn("glass-card p-4 flex items-center justify-between", a.status === "cancelled" && "opacity-50")}>
                <div className="flex items-center gap-4">
                  <div className="text-primary font-mono text-sm font-bold">{a.time}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> {a.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> {a.service_name}
                    </p>
                  </div>
                </div>
                {a.status === "confirmed" && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(a.id)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleCancel(a.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {a.status === "cancelled" && <span className="text-xs text-destructive">Cancelado</span>}
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!editingId} onOpenChange={() => setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do cliente</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Horário</Label>
              <Input value={editTime} onChange={(e) => setEditTime(e.target.value)} className="mt-1" placeholder="HH:MM" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit} className="bg-gradient-gold text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Dashboard;
