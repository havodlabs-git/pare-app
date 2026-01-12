import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Video, Settings, LogOut, LogIn,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle,
  Phone, Mail, FileText, Star, TrendingUp, Users, Heart,
  Eye, EyeOff, UserPlus, Shield, Award, MessageCircle, Send
} from 'lucide-react';
import { API_URL } from '../config/api';

interface Appointment {
  id: string;
  odUserId: string;
  userName: string;
  userEmail: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  zoomStartUrl: string;
  zoomJoinUrl: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  title: string;
  specialty: string;
  crp: string;
  bio: string;
  photoUrl: string;
  rating: number;
  totalSessions: number;
  languages: string[];
  schedule: Record<string, { start: string; end: string; duration: number }[]>;
  isActive: boolean;
  isVerified: boolean;
}

interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  totalPatients: number;
  completedSessions: number;
  rating: number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasAppointments: boolean;
  appointmentCount: number;
}

type View = 'login' | 'register' | 'dashboard' | 'agenda' | 'chat' | 'patients' | 'profile' | 'settings';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'professional';
  senderName: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadByProfessional: number;
  status: string;
}

const PsicologoPortal: React.FC = () => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<View>('login');
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: 'Psicólogo(a)',
    specialty: '',
    crp: '',
    bio: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  
  // Dashboard/Calendar state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Record<string, Appointment[]>>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Chat state
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('pare_professional_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      setCurrentView('dashboard');
      loadProfile(savedToken);
    }
  }, []);

  // API helper
  const apiRequest = async (endpoint: string, options: RequestInit = {}, authToken?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const tokenToUse = authToken || token;
    if (tokenToUse) {
      headers['Authorization'] = `Bearer ${tokenToUse}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers as Record<string, string> },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
  };

  // Load profile
  const loadProfile = async (authToken: string) => {
    try {
      const response = await apiRequest('/api/professionals/profile', { method: 'GET' }, authToken);
      setProfessional(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      handleLogout();
    }
  };

  // Load appointments for a specific date
  const loadAppointments = async (date?: Date) => {
    if (!token) return;
    setLoading(true);
    try {
      const dateStr = (date || selectedDate).toISOString().split('T')[0];
      const response = await apiRequest(`/api/professionals/appointments?date=${dateStr}`, { method: 'GET' });
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
    setLoading(false);
  };

  // Load appointments for the entire month
  const loadMonthAppointments = async (month: Date) => {
    if (!token) return;
    try {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      const response = await apiRequest(`/api/professionals/appointments?month=${year}-${String(monthNum).padStart(2, '0')}`, { method: 'GET' });
      
      // Group appointments by date
      const grouped: Record<string, Appointment[]> = {};
      (response.data || []).forEach((apt: Appointment) => {
        const dateKey = new Date(apt.scheduledAt).toISOString().split('T')[0];
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(apt);
      });
      setMonthAppointments(grouped);
    } catch (error) {
      console.error('Error loading month appointments:', error);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await apiRequest('/api/professionals/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      if (response.success && response.data?.token) {
        const newToken = response.data.token;
        localStorage.setItem('pare_professional_token', newToken);
        setToken(newToken);
        setProfessional(response.data.professional);
        setIsLoggedIn(true);
        setCurrentView('dashboard');
        setLoginEmail('');
        setLoginPassword('');
      }
    } catch (error: any) {
      setLoginError(error.message || 'Erro ao fazer login');
    }
    setLoginLoading(false);
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError('As senhas não coincidem');
      setRegisterLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError('A senha deve ter pelo menos 6 caracteres');
      setRegisterLoading(false);
      return;
    }

    if (!registerForm.crp.match(/^\d{2}\/\d+$/)) {
      setRegisterError('CRP deve estar no formato XX/XXXXXX');
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/api/professionals/register', {
        method: 'POST',
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          title: registerForm.title,
          specialty: registerForm.specialty,
          crp: registerForm.crp,
          bio: registerForm.bio
        }),
      });

      if (response.success) {
        setRegisterSuccess(true);
      }
    } catch (error: any) {
      setRegisterError(error.message || 'Erro ao cadastrar');
    }
    setRegisterLoading(false);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('pare_professional_token');
    setToken(null);
    setProfessional(null);
    setIsLoggedIn(false);
    setCurrentView('login');
    setAppointments([]);
    setStats(null);
  };

  // Update appointment status
  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      await apiRequest(`/api/professionals/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      loadAppointments();
      loadMonthAppointments(currentMonth);
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days: CalendarDay[] = [];
    
    // Add days from previous month (Sunday = 0)
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      const dateKey = d.toISOString().split('T')[0];
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        hasAppointments: !!monthAppointments[dateKey]?.length,
        appointmentCount: monthAppointments[dateKey]?.length || 0
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const dateKey = d.toISOString().split('T')[0];
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: d.getTime() === today.getTime(),
        hasAppointments: !!monthAppointments[dateKey]?.length,
        appointmentCount: monthAppointments[dateKey]?.length || 0
      });
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const d = new Date(year, month + 1, i);
      const dateKey = d.toISOString().split('T')[0];
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: false,
        hasAppointments: !!monthAppointments[dateKey]?.length,
        appointmentCount: monthAppointments[dateKey]?.length || 0
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
    loadMonthAppointments(newMonth);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
    loadAppointments(date);
  };

  // Format helpers
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  // Load data when view changes
  useEffect(() => {
    if (isLoggedIn && currentView === 'agenda') {
      loadAppointments();
      loadMonthAppointments(currentMonth);
    }
  }, [currentView, isLoggedIn]);

  // Render Login Screen
  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Portal do Psicólogo</h1>
            <p className="text-sm text-zinc-500">Pare! App</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {loginError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {loginError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full pl-12 pr-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Senha</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-12 pr-12 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loginLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Entrar
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-500 text-sm">
            Ainda não tem conta?{' '}
            <button
              onClick={() => setCurrentView('register')}
              className="text-teal-600 font-semibold hover:underline"
            >
              Cadastre-se
            </button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-100">
          <p className="text-xs text-zinc-400 text-center">
            Área exclusiva para profissionais de saúde mental cadastrados no Pare! App
          </p>
        </div>
      </div>
    </div>
  );

  // Render Register Screen
  const renderRegister = () => {
    if (registerSuccess) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">Cadastro Realizado!</h2>
            <p className="text-zinc-600 mb-6">
              Seu cadastro foi enviado para análise. Você receberá um email quando sua conta for aprovada.
            </p>
            <button
              onClick={() => {
                setRegisterSuccess(false);
                setCurrentView('login');
              }}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900">Cadastro de Psicólogo</h1>
              <p className="text-sm text-zinc-500">Pare! App</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {registerError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {registerError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="Dr(a). Nome Sobrenome"
                  required
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Título</label>
                <select
                  value={registerForm.title}
                  onChange={(e) => setRegisterForm({ ...registerForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Psicólogo(a)">Psicólogo(a)</option>
                  <option value="Psiquiatra">Psiquiatra</option>
                  <option value="Terapeuta">Terapeuta</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">CRP</label>
                <input
                  type="text"
                  value={registerForm.crp}
                  onChange={(e) => setRegisterForm({ ...registerForm, crp: e.target.value })}
                  placeholder="06/123456"
                  required
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Especialidade</label>
                <input
                  type="text"
                  value={registerForm.specialty}
                  onChange={(e) => setRegisterForm({ ...registerForm, specialty: e.target.value })}
                  placeholder="Ex: Terapia Cognitivo-Comportamental, Dependências"
                  required
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Sobre você</label>
                <textarea
                  value={registerForm.bio}
                  onChange={(e) => setRegisterForm({ ...registerForm, bio: e.target.value })}
                  placeholder="Conte um pouco sobre sua experiência e abordagem terapêutica..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {registerLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Cadastrar
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentView('login')}
              className="text-teal-600 font-semibold hover:underline text-sm"
            >
              ← Voltar para Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-sm text-zinc-500">Hoje</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{stats?.todayAppointments || 0}</p>
          <p className="text-sm text-zinc-500">consultas agendadas</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
            <span className="text-sm text-zinc-500">Esta semana</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{stats?.weekAppointments || 0}</p>
          <p className="text-sm text-zinc-500">consultas</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-sm text-zinc-500">Pacientes</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{stats?.totalPatients || 0}</p>
          <p className="text-sm text-zinc-500">atendidos</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm text-zinc-500">Avaliação</span>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{professional?.rating?.toFixed(1) || '5.0'}</p>
          <p className="text-sm text-zinc-500">média geral</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Próximas Consultas</h3>
        {appointments.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">Nenhuma consulta agendada para hoje</p>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{apt.userName}</p>
                    <p className="text-sm text-zinc-500">{formatTime(apt.scheduledAt)} - {apt.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {apt.zoomStartUrl && (
                    <a
                      href={apt.zoomStartUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Iniciar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render Calendar Component
  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600" />
          </button>
          <h3 className="text-lg font-semibold text-zinc-900 capitalize">
            {formatMonthYear(currentMonth)}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isSelected = day.date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={index}
                onClick={() => selectDate(day.date)}
                className={`
                  relative p-2 h-12 rounded-lg text-sm font-medium transition-all
                  ${!day.isCurrentMonth ? 'text-zinc-300' : 'text-zinc-700'}
                  ${day.isToday ? 'ring-2 ring-teal-500 ring-offset-1' : ''}
                  ${isSelected ? 'bg-teal-500 text-white' : 'hover:bg-zinc-100'}
                `}
              >
                <span>{day.date.getDate()}</span>
                {day.hasAppointments && (
                  <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-500'}`} />
                )}
                {day.appointmentCount > 0 && (
                  <span className={`absolute top-0.5 right-0.5 text-[10px] font-bold ${isSelected ? 'text-teal-100' : 'text-teal-600'}`}>
                    {day.appointmentCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Agenda with Calendar
  const renderAgenda = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Agenda</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          {renderCalendar()}
          
          {/* Selected Date Info */}
          <div className="mt-4 bg-teal-50 rounded-xl p-4">
            <p className="text-sm text-teal-700 font-medium capitalize">
              {formatDate(selectedDate)}
            </p>
            <p className="text-2xl font-bold text-teal-900 mt-1">
              {appointments.length} consulta{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900">
                Consultas do dia
              </h3>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
                <p className="text-zinc-500">Nenhuma consulta agendada para este dia</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {appointments.map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-zinc-900">{apt.userName}</h4>
                          <p className="text-sm text-zinc-500">{apt.userEmail}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="flex items-center gap-1 text-sm text-zinc-600">
                              <Clock className="w-4 h-4" />
                              {formatTime(apt.scheduledAt)}
                            </span>
                            <span className="text-sm text-zinc-400">•</span>
                            <span className="text-sm text-zinc-600">{apt.duration} min</span>
                          </div>
                          {apt.notes && (
                            <p className="mt-2 text-sm text-zinc-500 bg-zinc-100 p-2 rounded-lg">
                              {apt.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          apt.status === 'completed' ? 'bg-zinc-100 text-zinc-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {apt.status === 'confirmed' ? 'Confirmado' :
                           apt.status === 'scheduled' ? 'Agendado' :
                           apt.status === 'completed' ? 'Concluído' :
                           apt.status === 'cancelled' ? 'Cancelado' : 'Não compareceu'}
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2 justify-end">
                          {apt.zoomStartUrl && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <a
                              href={apt.zoomStartUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-1"
                            >
                              <Video className="w-4 h-4" />
                              Iniciar
                            </a>
                          )}
                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirmar
                            </button>
                          )}
                          {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'completed')}
                                className="px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200"
                              >
                                Concluir
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'no-show')}
                                className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200"
                              >
                                Faltou
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Chat functions
  const loadChatConversations = async () => {
    if (!token) return;
    setChatLoading(true);
    try {
      const data = await apiRequest('/api/chat/professional/conversations', {}, token);
      if (data.success) {
        setChatConversations(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const loadChatMessages = async (conversationId: string) => {
    if (!token) return;
    try {
      const data = await apiRequest(`/api/chat/professional/conversations/${conversationId}/messages`, {}, token);
      if (data.success) {
        setChatMessages(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const sendChatMessage = async () => {
    if (!token || !selectedConversation || !newMessage.trim() || sendingMessage) return;
    setSendingMessage(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    try {
      await apiRequest('/api/chat/professional/messages', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageContent
        })
      }, token);
      await loadChatMessages(selectedConversation.id);
      await loadChatConversations();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatChatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatChatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  // Render Chat
  const renderChat = () => {
    // Load conversations when entering chat view
    if (chatConversations.length === 0 && !chatLoading) {
      loadChatConversations();
    }

    return (
      <div className="flex h-full" style={{ minHeight: '600px' }}>
        {/* Conversations sidebar */}
        <div className="w-80 bg-white border-r border-zinc-200 flex flex-col">
          <div className="p-4 border-b border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900">Mensagens</h3>
          </div>
          
          {chatLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chatConversations.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-4">
              <MessageCircle className="w-12 h-12 mb-3 text-zinc-300" />
              <p>Nenhuma conversa ainda</p>
              <p className="text-sm text-center mt-2">Quando pacientes iniciarem conversas, elas aparecerão aqui.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {chatConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    loadChatMessages(conv.id);
                  }}
                  className={`w-full p-4 flex items-start gap-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? 'bg-teal-50' : ''
                  }`}
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.userPhotoUrl ? (
                      <img src={conv.userPhotoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-6 h-6 text-teal-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-zinc-900 truncate">{conv.userName}</span>
                      {conv.lastMessageAt && (
                        <span className="text-xs text-zinc-500">{formatChatDate(conv.lastMessageAt)}</span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-zinc-500 truncate mt-1">{conv.lastMessage}</p>
                    )}
                    {conv.unreadByProfessional > 0 && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                        {conv.unreadByProfessional}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-zinc-50">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 bg-white border-b border-zinc-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  {selectedConversation.userPhotoUrl ? (
                    <img src={selectedConversation.userPhotoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-5 h-5 text-teal-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-zinc-900">{selectedConversation.userName}</h4>
                  <span className="text-xs text-zinc-500">Paciente</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, index) => {
                  const isProfessional = msg.senderType === 'professional';
                  const showDate = index === 0 || 
                    formatChatDate(chatMessages[index - 1].createdAt) !== formatChatDate(msg.createdAt);
                  
                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="text-center text-xs text-zinc-500 my-4">
                          {formatChatDate(msg.createdAt)}
                        </div>
                      )}
                      <div className={`flex ${isProfessional ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                          isProfessional 
                            ? 'bg-teal-500 text-white rounded-br-sm' 
                            : 'bg-white text-zinc-900 rounded-bl-sm shadow-sm'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <span className={`text-xs mt-1 block text-right ${
                            isProfessional ? 'text-teal-100' : 'text-zinc-400'
                          }`}>
                            {formatChatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Input area */}
              <div className="p-4 bg-white border-t border-zinc-200">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 px-4 py-3 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
              <MessageCircle className="w-16 h-16 mb-4 text-zinc-300" />
              <h3 className="text-lg font-medium text-zinc-700">Selecione uma conversa</h3>
              <p className="text-sm">Escolha uma conversa para ver as mensagens</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Profile
  const renderProfile = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">Meu Perfil</h2>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 bg-teal-100 rounded-2xl flex items-center justify-center">
            {professional?.photoUrl ? (
              <img src={professional.photoUrl} alt={professional.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <User className="w-12 h-12 text-teal-600" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900">{professional?.name}</h3>
            <p className="text-teal-600 font-medium">{professional?.title}</p>
            <p className="text-zinc-500">{professional?.specialty}</p>
            <div className="flex items-center gap-2 mt-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-zinc-600">CRP: {professional?.crp}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Email</label>
            <p className="text-zinc-900">{professional?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Avaliação</label>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-zinc-900 font-medium">{professional?.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-zinc-500">({professional?.totalSessions || 0} sessões)</span>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Sobre</label>
            <p className="text-zinc-600">{professional?.bio || 'Nenhuma descrição adicionada.'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  if (!isLoggedIn) {
    if (currentView === 'register') {
      return renderRegister();
    }
    return renderLogin();
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900">Pare!</h1>
              <p className="text-xs text-zinc-500">Portal do Psicólogo</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'agenda', label: 'Agenda', icon: Calendar },
              { id: 'chat', label: 'Mensagens', icon: MessageCircle },
              { id: 'profile', label: 'Meu Perfil', icon: User },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentView(item.id as View)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 truncate">{professional?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{professional?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'agenda' && renderAgenda()}
        {currentView === 'chat' && renderChat()}
        {currentView === 'profile' && renderProfile()}
      </main>
    </div>
  );
};

export default PsicologoPortal;
