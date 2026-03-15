import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const segments = [
  { value: "barbearia", label: "Barbearia" },
  { value: "salao", label: "Salão de Beleza" },
  { value: "studio", label: "Studio" },
  { value: "autonomo", label: "Profissional Autônomo" },
  { value: "outro", label: "Outro" },
];

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !segment) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { business_name: name, segment },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      // Update slug after profile is auto-created
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ slug }).eq("id", user.id);
        // Create subscription entry
        await supabase.from("subscriptions").insert({ user_id: user.id, status: "trial" });
      }
      toast.success("Conta criada com sucesso! Você tem 3 dias de teste grátis.");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass-card p-8">
        <h1 className="text-2xl font-bold text-center text-gradient-gold mb-2">CutNow</h1>
        <h2 className="text-center text-muted-foreground mb-6">Criar conta</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do estabelecimento</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" placeholder="Ex: Studio Ana Beauty" />
          </div>
          <div>
            <Label>Segmento</Label>
            <Select value={segment} onValueChange={setSegment}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o segmento" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            {loading ? "Criando..." : "Começar teste grátis"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-3">3 dias grátis • Sem cartão de crédito</p>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Já tem conta?{" "}
          <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
