import { useState, useRef } from "react";
import {
  X, User, CreditCard, Trophy, MessageCircle, Settings,
  Camera, Phone, Mail, Edit3, Save, Loader2, ChevronRight,
  Palette, Eye, RefreshCw, Info, Bell, Shield, Trash2,
  Check, Star, Lock, CheckCircle2, LogOut, ChevronDown,
  Heart, Brain, Zap, Target, Flame
} from "lucide-react";
import type { BehavioralProfile } from "./OnboardingBehavioral";
import type { Achievement } from "./SeasonDashboard";
import { ALL_ACHIEVEMENTS } from "./Achievements";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  plan: "free" | "premium" | "elite";
}

interface UserSettings {
  theme: "light" | "dark" | "purple" | "blue";
  mirrorAvatar: boolean;
  notifications: {
    dailyReminders: boolean;
    motivationalMessages: boolean;
    achievementUnlocked: boolean;
  };
  privacy: {
    profileVisibleInForum: boolean;
    showDaysInProfile: boolean;
  };
}

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserData;
  behavioralProfile?: BehavioralProfile;
  achievements?: Achievement[];
  settings: UserSettings;
  onSaveProfile: (data: Partial<UserData>) => Promise<void>;
  onSaveSettings: (settings: UserSettings) => void;
  onChangeAddictions: () => void;
  onUpgradePlan: () => void;
  onOpenChat: () => void;
  onOpenAchievements: () => void;
  onLogout: () => void;
  onResetProgress: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const THEME_OPTIONS = [
  { id: "light",  label: "Claro",   bg: "bg-white",          border: "border-gray-200", preview: "#f9fafb" },
  { id: "purple", label: "Roxo",    bg: "bg-violet-600",     border: "border-violet-400", preview: "#7c3aed" },
  { id: "blue",   label: "Azul",    bg: "bg-blue-600",       border: "border-blue-400", preview: "#2563eb" },
  { id: "dark",   label: "Escuro",  bg: "bg-gray-900",       border: "border-gray-600", preview: "#111827" },
];

const ADDICTION_LABELS: Record<string, string> = {
  pornography:   "Pornografia",
  social_media:  "Redes Sociais",
  smoking:       "Cigarro",
  alcohol:       "Álcool",
  shopping:      "Compras Compulsivas",
  food:          "Alimentação Compulsiva",
};

const ACHIEVEMENT_POINTS: Record<string, number> = {
  first_day: 10, three_days: 25, first_week: 50, perfect_week: 75,
  two_weeks: 100, thirty_days: 200, first_season: 150, ninety_days: 500,
  three_seasons: 400, half_year: 1000, year_legend: 2000,
};

// ─── Componente Principal ─────────────────────────────────────────────────────

export function UserProfileDrawer({
  isOpen,
  onClose,
  user,
  behavioralProfile,
  achievements,
  settings,
  onSaveProfile,
  onSaveSettings,
  onChangeAddictions,
  onUpgradePlan,
  onOpenChat,
  onOpenAchievements,
  onLogout,
  onResetProgress,
}: UserProfileDrawerProps) {
  const [activeSection, setActiveSection] = useState<"menu" | "dados" | "conquistas" | "configuracoes" | "sobre">("menu");
  const [saving, setSaving] = useState(false);

  // Dados pessoais
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone || "");
  const [editBio, setEditBio] = useState(user.bio || "");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Configurações locais
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);

  const resolvedAchievements: Achievement[] = achievements?.length
    ? achievements
    : ALL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false }));

  const unlockedCount = resolvedAchievements.filter((a) => a.unlocked).length;
  const totalPoints = resolvedAchievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (ACHIEVEMENT_POINTS[a.id] || 0), 0);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveDados = async () => {
    if (!editName.trim()) return;
    if (editPassword && editPassword !== editConfirmPassword) return;
    setSaving(true);
    try {
      await onSaveProfile({
        name: editName,
        phone: editPhone,
        bio: editBio,
        avatar: avatarPreview,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    onSaveSettings(localSettings);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 px-5 pt-10 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar */}
          <div className="flex items-end gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </div>
              {activeSection === "dados" && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md"
                >
                  <Camera className="w-3.5 h-3.5 text-violet-600" />
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-white font-bold text-lg leading-tight truncate">{user.name}</h2>
              <p className="text-white/70 text-sm truncate">{user.email}</p>
              <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                user.plan === "elite"   ? "bg-amber-400 text-amber-900" :
                user.plan === "premium" ? "bg-violet-200 text-violet-800" :
                "bg-white/20 text-white"
              }`}>
                {user.plan === "elite" ? "👑 Elite" : user.plan === "premium" ? "⚡ Premium" : "🌱 Gratuito"}
              </div>
            </div>
          </div>

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-white font-bold text-lg">{unlockedCount}</p>
              <p className="text-white/70 text-xs">Conquistas</p>
            </div>
            <div className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="text-white font-bold text-lg">{totalPoints}</p>
              <p className="text-white/70 text-xs">Pontos</p>
            </div>
          </div>
        </div>

        {/* ── Conteúdo ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Menu Principal ─────────────────────────────────────────────── */}
          {activeSection === "menu" && (
            <div className="p-4 space-y-2">

              {/* Meus Dados */}
              <button
                onClick={() => setActiveSection("dados")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-sm">Meus Dados</p>
                  <p className="text-xs text-gray-500">Email, telefone, foto, interesses</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
              </button>

              {/* Planos */}
              <button
                onClick={onUpgradePlan}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-sm">Planos</p>
                  <p className="text-xs text-gray-500">Plano atual: <span className="font-medium capitalize">{user.plan}</span></p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
              </button>

              {/* Conquistas */}
              <button
                onClick={() => setActiveSection("conquistas")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-sm">Conquistas</p>
                  <p className="text-xs text-gray-500">{unlockedCount} de {resolvedAchievements.length} desbloqueadas</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">{unlockedCount}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </button>

              {/* Chat */}
              <button
                onClick={() => { onOpenChat(); onClose(); }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-sm">Chat</p>
                  <p className="text-xs text-gray-500">Converse com a IA de suporte</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </button>

              {/* Configurações */}
              <button
                onClick={() => setActiveSection("configuracoes")}
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gray-50 hover:bg-pink-50 border border-transparent hover:border-pink-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-pink-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800 text-sm">Configurações</p>
                  <p className="text-xs text-gray-500">Cores, avatar, vícios, sobre mim</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors" />
              </button>

              {/* Separador */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-red-600 text-sm">Sair da Conta</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Meus Dados ─────────────────────────────────────────────────── */}
          {activeSection === "dados" && (
            <div className="p-4 space-y-4">
              <button onClick={() => setActiveSection("menu")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
                <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
              </button>

              <h3 className="text-lg font-bold text-gray-800">Meus Dados</h3>

              {/* Foto de Perfil */}
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Foto de Perfil</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-white">{user.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-100 text-violet-700 text-sm font-medium hover:bg-violet-200 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Alterar foto
                  </button>
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>

              {/* Email (somente leitura) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                  <Lock className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                </div>
              </div>

              {/* Telefone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none"
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
              </div>

              {/* Bio / Sobre mim */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sobre mim</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
                  placeholder="Escreva algo sobre você..."
                />
              </div>

              {/* Interesses (do perfil comportamental) */}
              {behavioralProfile?.interests && behavioralProfile.interests.length > 0 && (
                <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Interesses</p>
                  <div className="flex flex-wrap gap-2">
                    {behavioralProfile.interests.map((interest) => (
                      <span key={interest} className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nova senha */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nova Senha (opcional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  placeholder="Deixe em branco para não alterar"
                />
              </div>
              {editPassword && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirmar Senha</label>
                  <input
                    type="password"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent ${
                      editConfirmPassword && editPassword !== editConfirmPassword ? "border-red-300" : "border-gray-200"
                    }`}
                    placeholder="Confirme a nova senha"
                  />
                  {editConfirmPassword && editPassword !== editConfirmPassword && (
                    <p className="text-xs text-red-500">As senhas não coincidem</p>
                  )}
                </div>
              )}

              {/* Botão Salvar */}
              <button
                onClick={handleSaveDados}
                disabled={saving || (!!editPassword && editPassword !== editConfirmPassword)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity shadow-lg shadow-violet-200"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          )}

          {/* ── Conquistas ─────────────────────────────────────────────────── */}
          {activeSection === "conquistas" && (
            <div className="p-4 space-y-4">
              <button onClick={() => setActiveSection("menu")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
                <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
              </button>

              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Conquistas</h3>
                <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  {unlockedCount}/{resolvedAchievements.length}
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100">
                <div className="flex justify-between text-xs text-amber-700 font-medium mb-2">
                  <span>Progresso</span>
                  <span>{Math.round((unlockedCount / resolvedAchievements.length) * 100)}%</span>
                </div>
                <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                    style={{ width: `${(unlockedCount / resolvedAchievements.length) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2 font-medium">{totalPoints} pontos acumulados</p>
              </div>

              {/* Lista de conquistas */}
              <div className="space-y-2">
                {resolvedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      achievement.unlocked
                        ? "bg-amber-50 border-amber-200"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      achievement.unlocked ? "bg-amber-100" : "bg-gray-100 grayscale"
                    }`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-tight ${achievement.unlocked ? "text-gray-800" : "text-gray-400"}`}>
                        {achievement.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{achievement.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {achievement.unlocked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300" />
                      )}
                      <p className={`text-xs font-bold mt-0.5 ${achievement.unlocked ? "text-amber-600" : "text-gray-400"}`}>
                        +{ACHIEVEMENT_POINTS[achievement.id] || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Configurações ──────────────────────────────────────────────── */}
          {activeSection === "configuracoes" && (
            <div className="p-4 space-y-5">
              <button onClick={() => setActiveSection("menu")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
                <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
              </button>

              <h3 className="text-lg font-bold text-gray-800">Configurações</h3>

              {/* Cores / Tema */}
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-pink-500" />
                  <p className="text-sm font-semibold text-gray-700">Tema de Cores</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setLocalSettings((s) => ({ ...s, theme: theme.id as any }))}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                        localSettings.theme === theme.id ? "border-violet-500 bg-violet-50" : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: theme.preview }} />
                      <span className="text-xs text-gray-600 font-medium">{theme.label}</span>
                      {localSettings.theme === theme.id && (
                        <Check className="w-3 h-3 text-violet-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Espelho Avatar */}
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Espelho Avatar</p>
                      <p className="text-xs text-gray-500">Reflectir a foto horizontalmente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLocalSettings((s) => ({ ...s, mirrorAvatar: !s.mirrorAvatar }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      localSettings.mirrorAvatar ? "bg-violet-600" : "bg-gray-200"
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      localSettings.mirrorAvatar ? "translate-x-7" : "translate-x-1"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quero Mudar (vícios) */}
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-semibold text-gray-700">Quero Mudar</p>
                  <p className="text-xs text-gray-500 ml-1">— alterar vícios a trabalhar</p>
                </div>
                {behavioralProfile?.primaryAddictions && behavioralProfile.primaryAddictions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {behavioralProfile.primaryAddictions.map((a) => (
                      <span key={a} className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                        {ADDICTION_LABELS[a] || a}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { onChangeAddictions(); onClose(); }}
                  className="w-full py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-semibold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refazer Onboarding
                </button>
              </div>

              {/* Notificações */}
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <p className="text-sm font-semibold text-gray-700">Notificações</p>
                </div>
                {[
                  { key: "dailyReminders", label: "Lembretes diários" },
                  { key: "motivationalMessages", label: "Mensagens motivacionais" },
                  { key: "achievementUnlocked", label: "Conquistas desbloqueadas" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <button
                      onClick={() => setLocalSettings((s) => ({
                        ...s,
                        notifications: { ...s.notifications, [key]: !s.notifications[key as keyof typeof s.notifications] }
                      }))}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        localSettings.notifications[key as keyof typeof localSettings.notifications] ? "bg-violet-600" : "bg-gray-200"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        localSettings.notifications[key as keyof typeof localSettings.notifications] ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Privacidade */}
              <div className="rounded-2xl border border-gray-100 p-4 bg-gray-50 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-violet-500" />
                  <p className="text-sm font-semibold text-gray-700">Privacidade</p>
                </div>
                {[
                  { key: "profileVisibleInForum", label: "Perfil visível no fórum" },
                  { key: "showDaysInProfile", label: "Mostrar dias no perfil" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <button
                      onClick={() => setLocalSettings((s) => ({
                        ...s,
                        privacy: { ...s.privacy, [key]: !s.privacy[key as keyof typeof s.privacy] }
                      }))}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        localSettings.privacy[key as keyof typeof localSettings.privacy] ? "bg-violet-600" : "bg-gray-200"
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        localSettings.privacy[key as keyof typeof localSettings.privacy] ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Botão Salvar Configurações */}
              <button
                onClick={handleSaveSettings}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-pink-200"
              >
                <Save className="w-4 h-4" />
                Salvar Configurações
              </button>

              {/* Zona de Perigo */}
              <div className="rounded-2xl border border-red-100 p-4 bg-red-50">
                <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3">Zona de Perigo</p>
                <button
                  onClick={() => { onResetProgress(); onClose(); }}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Resetar Todo o Progresso
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
