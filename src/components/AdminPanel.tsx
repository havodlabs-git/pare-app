import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, UserCheck, Calendar, Settings, 
  BarChart3, Search, MoreVertical, Ban, CheckCircle, 
  Trash2, Edit, Plus, Video, X, Eye, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, Clock, Shield, LogIn, LogOut, Upload, Image
} from 'lucide-react';
import api from '../services/api';

interface DashboardData {
  users: { total: number; byPlan: { free: number; premium: number; elite: number } };
  forum: { totalPosts: number };
  professionals: { total: number };
  appointments: { total: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  role?: string;
  isAdmin?: boolean;
  isPsychologist?: boolean;
  streak: number;
  points: number;
  level: number;
  isBanned: boolean;
  createdAt: any;
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorName: string;
  category: string;
  likesCount: number;
  createdAt: any;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  specialty: string;
  crp: string;
  bio: string;
  photoUrl: string;
  hourlyRate: number;
  // Email removido - Jitsi Meet não precisa de configuração
  isActive: boolean;
}

type Tab = 'dashboard' | 'users' | 'posts' | 'professionals' | 'appointments' | 'videochamadas' | 'content';

const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState('');
  
  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Professionals
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalForm, setProfessionalForm] = useState({
    name: '', email: '', password: '', specialty: '', crp: '', bio: '', photoUrl: '', hourlyRate: 0
  });
  
  // Videochamadas - Jitsi Meet (não precisa de configuração)

  // Vícios & Hábitos & Módulos
  const [addictions, setAddictions] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [contentSubTab, setContentSubTab] = useState<'addictions' | 'habits' | 'modules'>('addictions');
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<any | null>(null);
  const [moduleForm, setModuleForm] = useState<{ name: string; description: string; icon: string; color: string; category: string; requiredPlan: string; isActive: boolean; imageUrl: string | null }>({ name: '', description: '', icon: '⭐', color: '#8b5cf6', category: 'comportamental', requiredPlan: 'free', isActive: true, imageUrl: null });
  const [moduleImageFile, setModuleImageFile] = useState<File | null>(null);
  const [moduleImagePreview, setModuleImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showAddictionModal, setShowAddictionModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingAddiction, setEditingAddiction] = useState<any | null>(null);
  const [editingHabit, setEditingHabit] = useState<any | null>(null);
  const [addictionForm, setAddictionForm] = useState({ label: '', icon: '🔴', color: '#ef4444', description: '', category: 'geral' });
  const [habitForm, setHabitForm] = useState({ name: '', description: '', category: 'geral', icon: '⭐', color: '#8b5cf6', frequency: 3, duration: 30, period: 'morning', addictionId: '', tags: '' });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('pare_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [activeTab, isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      // Usar endpoint específico de admin
      const response = await api.post('/admin/login', { email: loginEmail, password: loginPassword });
      if (response.data?.success && response.data?.data?.token) {
        api.setToken(response.data.data.token);
        setIsLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setLoginError(response.data?.message || 'Credenciais inválidas');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login. Verifique as credenciais.');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    api.clearToken();
    setIsLoggedIn(false);
    setDashboardData(null);
    setUsers([]);
    setPosts([]);
    setProfessionals([]);
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      switch (activeTab) {
        case 'dashboard':
          const dashRes = await api.get('/admin/dashboard');
          setDashboardData(dashRes.data.data);
          break;
        case 'users':
          const usersRes = await api.get('/admin/users', { params: { search: userSearch, plan: userPlanFilter } });
          setUsers(usersRes.data.data.users);
          break;
        case 'posts':
          const postsRes = await api.get('/admin/posts');
          setPosts(postsRes.data.data.posts);
          break;
        case 'professionals':
          const profsRes = await api.get('/admin/professionals');
          setProfessionals(profsRes.data.data.professionals);
          break;
        case 'videochamadas':
          // Jitsi Meet não precisa de configuração
          break;
        case 'content':
          const addictionsRes = await api.get('/admin/addictions');
          setAddictions(addictionsRes.data.data.addictions || []);
          const habitsRes = await api.get('/admin/habits');
          setHabits(habitsRes.data.data.habits || []);
          const modulesRes = await api.get('/admin/modules');
          setModules(modulesRes.data.data.modules || []);
          break;
      }
    } catch (err: any) {
      const message = err.message || 'Erro ao carregar dados';
      setError(message);
      // If unauthorized, logout
      if (message.includes('autorizado') || message.includes('Token')) {
        handleLogout();
      }
    }
    setLoading(false);
  };

  // User actions
  const handleBanUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja banir este usuário?')) return;
    try {
      await api.post(`/admin/users/${userId}/ban`, { reason: 'Violação dos termos' });
      loadData();
    } catch (err) {
      alert('Erro ao banir usuário');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await api.post(`/admin/users/${userId}/unban`);
      loadData();
    } catch (err) {
      alert('Erro ao desbanir usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir usuário');
    }
  };

  // Modal para alterar plano/role
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPlan, setNewPlan] = useState('free');
  const [planDuration, setPlanDuration] = useState(1);
  const [newRole, setNewRole] = useState('user'); // 'user' | 'admin' | 'psychologist'

  const openPlanModal = (user: User) => {
    setSelectedUser(user);
    setNewPlan(user.plan || 'free');
    setPlanDuration(1);
    // Detectar role actual
    if (user.isAdmin) setNewRole('admin');
    else if (user.isPsychologist) setNewRole('psychologist');
    else setNewRole('user');
    setShowPlanModal(true);
  };

  const handleUpdateUserPlan = async () => {
    if (!selectedUser) return;
    try {
      if (newRole === 'admin') {
        // Admin: actualizar role (inclui plan elite automaticamente)
        await api.put(`/admin/users/${selectedUser.id}/role`, { role: 'admin' });
        alert('Role atualizada para Admin com sucesso! O utilizador tem agora acesso Elite, painel de psicólogo e painel admin.');
      } else if (newRole === 'psychologist') {
        await api.put(`/admin/users/${selectedUser.id}/role`, { role: 'psychologist' });
        // Actualizar plano separadamente se necessário
        if (newPlan !== (selectedUser.plan || 'free')) {
          await api.put(`/admin/users/${selectedUser.id}/plan`, {
            plan: newPlan,
            duration: newPlan !== 'free' ? planDuration : null
          });
        }
        alert('Role atualizada para Psicólogo com sucesso!');
      } else {
        // user normal: remover roles e actualizar plano
        await api.put(`/admin/users/${selectedUser.id}/role`, { role: 'user' });
        await api.put(`/admin/users/${selectedUser.id}/plan`, {
          plan: newPlan,
          duration: newPlan !== 'free' ? planDuration : null
        });
        alert(`Plano atualizado para ${newPlan.toUpperCase()} com sucesso!`);
      }
      setShowPlanModal(false);
      setSelectedUser(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar plano/role');
    }
  };

  // Post actions
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir post');
    }
  };

  // Professional actions
  const handleSaveProfessional = async () => {
    try {
      if (editingProfessional) {
        await api.put(`/admin/professionals/${editingProfessional.id}`, professionalForm);
      } else {
        await api.post('/admin/professionals', professionalForm);
      }
      setShowProfessionalModal(false);
      setEditingProfessional(null);
      setProfessionalForm({ name: '', email: '', password: '', specialty: '', crp: '', bio: '', photoUrl: '', hourlyRate: 0 });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar profissional');
    }
  };

  const handleEditProfessional = (prof: Professional) => {
    setEditingProfessional(prof);
    setProfessionalForm({
      name: prof.name,
      email: prof.email,
      password: '',
      specialty: prof.specialty,
      crp: prof.crp,
      bio: prof.bio || '',
      photoUrl: prof.photoUrl || '',
      hourlyRate: prof.hourlyRate || 0,

    });
    setShowProfessionalModal(true);
  };

  const handleDeleteProfessional = async (profId: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    try {
      await api.delete(`/admin/professionals/${profId}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir profissional');
    }
  };

  const handleToggleProfessional = async (profId: string, isActive: boolean) => {
    try {
      await api.post(`/admin/professionals/${profId}/${isActive ? 'deactivate' : 'activate'}`);
      loadData();
    } catch (err) {
      alert('Erro ao alterar status do profissional');
    }
  };

  // Handlers de Vícios
  const handleSaveAddiction = async () => {
    try {
      if (editingAddiction) {
        await api.put(`/admin/addictions/${editingAddiction.id}`, addictionForm);
      } else {
        await api.post('/admin/addictions', addictionForm);
      }
      setShowAddictionModal(false);
      setEditingAddiction(null);
      setAddictionForm({ label: '', icon: '🔴', color: '#ef4444', description: '', category: 'geral' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar vício');
    }
  };

  const handleEditAddiction = (addiction: any) => {
    setEditingAddiction(addiction);
    setAddictionForm({ label: addiction.label, icon: addiction.icon, color: addiction.color, description: addiction.description || '', category: addiction.category || 'geral' });
    setShowAddictionModal(true);
  };

  const handleDeleteAddiction = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vício?')) return;
    try {
      await api.delete(`/admin/addictions/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir vício');
    }
  };

  // Handlers de Hábitos
  const handleSaveHabit = async () => {
    try {
      const payload = { ...habitForm, tags: habitForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editingHabit) {
        await api.put(`/admin/habits/${editingHabit.id}`, payload);
      } else {
        await api.post('/admin/habits', payload);
      }
      setShowHabitModal(false);
      setEditingHabit(null);
      setHabitForm({ name: '', description: '', category: 'geral', icon: '⭐', color: '#8b5cf6', frequency: 3, duration: 30, period: 'morning', addictionId: '', tags: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar hábito');
    }
  };

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setHabitForm({ name: habit.name, description: habit.description || '', category: habit.category || 'geral', icon: habit.icon || '⭐', color: habit.color || '#8b5cf6', frequency: habit.frequency || 3, duration: habit.duration || 30, period: habit.period || 'morning', addictionId: habit.addictionId || '', tags: Array.isArray(habit.tags) ? habit.tags.join(', ') : '' });
    setShowHabitModal(true);
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este hábito?')) return;
    try {
      await api.delete(`/admin/habits/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir hábito');
    }
  };



  // Handlers de Módulos
  const handleModuleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setModuleImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setModuleImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveModule = async () => {
    try {
      let imageUrl = moduleForm.imageUrl;

      // Se há um ficheiro de imagem para upload, enviar primeiro
      if (moduleImageFile) {
        setUploadingImage(true);
        const moduleId = editingModule?.id || moduleForm.name.toLowerCase().replace(/\s+/g, '_') || `module_${Date.now()}`;
        const formData = new FormData();
        formData.append('image', moduleImageFile);
        formData.append('moduleId', moduleId);
        const uploadRes = await api.uploadFile('/admin/modules/upload-image', formData);
        imageUrl = uploadRes.data.data.imageUrl;
        setUploadingImage(false);
      }

      const payload = { ...moduleForm, imageUrl };
      if (editingModule) {
        await api.put(`/admin/modules/${editingModule.id}`, payload);
      } else {
        await api.post('/admin/modules', payload);
      }
      setShowModuleModal(false);
      setEditingModule(null);
      setModuleForm({ name: '', description: '', icon: '⭐', color: '#8b5cf6', category: 'comportamental', requiredPlan: 'free', isActive: true, imageUrl: null });
      setModuleImageFile(null);
      setModuleImagePreview(null);
      loadData();
    } catch (err: any) {
      setUploadingImage(false);
      alert(err.message || 'Erro ao salvar módulo');
    }
  };

  const handleEditModule = (mod: any) => {
    setEditingModule(mod);
    setModuleForm({ name: mod.name, description: mod.description || '', icon: mod.icon || '⭐', color: mod.color || '#8b5cf6', category: mod.category || 'comportamental', requiredPlan: mod.requiredPlan || 'free', isActive: mod.isActive !== false, imageUrl: mod.imageUrl || null });
    setModuleImageFile(null);
    setModuleImagePreview(mod.imageUrl || null);
    setShowModuleModal(true);
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return;
    try {
      await api.delete(`/admin/modules/${id}`);
      loadData();
    } catch (err) {
      alert('Erro ao excluir módulo');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'professionals', label: 'Psicólogos', icon: UserCheck },
    { id: 'content', label: 'Vícios & Hábitos', icon: Settings },
    { id: 'videochamadas', label: 'Videochamadas', icon: Video },
  ];

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-10 h-10 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Admin Panel</h1>
              <p className="text-sm text-zinc-500">Pare! App</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Senha</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>
          
          <p className="text-xs text-zinc-400 text-center mt-6">
            Apenas administradores podem acessar este painel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-zinc-200 p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Shield className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="font-bold text-zinc-900">Admin Panel</h1>
            <p className="text-xs text-zinc-500">Pare! App</p>
          </div>
        </div>
        
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-zinc-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        ) : (
          <>
            {/* Dashboard */}
            {activeTab === 'dashboard' && dashboardData && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 border border-zinc-200">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-indigo-600" />
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">{dashboardData.users.total}</p>
                    <p className="text-sm text-zinc-500">Total de Usuários</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-zinc-200">
                    <div className="flex items-center justify-between mb-4">
                      <MessageSquare className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">{dashboardData.forum.totalPosts}</p>
                    <p className="text-sm text-zinc-500">Posts no Fórum</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-zinc-200">
                    <div className="flex items-center justify-between mb-4">
                      <UserCheck className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">{dashboardData.professionals.total}</p>
                    <p className="text-sm text-zinc-500">Psicólogos</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-zinc-200">
                    <div className="flex items-center justify-between mb-4">
                      <Calendar className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">{dashboardData.appointments.total}</p>
                    <p className="text-sm text-zinc-500">Agendamentos</p>
                  </div>
                </div>

                {/* Plan Distribution */}
                <div className="bg-white rounded-xl p-6 border border-zinc-200">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">Distribuição por Plano</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-zinc-50 rounded-lg">
                      <p className="text-2xl font-bold text-zinc-900">{dashboardData.users.byPlan.free}</p>
                      <p className="text-sm text-zinc-500">Free</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">{dashboardData.users.byPlan.premium}</p>
                      <p className="text-sm text-zinc-500">Premium</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{dashboardData.users.byPlan.elite}</p>
                      <p className="text-sm text-zinc-500">Elite</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900">Usuários</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadData()}
                        className="pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={userPlanFilter}
                      onChange={(e) => { setUserPlanFilter(e.target.value); loadData(); }}
                      className="px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Todos os planos</option>
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="elite">Elite</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Usuário</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Plano / Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Streak</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Pontos</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-zinc-900">{user.name}</p>
                              <p className="text-sm text-zinc-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              {user.isAdmin ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 w-fit">Admin</span>
                              ) : user.isPsychologist ? (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-700 w-fit">Psicólogo</span>
                              ) : null}
                              <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${
                                user.isAdmin ? 'bg-red-50 text-red-600' :
                                user.plan === 'elite' ? 'bg-purple-100 text-purple-700' :
                                user.plan === 'premium' ? 'bg-indigo-100 text-indigo-700' :
                                'bg-zinc-100 text-zinc-700'
                              }`}>
                                {user.isAdmin ? 'elite (admin)' : (user.plan || 'free')}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">{user.streak || 0} dias</td>
                          <td className="px-6 py-4 text-zinc-600">{user.points || 0}</td>
                          <td className="px-6 py-4">
                            {user.isBanned ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Banido</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Ativo</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openPlanModal(user)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Alterar Plano">
                                <Edit className="w-4 h-4" />
                              </button>
                              {user.isBanned ? (
                                <button onClick={() => handleUnbanUser(user.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Desbanir">
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button onClick={() => handleBanUser(user.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Banir">
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                      Nenhum usuário encontrado
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Posts */}
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Posts do Fórum</h2>
                
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Título</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Autor</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Categoria</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Likes</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200">
                      {posts.map(post => (
                        <tr key={post.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-zinc-900 truncate max-w-xs">{post.title}</p>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">{post.authorName}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700">
                              {post.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">{post.likesCount || 0}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {posts.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                      Nenhum post encontrado
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Professionals */}
            {activeTab === 'professionals' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900">Psicólogos</h2>
                  <button
                    onClick={() => {
                      setEditingProfessional(null);
                      setProfessionalForm({ name: '', email: '', password: '', specialty: '', crp: '', bio: '', photoUrl: '', hourlyRate: 0 });
                      setShowProfessionalModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Psicólogo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {professionals.map(prof => (
                    <div key={prof.id} className="bg-white rounded-xl border border-zinc-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900">{prof.name}</p>
                            <p className="text-sm text-zinc-500">{prof.specialty}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          prof.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {prof.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-zinc-600 mb-4">
                        <p>CRP: {prof.crp}</p>
                        <p>Email: {prof.email}</p>
                        <p>Valor/hora: R$ {prof.hourlyRate || 0}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-zinc-200">
                        <button onClick={() => handleEditProfessional(prof)} className="flex-1 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium">
                          Editar
                        </button>
                        <button onClick={() => handleToggleProfessional(prof.id, prof.isActive)} className="flex-1 px-3 py-2 text-zinc-600 hover:bg-zinc-50 rounded-lg text-sm font-medium">
                          {prof.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button onClick={() => handleDeleteProfessional(prof.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {professionals.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 bg-white rounded-xl border border-zinc-200">
                    Nenhum psicólogo cadastrado
                  </div>
                )}

                {/* Professional Modal */}
                {showProfessionalModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {editingProfessional ? 'Editar Psicólogo' : 'Novo Psicólogo'}
                        </h3>
                        <button onClick={() => setShowProfessionalModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome</label>
                          <input
                            type="text"
                            value={professionalForm.name}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={professionalForm.email}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, email: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        {!editingProfessional && (
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Senha</label>
                            <input
                              type="password"
                              value={professionalForm.password}
                              onChange={(e) => setProfessionalForm({ ...professionalForm, password: e.target.value })}
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Especialidade</label>
                          <input
                            type="text"
                            value={professionalForm.specialty}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, specialty: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">CRP</label>
                          <input
                            type="text"
                            value={professionalForm.crp}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, crp: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Valor por Hora (R$)</label>
                          <input
                            type="number"
                            value={professionalForm.hourlyRate}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, hourlyRate: Number(e.target.value) })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Bio</label>
                          <textarea
                            value={professionalForm.bio}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => setShowProfessionalModal(false)}
                            className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveProfessional}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vícios & Hábitos */}
            {activeTab === 'content' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900">Vícios &amp; Hábitos</h2>
                  <button
                    onClick={() => {
                      if (contentSubTab === 'addictions') {
                        setEditingAddiction(null);
                        setAddictionForm({ label: '', icon: '🔴', color: '#ef4444', description: '', category: 'geral' });
                        setShowAddictionModal(true);
                      } else if (contentSubTab === 'habits') {
                        setEditingHabit(null);
                        setHabitForm({ name: '', description: '', category: 'geral', icon: '⭐', color: '#8b5cf6', frequency: 3, duration: 30, period: 'morning', addictionId: '', tags: '' });
                        setShowHabitModal(true);
                      } else {
                        setEditingModule(null);
                        setModuleForm({ name: '', description: '', icon: '⭐', color: '#8b5cf6', category: 'comportamental', requiredPlan: 'free', isActive: true, imageUrl: null });
                        setModuleImageFile(null);
                        setModuleImagePreview(null);
                        setShowModuleModal(true);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {contentSubTab === 'addictions' ? 'Novo Vício' : contentSubTab === 'habits' ? 'Novo Hábito' : 'Novo Módulo'}
                  </button>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setContentSubTab('addictions')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      contentSubTab === 'addictions' ? 'bg-indigo-600 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Vícios ({addictions.length})
                  </button>
                  <button
                    onClick={() => setContentSubTab('habits')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      contentSubTab === 'habits' ? 'bg-indigo-600 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Hábitos Sugeridos ({habits.length})
                  </button>
                  <button
                    onClick={() => setContentSubTab('modules')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      contentSubTab === 'modules' ? 'bg-indigo-600 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    Módulos ({modules.length})
                  </button>
                </div>

                {/* Lista de Vícios */}
                {contentSubTab === 'addictions' && (
                  <div className="space-y-3">
                    {addictions.length === 0 && (
                      <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
                        <p className="text-zinc-400 text-sm">Nenhum vício cadastrado. Clique em "Novo Vício" para adicionar.</p>
                      </div>
                    )}
                    {addictions.map(addiction => (
                      <div key={addiction.id} className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: addiction.color + '20' }}>
                          {addiction.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-zinc-900">{addiction.label}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{addiction.category}</span>
                            {!addiction.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inativo</span>}
                          </div>
                          {addiction.description && <p className="text-sm text-zinc-500 truncate">{addiction.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditAddiction(addiction)}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-indigo-600"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddiction(addiction.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-500 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lista de Hábitos */}
                {contentSubTab === 'habits' && (
                  <div className="space-y-3">
                    {habits.length === 0 && (
                      <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
                        <p className="text-zinc-400 text-sm">Nenhum hábito cadastrado. Clique em "Novo Hábito" para adicionar.</p>
                      </div>
                    )}
                    {habits.map(habit => (
                      <div key={habit.id} className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: habit.color + '20' }}>
                          {habit.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-zinc-900">{habit.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{habit.category}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{habit.frequency}x/sem</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">{habit.duration} min</span>
                            {habit.addictionId && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
                                {addictions.find(a => a.id === habit.addictionId)?.label || habit.addictionId}
                              </span>
                            )}
                          </div>
                          {habit.description && <p className="text-sm text-zinc-500 truncate mt-0.5">{habit.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditHabit(habit)}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-indigo-600"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHabit(habit.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-500 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lista de Módulos */}
                {contentSubTab === 'modules' && (
                  <div className="space-y-3">
                    {modules.length === 0 && (
                      <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
                        <p className="text-zinc-400 text-sm">Nenhum módulo cadastrado. Clique em "Novo Módulo" para adicionar.</p>
                      </div>
                    )}
                    {modules.map(mod => (
                      <div key={mod.id} className="bg-white rounded-xl border border-zinc-200 p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ backgroundColor: mod.color + '20' }}>
                          {mod.imageUrl
                            ? <img src={mod.imageUrl} alt={mod.name} className="w-full h-full object-cover rounded-xl" />
                            : <span className="text-2xl">{mod.icon}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-zinc-900">{mod.name}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">{mod.category}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">{mod.requiredPlan || 'free'}</span>
                            {!mod.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Inativo</span>}
                          </div>
                          {mod.description && <p className="text-sm text-zinc-500 truncate mt-0.5">{mod.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEditModule(mod)}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-indigo-600"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-zinc-500 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal de Módulo */}
                {showModuleModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-zinc-900">{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</h3>
                        <button onClick={() => setShowModuleModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-4">
                        {/* Imagem do Módulo */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-2">Imagem do Módulo</label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: moduleForm.color + '15' }}>
                              {moduleImagePreview
                                ? <img src={moduleImagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                                : <span className="text-3xl">{moduleForm.icon}</span>
                              }
                            </div>
                            <div className="flex-1">
                              <label className="flex items-center gap-2 px-3 py-2 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-50 text-sm text-zinc-600 transition-colors">
                                <Upload className="w-4 h-4" />
                                <span>{moduleImagePreview ? 'Trocar imagem' : 'Carregar imagem'}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleModuleImageChange} />
                              </label>
                              <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WebP — máx. 5MB</p>
                              {moduleImagePreview && (
                                <button
                                  onClick={() => { setModuleImagePreview(null); setModuleImageFile(null); setModuleForm({...moduleForm, imageUrl: null}); }}
                                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                                >
                                  Remover imagem
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome *</label>
                          <input type="text" value={moduleForm.name} onChange={e => setModuleForm({...moduleForm, name: e.target.value})} placeholder="Ex: Pornografia" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Emoji/Ícone</label>
                            <input type="text" value={moduleForm.icon} onChange={e => setModuleForm({...moduleForm, icon: e.target.value})} placeholder="⭐" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Cor</label>
                            <div className="flex gap-2">
                              <input type="color" value={moduleForm.color} onChange={e => setModuleForm({...moduleForm, color: e.target.value})} className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer" />
                              <input type="text" value={moduleForm.color} onChange={e => setModuleForm({...moduleForm, color: e.target.value})} className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
                            <select value={moduleForm.category} onChange={e => setModuleForm({...moduleForm, category: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              <option value="comportamental">Comportamental</option>
                              <option value="digital">Digital</option>
                              <option value="substancia">Substância</option>
                              <option value="alimentar">Alimentar</option>
                              <option value="geral">Geral</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Plano Necessário</label>
                            <select value={moduleForm.requiredPlan} onChange={e => setModuleForm({...moduleForm, requiredPlan: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              <option value="free">Free (Gratuito)</option>
                              <option value="premium">Premium</option>
                              <option value="elite">Elite</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
                          <textarea value={moduleForm.description} onChange={e => setModuleForm({...moduleForm, description: e.target.value})} rows={2} placeholder="Descrição do módulo..." className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                        </div>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" id="moduleActive" checked={moduleForm.isActive} onChange={e => setModuleForm({...moduleForm, isActive: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
                          <label htmlFor="moduleActive" className="text-sm font-medium text-zinc-700">Módulo ativo</label>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => setShowModuleModal(false)} className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50">Cancelar</button>
                          <button onClick={handleSaveModule} disabled={uploadingImage} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
                            {uploadingImage ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span> A enviar...</> : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal de Vício */}
                {showAddictionModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-zinc-900">{editingAddiction ? 'Editar Vício' : 'Novo Vício'}</h3>
                        <button onClick={() => setShowAddictionModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome *</label>
                          <input type="text" value={addictionForm.label} onChange={e => setAddictionForm({...addictionForm, label: e.target.value})} placeholder="Ex: Pornografia" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Emoji/Ícone</label>
                            <input type="text" value={addictionForm.icon} onChange={e => setAddictionForm({...addictionForm, icon: e.target.value})} placeholder="🔴" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Cor</label>
                            <div className="flex gap-2">
                              <input type="color" value={addictionForm.color} onChange={e => setAddictionForm({...addictionForm, color: e.target.value})} className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer" />
                              <input type="text" value={addictionForm.color} onChange={e => setAddictionForm({...addictionForm, color: e.target.value})} className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
                          <select value={addictionForm.category} onChange={e => setAddictionForm({...addictionForm, category: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="geral">Geral</option>
                            <option value="digital">Digital</option>
                            <option value="substancia">Substância</option>
                            <option value="comportamental">Comportamental</option>
                            <option value="alimentar">Alimentar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
                          <textarea value={addictionForm.description} onChange={e => setAddictionForm({...addictionForm, description: e.target.value})} rows={2} placeholder="Descrição opcional..." className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => setShowAddictionModal(false)} className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50">Cancelar</button>
                          <button onClick={handleSaveAddiction} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal de Hábito */}
                {showHabitModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-4">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-zinc-900">{editingHabit ? 'Editar Hábito' : 'Novo Hábito'}</h3>
                        <button onClick={() => setShowHabitModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg"><X className="w-5 h-5" /></button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome *</label>
                          <input type="text" value={habitForm.name} onChange={e => setHabitForm({...habitForm, name: e.target.value})} placeholder="Ex: Meditação Matinal" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Emoji/Ícone</label>
                            <input type="text" value={habitForm.icon} onChange={e => setHabitForm({...habitForm, icon: e.target.value})} placeholder="⭐" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Cor</label>
                            <div className="flex gap-2">
                              <input type="color" value={habitForm.color} onChange={e => setHabitForm({...habitForm, color: e.target.value})} className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer" />
                              <input type="text" value={habitForm.color} onChange={e => setHabitForm({...habitForm, color: e.target.value})} className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Categoria</label>
                            <select value={habitForm.category} onChange={e => setHabitForm({...habitForm, category: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              <option value="geral">Geral</option>
                              <option value="exercicio">Exercício</option>
                              <option value="mindfulness">Mindfulness</option>
                              <option value="leitura">Leitura</option>
                              <option value="social">Social</option>
                              <option value="criatividade">Criatividade</option>
                              <option value="saude">Saúde</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Período</label>
                            <select value={habitForm.period} onChange={e => setHabitForm({...habitForm, period: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              <option value="morning">Manhã</option>
                              <option value="afternoon">Tarde</option>
                              <option value="evening">Noite</option>
                              <option value="anytime">Qualquer hora</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Frequência (vezes/semana)</label>
                            <input type="number" min={1} max={7} value={habitForm.frequency} onChange={e => setHabitForm({...habitForm, frequency: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Duração (minutos)</label>
                            <input type="number" min={5} max={240} value={habitForm.duration} onChange={e => setHabitForm({...habitForm, duration: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Vício Relacionado (opcional)</label>
                          <select value={habitForm.addictionId} onChange={e => setHabitForm({...habitForm, addictionId: e.target.value})} className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Nenhum (hábito geral)</option>
                            {addictions.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Descrição</label>
                          <textarea value={habitForm.description} onChange={e => setHabitForm({...habitForm, description: e.target.value})} rows={2} placeholder="Descrição opcional..." className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">Tags (separadas por vírgula)</label>
                          <input type="text" value={habitForm.tags} onChange={e => setHabitForm({...habitForm, tags: e.target.value})} placeholder="Ex: relaxamento, foco, saúde" className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => setShowHabitModal(false)} className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50">Cancelar</button>
                          <button onClick={handleSaveHabit} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Salvar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Videochamadas - Jitsi Meet */}
            {activeTab === 'videochamadas' && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Videochamadas</h2>
                
                <div className="bg-white rounded-xl border border-zinc-200 p-6 max-w-xl">
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Sistema de videochamadas ativo e funcionando
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-lg p-4">
                      <h4 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Jitsi Meet (8x8.vc)
                      </h4>
                      <p className="text-sm text-indigo-700">
                        O sistema utiliza Jitsi Meet para videochamadas, uma solução open source e gratuita.
                      </p>
                    </div>

                    <div className="bg-zinc-50 rounded-lg p-4">
                      <h4 className="font-medium text-zinc-900 mb-2">Características:</h4>
                      <ul className="text-sm text-zinc-600 space-y-2">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Sem necessidade de configuração ou API keys
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Salas criadas automaticamente para cada sessão
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Funciona em qualquer navegador
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Criptografia de ponta a ponta
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          100% gratuito e sem limites
                        </li>
                      </ul>
                    </div>

                    <div className="text-sm text-zinc-500 mt-4">
                      As salas de videochamada são geradas automaticamente quando um agendamento é confirmado.
                      Os links são enviados tanto para o usuário quanto para o psicólogo.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Alteração de Plano / Role */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900">Alterar Plano / Role</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-500">Usuário</p>
                <p className="font-medium text-zinc-900">{selectedUser.name}</p>
                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  {selectedUser.isAdmin && <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">Admin</span>}
                  {selectedUser.isPsychologist && !selectedUser.isAdmin && <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-700">Psicólogo</span>}
                  <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-200 text-zinc-600">{selectedUser.plan || 'free'}</span>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Role do Utilizador</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setNewRole('user')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      newRole === 'user' ? 'border-indigo-500 bg-indigo-50' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-lg mb-1">👤</div>
                    <div className="text-xs font-medium">Utilizador</div>
                    <div className="text-xs text-zinc-500">Normal</div>
                  </button>
                  <button
                    onClick={() => setNewRole('psychologist')}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      newRole === 'psychologist' ? 'border-teal-500 bg-teal-50' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🧠</div>
                    <div className="text-xs font-medium">Psicólogo</div>
                    <div className="text-xs text-zinc-500">Portal prof.</div>
                  </button>
                  <button
                    onClick={() => { setNewRole('admin'); setNewPlan('elite'); }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      newRole === 'admin' ? 'border-red-500 bg-red-50' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🛡️</div>
                    <div className="text-xs font-medium">Admin</div>
                    <div className="text-xs text-zinc-500">Acesso total</div>
                  </button>
                </div>
              </div>

              {/* Info da role admin */}
              {newRole === 'admin' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700 mb-1">🛡️ Role Admin — Acesso Total</p>
                  <ul className="text-xs text-red-600 space-y-0.5">
                    <li>✓ Plano Elite vitalício (automático)</li>
                    <li>✓ Acesso ao Painel Admin</li>
                    <li>✓ Acesso ao Portal de Psicólogo</li>
                    <li>✓ Todos os recursos do app desbloqueados</li>
                  </ul>
                </div>
              )}

              {/* Plano — apenas para roles não-admin */}
              {newRole !== 'admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">Plano</label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="free">Free (Gratuito)</option>
                      <option value="premium">Premium (R$ 19,90/mês)</option>
                      <option value="elite">Elite (R$ 99,90/mês)</option>
                    </select>
                  </div>

                  {newPlan !== 'free' && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">Duração (meses)</label>
                      <select
                        value={planDuration}
                        onChange={(e) => setPlanDuration(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={1}>1 mês</option>
                        <option value={3}>3 meses</option>
                        <option value={6}>6 meses</option>
                        <option value={12}>12 meses (1 ano)</option>
                        <option value={24}>24 meses (2 anos)</option>
                        <option value={120}>120 meses (Vitalício)</option>
                      </select>
                    </div>
                  )}

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-indigo-700">
                      {newPlan === 'free' 
                        ? 'O plano será alterado para Free imediatamente.'
                        : `O plano ${newPlan.toUpperCase()} será ativado por ${planDuration} ${planDuration === 1 ? 'mês' : 'meses'}.`
                      }
                    </p>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateUserPlan}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Confirmar Alteração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
