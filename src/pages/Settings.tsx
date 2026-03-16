import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Camera, Share2, Mail, Phone, Trash2, Sun, Moon, Store } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [newPhone, setNewPhone] = useState(profile?.phone || "");
  const [newBusinessName, setNewBusinessName] = useState(profile?.business_name || "");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleShareLink = () => {
    const slug = profile?.slug || "meu-espaco";
    const url = `${window.location.origin}/agendar/${slug}`;
    if (navigator.share) {
      navigator.share({ title: profile?.business_name || "CutNow", url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Erro ao enviar logo. Verifique se o bucket 'logos' existe.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("logos").getPublicUrl(path);

    await supabase
      .from("profiles")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", user.id);

    await refreshProfile();
    toast.success("Logo atualizado!");
    setUploading(false);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("E-mail de confirmação enviado para o novo endereço.");
      setEditEmail(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!user) return;
    await supabase.from("profiles").update({ phone: newPhone }).eq("id", user.id);
    await refreshProfile();
    toast.success("Telefone atualizado!");
    setEditPhone(false);
  };

  const handleDeleteAccount = async () => {
    toast.error("Para excluir sua conta, entre em contato com o suporte.");
    setDeleteConfirm(false);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Configurações</h1>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Logo & Business */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" /> Perfil do estabelecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-24 w-24 border-2 border-border">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt="Logo" />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                    {profile?.business_name?.charAt(0) || "C"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-foreground" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {uploading ? "Enviando..." : "Toque para alterar o logo"}
            </p>
            <p className="text-lg font-semibold text-foreground">{profile?.business_name}</p>
          </CardContent>
        </Card>

        {/* Share Link */}
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleShareLink} className="w-full bg-gradient-gold text-primary-foreground">
              <Share2 className="h-4 w-4 mr-2" /> Compartilhar link de agendamento
            </Button>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">E-mail</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setNewEmail(user?.email || ""); setEditEmail(true); }}>
                Alterar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Telefone</p>
                  <p className="text-xs text-muted-foreground">{profile?.phone || "Não informado"}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setNewPhone(profile?.phone || ""); setEditPhone(true); }}>
                Alterar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? <Moon className="h-4 w-4 text-muted-foreground" /> : <Sun className="h-4 w-4 text-muted-foreground" />}
                <p className="text-sm font-medium text-foreground">
                  {theme === "dark" ? "Modo escuro" : "Modo claro"}
                </p>
              </div>
              <Switch checked={theme === "light"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" /> Excluir minha conta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Email Dialog */}
      <Dialog open={editEmail} onOpenChange={setEditEmail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar e-mail</DialogTitle>
            <DialogDescription>Um e-mail de confirmação será enviado.</DialogDescription>
          </DialogHeader>
          <div>
            <Label>Novo e-mail</Label>
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1" type="email" />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateEmail} className="bg-gradient-gold text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Phone Dialog */}
      <Dialog open={editPhone} onOpenChange={setEditPhone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar telefone</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Telefone</Label>
            <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="mt-1" placeholder="(00) 00000-0000" />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdatePhone} className="bg-gradient-gold text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>Essa ação é irreversível. Todos os seus dados serão perdidos.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Settings;
