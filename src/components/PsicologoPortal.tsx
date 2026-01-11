import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Video, Settings, LogOut, LogIn,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle,
  Phone, Mail, FileText, Star, TrendingUp, Users, Heart,
  Eye, EyeOff, UserPlus, Shield, Award
} from 'lucide-react';
import { API_URL } from '../config/api';

interface Appointment {
  id: string;
  userId: string;
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

type View = 'login' | 'register' | 'dashboard' | 'agenda' | 'patients' | 'profile' | 'settings';

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
  
  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

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

  // Load appointments
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

    // Validation
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
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
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

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
    loadAppointments(newDate);
  };

  // Load data when view changes
  useEffect(() => {
    if (isLoggedIn && currentView === 'agenda') {
      loadAppointments();
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

  // Render Agenda
  const renderAgenda = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">Agenda</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-zinc-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium px-4">{formatDate(selectedDate)}</span>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-zinc-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-zinc-100">
          <Calendar className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-500">Nenhuma consulta agendada para este dia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center">
                    <User className="w-7 h-7 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-lg">{apt.userName}</h3>
                    <p className="text-zinc-500 text-sm">{apt.userEmail}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-zinc-600">
                        <Clock className="w-4 h-4" />
                        {formatTime(apt.scheduledAt)}
                      </span>
                      <span className="text-sm text-zinc-600">{apt.duration} minutos</span>
                    </div>
                    {apt.notes && (
                      <p className="mt-2 text-sm text-zinc-500 bg-zinc-50 p-2 rounded-lg">
                        <FileText className="w-4 h-4 inline mr-1" />
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
                  <div className="flex gap-2 mt-2">
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
                          Não compareceu
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
  );

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
        {currentView === 'profile' && renderProfile()}
      </main>
    </div>
  );
};

export default PsicologoPortal;
