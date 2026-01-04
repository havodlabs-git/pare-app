import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Logo } from "./Logo";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface AuthScreenProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, name: string) => void;
}

export function AuthScreen({ onLogin, onRegister }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData.email, formData.password, formData.name);
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
                <h3 className="text-xl font-semibold mb-2">Conquiste achievements</h3>
                <p className="text-gray-300">Desbloqueie conquistas e suba de nível conforme avança</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-2xl">🤝</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Comunidade de apoio</h3>
                <p className="text-gray-300">Compartilhe sua jornada e receba motivação de outros membros</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/20">
            <p className="text-sm text-gray-400">
              Junte-se a milhares de pessoas que estão transformando suas vidas
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-3xl font-bold">10K+</p>
                <p className="text-sm text-gray-400">Usuários ativos</p>
              </div>
              <div>
                <p className="text-3xl font-bold">500K+</p>
                <p className="text-sm text-gray-400">Dias limpos</p>
              </div>
              <div>
                <p className="text-3xl font-bold">95%</p>
                <p className="text-sm text-gray-400">Taxa de sucesso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className="p-8 bg-white/95 backdrop-blur-sm shadow-2xl">
          <div className="mb-8">
            <div className="flex md:hidden justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {isLogin ? "Bem-vindo de volta!" : "Comece sua jornada"}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? "Entre na sua conta para continuar seu progresso" 
                : "Crie sua conta e transforme seus hábitos"
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Como você se chama?"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-11 h-12"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 pr-11 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-11 h-12"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg"
            >
              {isLogin ? "Entrar" : "Criar conta"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ name: "", email: "", password: "", confirmPassword: "" });
                }}
                className="text-purple-600 font-semibold hover:text-purple-700"
              >
                {isLogin ? "Cadastre-se grátis" : "Faça login"}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-sm text-gray-500 hover:text-gray-700">
                Esqueceu a senha?
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center">
              Ao criar uma conta, você concorda com nossos{" "}
              <a href="#" className="text-purple-600 hover:underline">Termos de Uso</a> e{" "}
              <a href="#" className="text-purple-600 hover:underline">Política de Privacidade</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
