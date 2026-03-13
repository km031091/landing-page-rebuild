import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && password) {
      localStorage.setItem("barber_logged_in", "true");
      toast.success("Conta criada com sucesso! Você tem 3 dias de teste grátis.");
      navigate("/dashboard");
    } else {
      toast.error("Preencha todos os campos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass-card p-8">
        <h1 className="text-2xl font-bold text-center text-gradient-gold mb-2">CutNow</h1>
        <h2 className="text-center text-muted-foreground mb-6">Criar conta</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da barbearia</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold">
            Começar teste grátis
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
