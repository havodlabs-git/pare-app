import { useState, useEffect, useRef } from "react";
import { useAuth } from "./context/AuthContext";
import { AuthScreen } from "./components/AuthScreen";
import { ModernDashboard } from "./components/ModernDashboard";
import { Achievements, ALL_ACHIEVEMENTS } from "./components/Achievements";
import { Stats } from "./components/Stats";
import { Forum } from "./components/Forum";
import Appointments from "./components/Appointments";
import { MotivationalQuotes } from "./components/MotivationalQuotes";
import { PricingPlans } from "./components/PricingPlans";
import { ModuleSelector } from "./components/ModuleSelector";
import { LogoWithText } from "./components/Logo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./components/ui/alert-dialog";
import { Home, Award, BarChart3, MessageSquare, LogOut, User, CreditCard, Video, MessageCircle, Save, Loader2, Settings, Receipt, ChevronDown, Bell, Shield, Trash2, HelpCircle, Mail, TrendingUp } from "lucide-react";
import Chat from "./components/Chat";
import { useToast } from "./context/ToastContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { UserProfileDrawer } from "./components/UserProfileDrawer";

// Novos componentes comportamentais
import { OnboardingBehavioral, type BehavioralProfile } from "./components/OnboardingBehavioral";
import { HabitSuggestions, type SuggestedHabit } from "./components/HabitSuggestions";
import { WeeklyRoutineSetup, type ScheduledHabit, type Season } from "./components/WeeklyRoutineSetup";
import {
  SeasonDashboard,
  type HabitLog,
  type HabitStatus,
  type Achievement,
  calculatePoints,
  ACHIEVEMENTS_DEFINITIONS,
  getMaxCleanStreak,
} from "./components/SeasonDashboard";
import { ProgressTab } from "./components/ProgressTab";
import { AvatarEspelho } from "./components/AvatarEspelho";
import { api } from "./services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

// Registo de recaída independente (separado dos hábitos)
export interface RelapseLog {
  id: string;
  date: string;       // ISO string do momento do registo
  dateKey: string;    // YYYY-MM-DD — chave do dia
  note?: string;      // nota opcional
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

  // Dados comportamentais (novos)
  behavioralProfile?: BehavioralProfile;
  suggestedHabits?: SuggestedHabit[];
  weeklySchedule?: ScheduledHabit[];
  currentSeason?: Season;
  habitLogs?: HabitLog[];
  relapseLogs?: RelapseLog[];   // recaídas independentes (1 por dia)
  achievements?: Achievement[];

  // Controle do fluxo de onboarding
  onboardingStep?: "behavioral" | "habits" | "routine" | "done";
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const USER_PROFILE_PREFIX = "pare_profile_";

const moduleConfig = {
  pornography: { name: "Pornografia", color: "from-red-500 to-pink-600" },
  social_media: { name: "Redes Sociais", color: "from-blue-500 to-cyan-600" },
  smoking: { name: "Cigarro", color: "from-gray-500 to-slate-600" },
  alcohol: { name: "Álcool", color: "from-amber-500 to-orange-600" },
  shopping: { name: "Compras Compulsivas", color: "from-green-500 to-emerald-600" },
};

// ─── Helpers de Conquistas ────────────────────────────────────────────────────

function checkAchievements(
  logs: HabitLog[],
  prevAchievements: Achievement[],
  relapseLogs: RelapseLog[] = [],
  completedSeasons: number = 0
): Achievement[] {
  const totalDone = logs.filter((l) => l.status === "done").length;

  // Calcular dias limpos consecutivos (sem recaída)
  const relapseDateSet = new Set(relapseLogs.map((r) => r.dateKey));
  const doneDates = [...new Set(logs.filter((l) => l.status === "done").map((l) => l.date.split("T")[0]))].sort();

  // Current clean streak: contar para trás a partir de hoje
  let currentCleanStreak = 0;
  const today = new Date();
  for (let d = new Date(today); ; d.setDate(d.getDate() - 1)) {
    const key = d.toISOString().split("T")[0];
    if (relapseDateSet.has(key)) break;
    // Só contar dias que já passaram ou hoje
    if (d <= today) currentCleanStreak++;
    // Não contar mais que 400 dias para trás
    if (currentCleanStreak > 400) break;
    // Se chegámos antes do primeiro log, parar
    if (doneDates.length > 0 && key < doneDates[0]) break;
    if (doneDates.length === 0 && currentCleanStreak >= 1) break;
  }

  // Verificar semana perfeita (>=7 hábitos feitos numa semana)
  const weekMap = new Map<string, number>();
  logs.filter((l) => l.status === "done").forEach((l) => {
    const d = new Date(l.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];
    weekMap.set(weekKey, (weekMap.get(weekKey) || 0) + 1);
  });
  const hasPerfectWeek = Array.from(weekMap.values()).some((count) => count >= 7);

  return prevAchievements.map((a) => {
    if (a.unlocked) return a;
    let unlocked = false;
    if (a.id === "first_day" && totalDone >= 1) unlocked = true;
    if (a.id === "three_days" && currentCleanStreak >= 3) unlocked = true;
    if (a.id === "first_week" && currentCleanStreak >= 7) unlocked = true;
    if (a.id === "perfect_week" && hasPerfectWeek) unlocked = true;
    if (a.id === "two_weeks" && currentCleanStreak >= 14) unlocked = true;
    if (a.id === "thirty_days" && currentCleanStreak >= 30) unlocked = true;
    if (a.id === "first_season" && completedSeasons >= 1) unlocked = true;
    if (a.id === "ninety_days" && currentCleanStreak >= 90) unlocked = true;
    if (a.id === "three_seasons" && completedSeasons >= 3) unlocked = true;
    if (a.id === "half_year" && currentCleanStreak >= 180) unlocked = true;
    if (a.id === "year_legend" && currentCleanStreak >= 365) unlocked = true;
    return unlocked ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a;
  });
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function App() {
  const { user, isAuthenticated, logout: authLogout, loading, updateUser, refreshUser } = useAuth();
  const toast = useToast();
  const currentUser = user;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`${USER_PROFILE_PREFIX}${currentUser.email}`);
      if (saved) return JSON.parse(saved);
    }
    return null;
  });

  // Inicializar conquistas com a lista completa se ainda não existirem
  const resolvedAchievements: Achievement[] = userProfile?.achievements?.length
    ? userProfile.achievements
    : ALL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showRelapseDialog, setShowRelapseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Profile Drawer state
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Profile & Settings modal states (legado — mantido para compatibilidade)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // User settings
  const [userSettings, setUserSettings] = useState(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`pare_settings_${currentUser.email}`);
      if (saved) return { notifications: { dailyReminders: true, motivationalMessages: true, achievementUnlocked: true }, privacy: { profileVisibleInForum: true, showDaysInProfile: true }, ...JSON.parse(saved) };
    }
    return { notifications: { dailyReminders: true, motivationalMessages: true, achievementUnlocked: true }, privacy: { profileVisibleInForum: true, showDaysInProfile: true } };
  });

  // Feature Flags da plataforma
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(() => {
    const cached = localStorage.getItem('pare_feature_flags');
    return cached ? JSON.parse(cached) : { avatarEspelhoEnabled: true };
  });

  // Carregar feature flags do backend
  useEffect(() => {
    api.getFeatureFlags().then((res: any) => {
      if (res?.data?.flags) {
        setFeatureFlags(res.data.flags);
        localStorage.setItem('pare_feature_flags', JSON.stringify(res.data.flags));
      }
    }).catch(() => {
      // Silencioso — usar cache ou defaults
    });
  }, []);

  // Refresh user data from backend on mount to sync plan changes
  useEffect(() => {
    if (isAuthenticated && refreshUser) {
      refreshUser();
    }
  }, [isAuthenticated]);

  // Carregar perfil quando o utilizador muda — tenta localStorage primeiro, depois backend
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`${USER_PROFILE_PREFIX}${currentUser.email}`);
      let profile = saved ? JSON.parse(saved) : null;
      // Sincronizar plano com o backend
      if (profile && currentUser.plan && profile.plan !== currentUser.plan) {
        profile = { ...profile, plan: currentUser.plan, planExpiresAt: currentUser.planExpiresAt || undefined };
        localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(profile));
      }
      if (profile) {
        setUserProfile(profile);
        setLoadingProfile(false);
      } else {
        // Sem dados locais — buscar do backend (outro navegador)
        setLoadingProfile(true);
        // Garantir que o token está actualizado antes da chamada
        const token = localStorage.getItem('pare_token');
        if (token) api.token = token;
        api.getAppData().then((res: any) => {
          if (res?.data && res.data.onboardingStep) {
            const remoteProfile = res.data;
            // Sincronizar plano
            if (currentUser.plan && remoteProfile.plan !== currentUser.plan) {
              remoteProfile.plan = currentUser.plan;
              remoteProfile.planExpiresAt = currentUser.planExpiresAt || undefined;
            }
            localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(remoteProfile));
            setUserProfile(remoteProfile);
          } else {
            // Backend retornou data:null — utilizador novo, vai para onboarding
            setUserProfile(null);
          }
        }).catch(() => {
          // Erro na chamada — utilizador novo ou sem conexão
          setUserProfile(null);
        }).finally(() => {
          setLoadingProfile(false);
        });
      }
      const savedSettings = localStorage.getItem(`pare_settings_${currentUser.email}`);
      if (savedSettings) {
        setUserSettings((prev: any) => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } else {
      setUserProfile(null);
      setLoadingProfile(false);
    }
  }, [currentUser]);

  // Auto-incremento de dias (compatibilidade com módulos legados)
  useEffect(() => {
    if (!userProfile || !currentUser) return;
    const currentModule = userProfile.modules?.find((m) => m.moduleId === userProfile.currentModuleId);
    if (!currentModule) return;

    const checkNewDay = () => {
      const lastCheck = new Date(currentModule.lastCheckIn);
      const now = new Date();
      if (lastCheck.toDateString() !== now.toDateString()) {
        const daysPassed = Math.floor((now.getTime() - lastCheck.getTime()) / (1000 * 60 * 60 * 24));
        if (daysPassed > 0) {
          const updatedModule = {
            ...currentModule,
            dayCount: currentModule.dayCount + daysPassed,
            points: currentModule.points + daysPassed * 10,
            level: Math.floor((currentModule.points + daysPassed * 10) / 100) + 1,
            currentStreak: currentModule.currentStreak + daysPassed,
            longestStreak: Math.max(currentModule.longestStreak, currentModule.currentStreak + daysPassed),
            lastCheckIn: now.toISOString(),
          };
          const updatedProfile = {
            ...userProfile,
            modules: userProfile.modules.map((m) =>
              m.moduleId === userProfile.currentModuleId ? updatedModule : m
            ),
          };
          setUserProfile(updatedProfile);
          localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updatedProfile));
        }
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000);
    return () => clearInterval(interval);
  }, [userProfile?.currentModuleId, currentUser]);

  // Persistir perfil — localStorage + backend
  const syncTimeoutRef = useRef<any>(null);
  useEffect(() => {
    if (userProfile && currentUser) {
      localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(userProfile));
      // Debounce sync com backend (2s) para não sobrecarregar
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        api.saveAppData(userProfile).catch(() => {
          // Silencioso — dados ficam no localStorage como fallback
        });
      }, 2000);
    }
  }, [userProfile, currentUser]);

  // ── Handlers de Onboarding Comportamental ─────────────────────────────────

  const handleBehavioralComplete = (profile: BehavioralProfile, primaryModuleId: string) => {
    if (!currentUser) return;

    const newModule: ModuleData = {
      moduleId: primaryModuleId,
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
      currentModuleId: primaryModuleId,
      plan: "free",
      behavioralProfile: profile,
      onboardingStep: "habits",
      achievements: ACHIEVEMENTS_DEFINITIONS.map((a) => ({ ...a })),
      habitLogs: [],
    };

    setUserProfile(newProfile);
    localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(newProfile));
  };

  const handleHabitsComplete = (habits: SuggestedHabit[]) => {
    if (!userProfile || !currentUser) return;
    const updated: UserProfile = {
      ...userProfile,
      suggestedHabits: habits,
      onboardingStep: "routine",
    };
    setUserProfile(updated);
    localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updated));
  };

  const handleRoutineComplete = (schedule: ScheduledHabit[], season: Season) => {
    if (!userProfile || !currentUser) return;
    const updated: UserProfile = {
      ...userProfile,
      weeklySchedule: schedule,
      currentSeason: season,
      onboardingStep: "done",
    };
    setUserProfile(updated);
    localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updated));
    toast.success("Sua jornada começa agora! Boa sorte na sua temporada!");
  };

  // ── Handler de Hábito Customizado ─────────────────────────────────────────

  const handleAddCustomHabit = (habit: ScheduledHabit & { isCustom: true; sharedWithCommunity: boolean }) => {
    if (!userProfile || !currentUser) return;
    const season = userProfile.currentSeason;
    if (!season) return;

    // Adicionar o hábito à season atual
    const updatedSeason: Season = {
      ...season,
      habits: [...season.habits, habit],
    };

    // Adicionar também ao weeklySchedule para consistência
    const updatedSchedule = [...(userProfile.weeklySchedule || []), habit];

    const updated: UserProfile = {
      ...userProfile,
      currentSeason: updatedSeason,
      weeklySchedule: updatedSchedule,
    };

    setUserProfile(updated);
    localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updated));

    // Partilhar com a comunidade via backend se solicitado
    if (habit.sharedWithCommunity) {
      const token = localStorage.getItem("pare_auth_token");
      if (token) {
        fetch(`${import.meta.env.VITE_API_URL || "https://pare-app-backend-295077330394.us-central1.run.app"}/api/habits/community`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            habitId: habit.habitId,
            habitName: habit.habitName,
            category: habit.category,
            durationMinutes: habit.durationMinutes,
            daysOfWeek: habit.daysOfWeek,
          }),
        }).catch(() => {}); // falha silenciosa
      }
    }

    toast.success(`Hábito "${habit.habitName}" adicionado à temporada!${
      habit.sharedWithCommunity ? " Partilhado com a comunidade 🌟" : ""
    }`);
  };

  // ── Handlers de Hábitos Diários ───────────────────────────────────────────

  const handleLogHabit = (habitId: string, status: HabitStatus) => {
    if (!userProfile || !currentUser) return;

    const today = new Date().toISOString().split("T")[0];
    const existingLog = (userProfile.habitLogs || []).find(
      (l) => l.habitId === habitId && l.date.split("T")[0] === today
    );
    if (existingLog) return; // já registrado hoje

    const habitName =
      userProfile.weeklySchedule?.find((h) => h.habitId === habitId)?.habitName || habitId;

    const newLog: HabitLog = {
      id: `log_${Date.now()}`,
      habitId,
      habitName,
      date: new Date().toISOString(),
      status,
    };

    const newLogs = [...(userProfile.habitLogs || []), newLog];
    const newAchievements = checkAchievements(newLogs, userProfile.achievements || ACHIEVEMENTS_DEFINITIONS, userProfile.relapseLogs || []);

    // Verificar conquistas novas
    const newlyUnlocked = newAchievements.filter(
      (a, i) => a.unlocked && !(userProfile.achievements || [])[i]?.unlocked
    );
    newlyUnlocked.forEach((a) => {
      toast.success(`Conquista desbloqueada: ${a.name}!`);
    });

    const updated: UserProfile = {
      ...userProfile,
      habitLogs: newLogs,
      achievements: newAchievements,
    };

    setUserProfile(updated);

    if (status === "done") toast.success("+10 pontos! Hábito concluído!");
    else if (status === "skipped") toast.info("Hábito pulado. Amanhã é um novo dia.");
  };

  const handleRegisterRelapse = (_habitId?: string) => {
    if (!userProfile || !currentUser) return;
    const todayKey = new Date().toISOString().split("T")[0];
    const existing = (userProfile.relapseLogs || []).find((r) => r.dateKey === todayKey);
    if (existing) {
      toast.info("Já registaste uma recaída hoje. Amnhã é um novo dia!");
      return;
    }
    const newRelapse: RelapseLog = {
      id: `relapse_${Date.now()}`,
      date: new Date().toISOString(),
      dateKey: todayKey,
    };
    const updated: UserProfile = {
      ...userProfile,
      relapseLogs: [...(userProfile.relapseLogs || []), newRelapse],
    };
    setUserProfile(updated);
    localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updated));
    toast.info("Recaída registada. Reconhecer é o primeiro passo. Continue!");
  };

  // ── Handlers de Perfil e Configurações ──────────────────────────────────

  const handleOpenProfileModal = () => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfilePassword("");
      setProfileConfirmPassword("");
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;
    if (!profileName.trim()) { toast.error("O nome não pode estar vazio"); return; }
    if (profilePassword && profilePassword !== profileConfirmPassword) { toast.error("As senhas não coincidem"); return; }
    if (profilePassword && profilePassword.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); return; }
    setProfileSaving(true);
    try {
      const api = (await import("./services/api")).default;
      if (profileName !== currentUser.name) {
        await api.updateProfile({ name: profileName });
        if (updateUser) updateUser({ name: profileName });
      }
      if (profilePassword) await api.changePassword("", profilePassword);
      toast.success("Perfil atualizado com sucesso!");
      setShowProfileModal(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar perfil");
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Handlers Legados ──────────────────────────────────────────────────────

  const handleLogout = () => {
    authLogout();
    setUserProfile(null);
    toast.info("Você saiu da sua conta");
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
      currentModuleId: moduleId,
    };
    setUserProfile(updatedProfile);
    toast.success(`Módulo "${moduleConfig[moduleId as keyof typeof moduleConfig]?.name}" adicionado!`);
  };

  const handleSwitchModule = (moduleId: string) => {
    if (!userProfile) return;
    setUserProfile({ ...userProfile, currentModuleId: moduleId });
    toast.success(`Agora acompanhando: ${moduleConfig[moduleId as keyof typeof moduleConfig]?.name}`);
  };

  const handleSelectPlan = (plan: "free" | "premium" | "elite") => {
    if (!userProfile) return;
    const updatedProfile = {
      ...userProfile,
      plan,
      planExpiresAt:
        plan !== "free"
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
    };
    setUserProfile(updatedProfile);
    if (plan === "free") {
      toast.info("Plano alterado para Gratuito");
    } else {
      toast.success(`Bem-vindo ao plano ${plan === "premium" ? "Premium" : "Elite"}!`);
    }
    setActiveTab("dashboard");
  };

  const handleRelapse = () => {
    if (!userProfile || !currentUser) return;
    const currentModule = userProfile.modules.find((m) => m.moduleId === userProfile.currentModuleId);
    if (!currentModule) return;
    const newRelapse = { date: new Date().toISOString(), daysSinceLast: currentModule.currentStreak };
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
      modules: userProfile.modules.map((m) =>
        m.moduleId === userProfile.currentModuleId ? updatedModule : m
      ),
    };
    setUserProfile(updatedProfile);
    setShowRelapseDialog(false);
    toast.info("Recomeço registrado. Não desista!");
  };

  const handleReset = () => {
    if (!currentUser) return;
    setUserProfile(null);
    localStorage.removeItem(`${USER_PROFILE_PREFIX}${currentUser.email}`);
    setShowResetDialog(false);
    toast.success("Progresso resetado. Começando uma nova jornada!");
  };

  // ── Loading ───────────────────────────────────────────────────────────────

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

  // ── Loading enquanto busca dados do backend ──────────────────────────────
  if (loadingProfile || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-violet-300/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-400 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <p className="text-white/80 text-lg font-medium">Carregando seus dados...</p>
          <p className="text-white/40 text-sm mt-1">Sincronizando com o servidor</p>
        </div>
      </div>
    );
  }

  // ── Fluxo de Onboarding Comportamental ────────────────────────────────────

  // Sem perfil ou onboarding não iniciado → Onboarding Comportamental (8 etapas)
  if (!userProfile || !userProfile.onboardingStep) {
    return (
      <OnboardingBehavioral
        onComplete={handleBehavioralComplete}
      />
    );
  }

  // Etapa de sugestão de hábitos
  if (userProfile.onboardingStep === "habits" && userProfile.behavioralProfile) {
    return (
      <HabitSuggestions
        profile={userProfile.behavioralProfile}
        onComplete={handleHabitsComplete}
      />
    );
  }

  // Etapa de criação da rotina semanal
  if (
    userProfile.onboardingStep === "routine" &&
    userProfile.suggestedHabits &&
    userProfile.suggestedHabits.length > 0
  ) {
    return (
      <WeeklyRoutineSetup
        habits={userProfile.suggestedHabits}
        onComplete={handleRoutineComplete}
      />
    );
  }

  // ── Dashboard Principal ───────────────────────────────────────────────────

  const currentModule = userProfile.modules?.find((m) => m.moduleId === userProfile.currentModuleId);
  if (!currentModule) return null;

  const config = moduleConfig[currentModule.moduleId as keyof typeof moduleConfig] || {
    name: "Hábito",
    color: "from-purple-500 to-pink-600",
  };
  const maxModules = userProfile.plan === "free" ? 1 : userProfile.plan === "premium" ? 3 : 999;

  // Calcular pontos comportamentais
  const behavioralPoints = calculatePoints(userProfile.habitLogs || []);

  // Se tem temporada ativa e está no modo "done", mostrar o SeasonDashboard
  // como aba integrada no dashboard principal
  const hasSeason =
    userProfile.onboardingStep === "done" &&
    userProfile.currentSeason &&
    userProfile.behavioralProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <LogoWithText size="sm" />

            <div className="flex-1 flex justify-center">
              <ModuleSelector
                activeModules={userProfile.modules.map((m) => m.moduleId)}
                currentModuleId={userProfile.currentModuleId}
                maxModules={maxModules}
                currentPlan={userProfile.plan}
                onAddModule={handleAddModule}
                onSwitchModule={handleSwitchModule}
                onUpgradePlan={() => setActiveTab("pricing")}
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Bloco Plano + Nível (empilhado em coluna) */}
              {userProfile.plan !== "free" && (
                <div className="hidden md:flex flex-col items-end gap-0.5">
                  <Badge
                    className={`${
                      userProfile.plan === "premium"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                    } text-white border-0 text-[11px] px-2 py-0.5 h-auto`}
                  >
                    {userProfile.plan === "premium" ? "Premium" : "Elite"}
                  </Badge>
                  <p className="text-[11px] text-gray-500 whitespace-nowrap leading-tight">
                    Nível {behavioralPoints.currentLevel} — {behavioralPoints.levelName}
                  </p>
                  <p className="text-[11px] text-gray-400 whitespace-nowrap leading-tight">
                    {behavioralPoints.totalPoints} pts
                  </p>
                </div>
              )}

              {/* Divisor vertical */}
              {userProfile.plan !== "free" && (
                <div className="hidden md:block w-px h-8 bg-gray-200" />
              )}

              {/* Botão do utilizador — abre o drawer */}
              <button
                onClick={() => setShowProfileDrawer(true)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                  {userProfile.behavioralProfile?.avatar || currentUser?.avatar ? (
                    <img src={userProfile.behavioralProfile?.avatar || currentUser?.avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <span className="hidden md:inline font-medium text-sm text-gray-700 max-w-[130px] truncate">{currentUser?.name}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:inline flex-shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {activeTab !== "pricing" && <MotivationalQuotes />}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 mb-6 h-12">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Início</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Progresso</span>
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
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Planos</span>
              </TabsTrigger>
            </TabsList>

            {/* ── Início ─────────────────────────────────────────────────────── */}
            <TabsContent value="dashboard">
              {hasSeason ? (
                <div className="space-y-6">
                {featureFlags.avatarEspelhoEnabled !== false && (
                <AvatarEspelho
                  habitLogs={userProfile.habitLogs || []}
                  relapseLogs={userProfile.relapseLogs || []}
                  seasonStartDate={userProfile.currentSeason!.startDate}
                  seasonDurationDays={userProfile.currentSeason!.durationDays}
                  userAvatar={userProfile.behavioralProfile?.avatar || (currentUser as any)?.avatar}
                  userName={(currentUser as any)?.name || "Usuário"}
                  achievements={resolvedAchievements}
                  onOpenForum={() => setActiveTab("forum")}
                  onOpenAchievements={() => setActiveTab("achievements")}
                />
                )}
                <SeasonDashboard
                  season={userProfile.currentSeason!}
                  profile={userProfile.behavioralProfile!}
                  logs={userProfile.habitLogs || []}
                  relapseLogs={userProfile.relapseLogs || []}
                  points={behavioralPoints}
                  achievements={userProfile.achievements || ACHIEVEMENTS_DEFINITIONS}
                  onLogHabit={handleLogHabit}
                  onRegisterRelapse={handleRegisterRelapse}
                  onViewForum={() => setActiveTab("forum")}
                  onViewStats={() => setActiveTab("stats")}
                  onAddCustomHabit={handleAddCustomHabit}
                />
                </div>
              ) : (
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
              )}
            </TabsContent>

            {/* ── Progresso ───────────────────────────────────────────────────── */}
            <TabsContent value="progress">
              {hasSeason ? (
                <ProgressTab
                  season={userProfile.currentSeason!}
                  profile={userProfile.behavioralProfile!}
                  logs={userProfile.habitLogs || []}
                  relapseLogs={userProfile.relapseLogs || []}
                  onLogHabit={handleLogHabit}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-gray-600 font-semibold mb-2">Sem temporada ativa</h3>
                  <p className="text-gray-400 text-sm">Complete o onboarding comportamental para ver o seu progresso detalhado.</p>
                </div>
              )}
            </TabsContent>

            {/* ── Conquistas ──────────────────────────────────────────────────── */}
            <TabsContent value="achievements">
              {hasSeason ? (
                <Achievements achievements={resolvedAchievements} />
              ) : (
                <Achievements
                  dayCount={currentModule.dayCount}
                  longestStreak={currentModule.longestStreak}
                />
              )}
            </TabsContent>

            {/* ── Stats ───────────────────────────────────────────────────────── */}
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

            {/* ── Fórum ───────────────────────────────────────────────────────── */}
            <TabsContent value="forum">
              <Forum />
            </TabsContent>

            {/* ── Sessões ─────────────────────────────────────────────────────── */}
            <TabsContent value="sessions">
              <Appointments
                userPlan={userProfile.plan}
                onUpgrade={() => setActiveTab("pricing")}
              />
            </TabsContent>

            {/* ── Chat ────────────────────────────────────────────────────────── */}
            <TabsContent value="chat">
              <Chat
                userPlan={userProfile.plan}
                onUpgrade={() => setActiveTab("pricing")}
              />
            </TabsContent>

            {/* ── Planos ──────────────────────────────────────────────────────── */}
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
            <AlertDialogTitle>Reiniciar toda a jornada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá apagar todos os seus dados, incluindo perfil comportamental, hábitos,
              rotina, temporada e histórico. Você passará pelo onboarding novamente. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reiniciar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Profile Edit Modal */}
      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Atualize suas informações pessoais. Deixe os campos de senha em branco para mantê-la.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={currentUser?.email || ""} disabled className="bg-gray-100" />
              <p className="text-xs text-gray-500">O email não pode ser alterado</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Nova Senha (opcional)</Label>
              <Input id="password" type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} placeholder="Deixe em branco para manter a atual" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input id="confirmPassword" type="password" value={profileConfirmPassword} onChange={(e) => setProfileConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" disabled={!profilePassword} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveProfile} disabled={profileSaving}>
              {profileSaving ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>) : (<><Save className="w-4 h-4 mr-2" />Salvar</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />Configurações</DialogTitle>
            <DialogDescription>Personalize sua experiência no Pare!</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2"><Bell className="w-4 h-4" />Notificações</h4>
              <div className="space-y-2 pl-6">
                {[{key:"dailyReminders",label:"Lembretes diários"},{key:"motivationalMessages",label:"Mensagens motivacionais"},{key:"achievementUnlocked",label:"Conquistas desbloqueadas"}].map(({key,label})=>(
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-600">{label}</span>
                    <input type="checkbox" checked={(userSettings as any).notifications[key]}
                      onChange={(e)=>{const s={...userSettings,notifications:{...(userSettings as any).notifications,[key]:e.target.checked}};setUserSettings(s);if(currentUser)localStorage.setItem(`pare_settings_${currentUser.email}`,JSON.stringify(s));}}
                      className="w-4 h-4 accent-purple-600" />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4" />Privacidade</h4>
              <div className="space-y-2 pl-6">
                {[{key:"profileVisibleInForum",label:"Perfil visível no fórum"},{key:"showDaysInProfile",label:"Mostrar dias no perfil"}].map(({key,label})=>(
                  <label key={key} className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-gray-600">{label}</span>
                    <input type="checkbox" checked={(userSettings as any).privacy[key]}
                      onChange={(e)=>{const s={...userSettings,privacy:{...(userSettings as any).privacy,[key]:e.target.checked}};setUserSettings(s);if(currentUser)localStorage.setItem(`pare_settings_${currentUser.email}`,JSON.stringify(s));}}
                      className="w-4 h-4 accent-purple-600" />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2"><HelpCircle className="w-4 h-4" />Suporte</h4>
              <div className="pl-6"><a href="mailto:suporte@pareapp.com.br" className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"><Mail className="w-4 h-4" />suporte@pareapp.com.br</a></div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" />Zona de Perigo</h4>
              <div className="pl-6">
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={()=>{setShowSettingsModal(false);setShowResetDialog(true);}}>
                  <Trash2 className="w-4 h-4 mr-2" />Resetar Todo o Progresso
                </Button>
                <p className="text-xs text-gray-500 mt-2">Esta ação irá apagar todos os seus dados e não pode ser desfeita.</p>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={()=>setShowSettingsModal(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Drawer */}
      <UserProfileDrawer
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        user={{
          name: currentUser?.name || "",
          email: currentUser?.email || "",
          phone: (currentUser as any)?.phone || "",
          avatar: (currentUser as any)?.avatar || "",
          bio: (currentUser as any)?.bio || "",
          plan: userProfile.plan || "free",
          isAdmin: (currentUser as any)?.isAdmin || false,
          isPsychologist: (currentUser as any)?.isPsychologist || false,
        }}
        behavioralProfile={userProfile.behavioralProfile}
        achievements={userProfile.achievements}
        settings={userSettings as any}
        onSaveProfile={async (data) => {
          try {
            const api = (await import("./services/api")).default;
            if (data.name && data.name !== currentUser?.name) {
              await api.updateProfile({ name: data.name });
              if (updateUser) updateUser({ name: data.name });
            }
            // Guardar avatar e bio localmente no perfil
            const updatedProfile = { ...userProfile, ...data };
            setUserProfile(updatedProfile);
            if (currentUser) localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(updatedProfile));
            toast.success("Perfil atualizado com sucesso!");
          } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar perfil");
          }
        }}
        onSaveSettings={(newSettings) => {
          setUserSettings(newSettings as any);
          if (currentUser) localStorage.setItem(`pare_settings_${currentUser.email}`, JSON.stringify(newSettings));
          toast.success("Configurações salvas!");
        }}
        onChangeAddictions={() => {
          // Resetar o onboarding para refazer
          if (currentUser) {
            const resetProfile = { ...userProfile, onboardingStep: undefined, behavioralProfile: undefined, suggestedHabits: undefined, weeklySchedule: undefined, currentSeason: undefined };
            setUserProfile(resetProfile as any);
            localStorage.setItem(`${USER_PROFILE_PREFIX}${currentUser.email}`, JSON.stringify(resetProfile));
            toast.info("Redirecionando para o onboarding...");
          }
        }}
        onUpgradePlan={() => { setActiveTab("pricing"); setShowProfileDrawer(false); }}
        onOpenChat={() => { setActiveTab("chat"); }}
        onOpenAchievements={() => { setActiveTab("achievements"); setShowProfileDrawer(false); }}
        onLogout={handleLogout}
        onResetProgress={() => { setShowResetDialog(true); }}
      />

      {/* Relapse Dialog (legado) */}
      <AlertDialog open={showRelapseDialog} onOpenChange={setShowRelapseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar recaída?</AlertDialogTitle>
            <AlertDialogDescription>
              Isto irá resetar seu contador de dias e sequência atual do módulo "{config.name}".
              Recaídas fazem parte do processo de crescimento. O importante é não desistir!
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
