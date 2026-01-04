import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Logo } from "./Logo";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export function AuthScreen() {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block text-white space-y-8">
          <div className="flex items-center gap-4">
            <Logo size="xl" />
            <div>
              <h1 className="text-6xl font-bold mb-2">Pare!</h1>
              <p className="text-xl text-gray-300">Transforme seus hábitos</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Defina seus objetivos</h3>
                <p className="text-gray-300">Escolha o hábito que deseja mudar e acompanhe seu progresso diário</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Conquiste suas metas</h3>
                <p className="text-gray-300">Ganhe pontos, suba de nível e desbloqueie conquistas</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Comunidade de apoio</h3>
                <p className="text-gray-300">Compartilhe sua jornada e inspire outras pessoas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm">
          <div className="md:hidden mb-6 text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold mb-1">Pare!</h1>
            <p className="text-gray-600">Transforme seus hábitos</p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? "Entre para continuar sua jornada"
                : "Comece sua transformação hoje"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Digite seu nome"
                    className="pl-10"
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
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
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
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10"
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
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                "Processando..."
              ) : (
                <>
                  {isLogin ? "Entrar" : "Criar conta"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 font-medium"
              disabled={isSubmitting}
            >
              {isLogin
                ? "Não tem uma conta? Cadastre-se"
                : "Já tem uma conta? Faça login"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
