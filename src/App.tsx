import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import { Onboarding } from "./components/Onboarding";
import { ModernDashboard } from "./components/ModernDashboard";
import { Achievements } from "./components/Achievements";
import { Stats } from "./components/Stats";
import { Forum } from "./components/Forum";
import Appointments from "./components/Appointments";
import { MotivationalQuotes } from "./components/MotivationalQuotes";
import { PricingPlans } from "./components/PricingPlans";
import { ModuleSelector } from "./components/ModuleSelector";
import { LogoWithText } from "./components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";
import { Home, Award, BarChart3, MessageSquare, LogOut, User, CreditCard, Video } from "lucide-react";
import { useToast } from "./context/ToastContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";

interface User {
  email: string;
  name: string;
  password: string;
  createdAt: string;
}

interface ModuleData {
  moduleId: string;
  startDate: string;
  dayCount: number;
  level: number;
  points: number;
  longestStreak: number;
  currentStreak: number;
  totalRelapses: number;
  lastCheckIn: string;
  relapseHistory: { date: string; daysSinceLast: number }[];
}

interface UserProfile {
  modules: ModuleData[];
  currentModuleId: string;
  plan: "free" | "premium" | "elite";
  planExpiresAt?: string;
}

const USERS_KEY = "pare_users";
const CURRENT_USER_KEY = "pare_current_user";
const USER_PROFILE_PREFIX = "pare_profile_";

const moduleConfig = {
  pornography: {
    name: "Pornografia e Masturbação",
    color: "from-red-500 to-pink-600",
  },
  social_media: {
    name: "Redes Sociais",
    color: "from-blue-500 to-cyan-600",
  },
  smoking: {
    name: "Cigarro",
    color: "from-gray-500 to-slate-600",
  },
  alcohol: {
    name: "Álcool",
    color: "from-amber-500 to-orange-600",
  },
  shopping: {
    name: "Compras Compulsivas",
    color: "from-green-500 to-emerald-600",
  },
};

export default function App() {
  const { user, isAuthenticated, logout: authLogout, loading } = useAuth();
  const toast = useToast();
  const currentUser = user;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`${USER_PROFILE_PREFIX}${currentUser.email}`);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return null;
  });

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showRelapseDialog, setShowRelapseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load user profile when current user changes
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`${USER_PROFILE_PREFIX}${currentUser.email}`);
      if (saved) {
        setUserProfile(JSON.parse(saved));
      } else {
        setUserProfile(null);
      }
    } else {
      setUserProfile(null);
    }
  }, [currentUser]);

  // Auto-increment day count for current module
  useEffect(() => {
    if (!userProfile || !currentUser) return;

    const currentModule = userProfile.modules.find(m => m.moduleId === userProfile.currentModuleId);
    if (!currentModule) return;

    const checkNewDay = () => {
      const lastCheck = new Date(currentModule.lastCheckIn);
      const now = new Date();
      
      // Check if it's a new day
      if (lastCheck.toDateString() !== now.toDateString()) {
        const daysPassed = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysPassed > 0) {
          const newDayCount = currentModule.dayCount + daysPassed;
          const newPoints = currentModule.points + (daysPassed * 10);
          const newLevel = Math.floor(newPoints / 100) + 1;
          const newCurrentStreak = currentModule.currentStreak + daysPassed;
          const newLongestStreak = Math.max(currentModule.longestStreak, newCurrentStreak);

          const updatedModule = {
            ...currentModule,
            dayCount: newDayCount,
            points: newPoints,
            level: newLevel,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastCheckIn: now.toISOString(),
          };

          const updatedProfile = {
            ...userProfile,
            modules: userProfile.modules.map(m => 
              m.moduleId === userProfile.currentModuleId ? updatedModule : m
            ),
          };

          setUserProfile(updatedProfile);
          localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updatedProfile));
          
          toast.success(`🎉 Parabéns! Você completou ${daysPassed} ${daysPassed === 1 ? 'dia' : 'dias'}!`, {
            description: `Continue firme! Você ganhou ${daysPassed * 10} pontos.`,
          });
        }
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000);

    return () => clearInterval(interval);
  }, [userProfile, currentUser]);

  // Save to localStorage whenever userProfile changes
  useEffect(() => {
    if (userProfile && currentUser) {
      localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(userProfile));
    }
  }, [userProfile, currentUser]);

  const handleLogin = (email: string, password: string) => {
    const usersData = localStorage.getItem(USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const userWithoutPassword = { email: user.email, name: user.name, createdAt: user.createdAt };
      setCurrentUser(userWithoutPassword as User);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      toast.success(`Bem-vindo de volta, ${user.name}!`);
    } else {
      toast.error("E-mail ou senha incorretos");
    }
  };

  const handleRegister = (email: string, password: string, name: string) => {
    const usersData = localStorage.getItem(USERS_KEY);
    const users: User[] = usersData ? JSON.parse(usersData) : [];

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      toast.error("Este e-mail já está cadastrado");
      return;
    }

    const newUser: User = {
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const userWithoutPassword = { email: newUser.email, name: newUser.name, createdAt: newUser.createdAt };
    setCurrentUser(userWithoutPassword as User);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    toast.success(`Bem-vindo, ${name}! Sua conta foi criada com sucesso.`);
  };

  const handleLogout = () => {
    authLogout();
    setUserProfile(null);
    toast.info("Você saiu da sua conta");
  };

  const handleFirstModuleSelection = (moduleId: string) => {
    if (!currentUser) return;

    const newModule: ModuleData = {
      moduleId,
      startDate: new Date().toISOString(),
      dayCount: 0,
      level: 1,
      points: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalRelapses: 0,
      lastCheckIn: new Date().toISOString(),
      relapseHistory: [],
    };

    const newProfile: UserProfile = {
      modules: [newModule],
      currentModuleId: moduleId,
      plan: "free",
    };

    setUserProfile(newProfile);
    localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(newProfile));
    toast.success(`Sua jornada começou! Vamos transformar seus hábitos juntos.`);
  };

  const handleAddModule = (moduleId: string) => {
    if (!userProfile || !currentUser) return;

    const maxModules = userProfile.plan === "free" ? 1 : userProfile.plan === "premium" ? 3 : 999;
    
    if (userProfile.modules.length >= maxModules) {
      toast.error("Você atingiu o limite de módulos do seu plano");
      return;
    }

    const newModule: ModuleData = {
      moduleId,
      startDate: new Date().toISOString(),
      dayCount: 0,
      level: 1,
      points: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalRelapses: 0,
      lastCheckIn: new Date().toISOString(),
      relapseHistory: [],
    };

    const updatedProfile = {
      ...userProfile,
      modules: [...userProfile.modules, newModule],
      currentModuleId: moduleId, // Switch to new module
    };

    setUserProfile(updatedProfile);
    toast.success(`Módulo "${moduleConfig[moduleId as keyof typeof moduleConfig].name}" adicionado!`);
  };

  const handleSwitchModule = (moduleId: string) => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      currentModuleId: moduleId,
    };

    setUserProfile(updatedProfile);
    toast.success(`Agora acompanhando: ${moduleConfig[moduleId as keyof typeof moduleConfig].name}`);
  };

  const handleSelectPlan = (plan: "free" | "premium" | "elite") => {
    if (!userProfile) return;

    const updatedProfile = {
      ...userProfile,
      plan,
      planExpiresAt: plan !== "free" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };

    setUserProfile(updatedProfile);
    
    if (plan === "free") {
      toast.info("Plano alterado para Gratuito");
    } else {
      toast.success(`🎉 Bem-vindo ao plano ${plan === "premium" ? "Premium" : "Elite"}!`, {
        description: "Aproveite todos os recursos desbloqueados!",
      });
    }
    
    setActiveTab("dashboard");
  };

  const handleRelapse = () => {
    if (!userProfile || !currentUser) return;

    const currentModule = userProfile.modules.find(m => m.moduleId === userProfile.currentModuleId);
    if (!currentModule) return;

    const newRelapse = {
      date: new Date().toISOString(),
      daysSinceLast: currentModule.currentStreak,
    };

    const updatedModule = {
      ...currentModule,
      currentStreak: 0,
      dayCount: 0,
      totalRelapses: currentModule.totalRelapses + 1,
      relapseHistory: [...currentModule.relapseHistory, newRelapse],
      lastCheckIn: new Date().toISOString(),
    };

    const updatedProfile = {
      ...userProfile,
      modules: userProfile.modules.map(m => 
        m.moduleId === userProfile.currentModuleId ? updatedModule : m
      ),
    };

    setUserProfile(updatedProfile);
    setShowRelapseDialog(false);
    
    toast.info("Recomeço registrado", {
      description: "Não desista! Cada dia é uma nova oportunidade de crescer.",
    });
  };

  const handleReset = () => {
    if (!currentUser) return;

    setUserProfile(null);
    localStorage.removeItem(`${USER_PROFILE_PREFIX}${currentUser.email}`);
    setShowResetDialog(false);
    
    toast.success("Progresso resetado", {
      description: "Começando uma nova jornada!",
    });
  };

  // Show auth screen if no user is logged in
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Show onboarding if user has no profile (first time or after reset)
  if (!userProfile || userProfile.modules.length === 0) {
    return <Onboarding onComplete={handleFirstModuleSelection} />;
  }

  const currentModule = userProfile.modules.find(m => m.moduleId === userProfile.currentModuleId);
  if (!currentModule) return null;

  const config = moduleConfig[currentModule.moduleId as keyof typeof moduleConfig];
  const maxModules = userProfile.plan === "free" ? 1 : userProfile.plan === "premium" ? 3 : 999;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <LogoWithText size="sm" />

            {/* Module Selector */}
            <div className="flex-1 flex justify-center">
              <ModuleSelector
                activeModules={userProfile.modules.map(m => m.moduleId)}
                currentModuleId={userProfile.currentModuleId}
                maxModules={maxModules}
                currentPlan={userProfile.plan}
                onAddModule={handleAddModule}
                onSwitchModule={handleSwitchModule}
                onUpgradePlan={() => setActiveTab("pricing")}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Plan Badge */}
              {userProfile.plan !== "free" && (
                <Badge className={`hidden md:flex ${
                  userProfile.plan === "premium" 
                    ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                    : "bg-gradient-to-r from-amber-500 to-orange-500"
                } text-white border-0`}>
                  {userProfile.plan === "premium" ? "⚡ Premium" : "👑 Elite"}
                </Badge>
              )}

              {/* Stats */}
              <div className="text-right hidden lg:block">
                <p className="text-xs text-gray-500">Nível {currentModule.level} • {currentModule.points} pts</p>
              </div>
              
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline">{currentUser.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 font-normal">{currentUser.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Meu perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("pricing")}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Planos e Assinatura
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Motivational Quote */}
          {activeTab !== "pricing" && <MotivationalQuotes />}

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6 h-12">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Início</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Conquistas</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Fórum</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Sessões</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Planos</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <ModernDashboard
                dayCount={currentModule.dayCount}
                level={currentModule.level}
                points={currentModule.points}
                longestStreak={currentModule.longestStreak}
                currentStreak={currentModule.currentStreak}
                moduleName={config.name}
                moduleColor={config.color}
                onReset={() => setShowResetDialog(true)}
                onRelapse={() => setShowRelapseDialog(true)}
              />
            </TabsContent>

            <TabsContent value="achievements">
              <Achievements
                dayCount={currentModule.dayCount}
                longestStreak={currentModule.longestStreak}
              />
            </TabsContent>

            <TabsContent value="stats">
              <Stats
                dayCount={currentModule.dayCount}
                startDate={currentModule.startDate}
                relapseHistory={currentModule.relapseHistory}
                longestStreak={currentModule.longestStreak}
                currentStreak={currentModule.currentStreak}
                totalRelapses={currentModule.totalRelapses}
              />
            </TabsContent>

            <TabsContent value="forum">
              <Forum />
            </TabsContent>

            <TabsContent value="sessions">
              <Appointments
                userPlan={userProfile.plan}
                onUpgrade={() => setActiveTab("pricing")}
              />
            </TabsContent>

            <TabsContent value="pricing">
              <PricingPlans
                currentPlan={userProfile.plan}
                onSelectPlan={handleSelectPlan}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar todo o progresso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá apagar todos os seus dados de TODOS os módulos, incluindo dias, conquistas, e histórico.
              Você será redirecionado para o onboarding novamente. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Resetar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Relapse Dialog */}
      <AlertDialog open={showRelapseDialog} onOpenChange={setShowRelapseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar recaída?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto irá resetar seu contador de dias e sequência atual do módulo "{config.name}", mas seu histórico e
              conquistas já desbloqueadas serão mantidos. Seus outros módulos não serão afetados. Lembre-se: recaídas fazem parte do
              processo de crescimento. O importante é não desistir!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRelapse}>Registrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
