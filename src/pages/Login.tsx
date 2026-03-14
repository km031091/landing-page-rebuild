import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("beauty_logged_in", "true");
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      toast.error("Preencha todos os campos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm glass-card p-8">
        <h1 className="text-2xl font-bold text-center text-gradient-gold mb-2">AgendaBeauty</h1>
        <h2 className="text-center text-muted-foreground mb-6">Entrar na sua conta</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground font-semibold">Entrar</Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Não tem conta?{" "}
          <Link to="/register" className="text-primary hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
