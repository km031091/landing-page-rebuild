import DashboardLayout from "@/components/DashboardLayout";
import { mockAppointments, mockServices } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarDays, Users, Scissors, Clock } from "lucide-react";

const COLORS = ["hsl(38,80%,55%)", "hsl(38,70%,70%)", "hsl(38,90%,40%)", "hsl(30,8%,40%)"];

const Metrics = () => {
  const confirmed = mockAppointments.filter((a) => a.status === "confirmed");
  const totalAppointments = confirmed.length;
  const uniqueClients = new Set(confirmed.map((a) => a.clientName)).size;

  const serviceCounts: Record<string, number> = {};
  confirmed.forEach((a) => {
    serviceCounts[a.serviceName] = (serviceCounts[a.serviceName] || 0) + 1;
  });
  const serviceData = Object.entries(serviceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const topService = serviceData[0]?.name || "-";

  const hourCounts: Record<string, number> = {};
  confirmed.forEach((a) => {
    const hour = a.time.split(":")[0] + ":00";
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const hourData = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  const stats = [
    { label: "Total de agendamentos", value: totalAppointments, icon: CalendarDays },
    { label: "Clientes atendidos", value: uniqueClients, icon: Users },
    { label: "Serviço mais popular", value: topService, icon: Scissors },
    { label: "Total de serviços", value: mockServices.length, icon: Clock },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Métricas</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="glass-card p-4 text-center">
            <s.icon className="mx-auto h-5 w-5 text-primary mb-2" />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Horários mais agendados</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourData}>
              <XAxis dataKey="hour" tick={{ fill: "hsl(30,10%,55%)", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(30,10%,55%)", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(38,80%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-4">Serviços mais solicitados</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={serviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {serviceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Metrics;
