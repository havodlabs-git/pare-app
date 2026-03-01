import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Logo } from "./Logo";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Target, Trophy, Users, Stethoscope, KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PsychologistPartnerForm } from "./PsychologistPartnerForm";
import { OTPVerification } from "./OTPVerification";
import api from "../services/api";

type AuthMode = "login" | "register" | "otp-login";

export function AuthScreen() {
  const { login, register, loading, updateUser } = useAuth();
  const toast = useToast();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isLogin = authMode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!isLogin && !formData.name) {
      toast.error("Digite seu nome");
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          toast.success("Login realizado com sucesso!");
        } else {
          toast.error(result.message || "Erro ao fazer login");
        }
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          toast.success("Conta criada com sucesso!");
        } else {
          toast.error(result.message || "Erro ao criar conta");
        }
      }
    } catch (error) {
      toast.error("Erro ao processar requisição");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error("Digite seu email");
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Digite um email válido");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/otp/send", {
        email: formData.email,
        purpose: "login",
      });

      if (response.data.success) {
        toast.success("Código enviado para seu email!");
        setOtpEmail(formData.email);
        setAuthMode("otp-login");
        
        // Em desenvolvimento, mostrar o código no console
        if (response.data.devCode) {
          console.log("DEV OTP Code:", response.data.devCode);
          toast.info(`Código de teste: ${response.data.devCode}`);
        }
      }
    } catch (error: any) {
      console.error("OTP send error:", error);
      const message = error.response?.data?.message || error.message || "Erro ao enviar código";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPVerified = (data: { user: any; token: string }) => {
    // Salvar token e atualizar estado de autenticação
    if (data.token) {
      api.setToken(data.token);
      localStorage.setItem("pare_current_user", data.user.email);
    }
    
    // Recarregar a página para atualizar o estado de autenticação
    window.location.reload();
  };

  // Se estiver mostrando o formulário de psicólogo parceiro
  if (showPartnerForm) {
    return <PsychologistPartnerForm onBack={() => setShowPartnerForm(false)} />;
  }

  // Se estiver na tela de verificação OTP
  if (authMode === "otp-login" && otpEmail) {
    return (
      <OTPVerification
        email={otpEmail}
        purpose="login"
        onVerified={handleOTPVerified}
        onBack={() => {
          setAuthMode("login");
          setOtpEmail("");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-10">
          <div className="flex items-center gap-4">
            <Logo size="xl" />
            <div>
              <h1 className="text-5xl font-bold text-foreground tracking-tight">Pare!</h1>
              <p className="text-lg text-muted-foreground mt-1">Transforme seus hábitos</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Acompanhe seu progresso</h3>
                <p className="text-muted-foreground">Visualize sua evolução diária e mantenha o foco nos seus objetivos</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Conquiste metas</h3>
                <p className="text-muted-foreground">Sistema de recompensas e níveis para manter sua motivação</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Comunidade de apoio</h3>
                <p className="text-muted-foreground">Conecte-se com outros usuários e compartilhe sua jornada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="p-8 bg-card border border-border shadow-sm">
          <div className="md:hidden mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Pare!</h1>
            <p className="text-muted-foreground mt-1">Transforme seus hábitos</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isLogin
                ? "Entre para continuar sua jornada"
                : "Comece sua transformação hoje"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10 h-12 bg-secondary border-border"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-secondary border-border"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 h-12 bg-secondary border-border"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              size="lg"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {/* Login com OTP */}
          {isLogin && (
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 mt-4 border-border hover:bg-secondary"
                onClick={handleOTPLogin}
                disabled={isSubmitting || loading || !formData.email}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enviando código...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-5 w-5" />
                    Entrar com código por email
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(isLogin ? "register" : "login")}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
              disabled={isSubmitting}
            >
              {isLogin
                ? "Não tem uma conta? Cadastre-se"
                : "Já tem uma conta? Faça login"}
            </button>
          </div>

          {/* Link para Psicólogo Parceiro */}
          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setShowPartnerForm(true)}
              className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Stethoscope className="h-5 w-5" />
              <span>Quer se tornar um Psicólogo parceiro?</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
