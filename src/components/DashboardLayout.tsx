import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, Scissors, BarChart3, LogOut, Link2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navItems = [
  { label: "Agenda", icon: CalendarDays, path: "/dashboard" },
  { label: "Serviços", icon: Scissors, path: "/dashboard/services" },
  { label: "Métricas", icon: BarChart3, path: "/dashboard/metrics" },
  { label: "Assinatura", icon: Crown, path: "/dashboard/subscription" },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("barber_logged_in");
    toast.success("Desconectado");
    navigate("/login");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/barbearia/minha-barbearia`);
    toast.success("Link copiado!");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card p-4 gap-1">
        <h1 className="text-xl font-bold text-gradient-gold mb-6 px-2">CutNow</h1>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location.pathname === item.path
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <div className="mt-auto space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleCopyLink}>
            <Link2 className="h-4 w-4 mr-2" /> Copiar link
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around border-t border-border bg-card py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs",
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-auto">{children}</main>
    </div>
  );
};

export default DashboardLayout;
