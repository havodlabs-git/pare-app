import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, UserCheck, Calendar, Settings, 
  BarChart3, Search, MoreVertical, Ban, CheckCircle, 
  Trash2, Edit, Plus, Video, X, Eye, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, Clock, Shield, LogIn, LogOut
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

type Tab = 'dashboard' | 'users' | 'posts' | 'professionals' | 'appointments' | 'videochamadas';

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
      const response = await api.login(loginEmail, loginPassword);
      if (response.success && response.data?.token) {
        setIsLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Erro ao fazer login');
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

  // Modal para alterar plano
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newPlan, setNewPlan] = useState('free');
  const [planDuration, setPlanDuration] = useState(1);

  const openPlanModal = (user: User) => {
    setSelectedUser(user);
    setNewPlan(user.plan || 'free');
    setPlanDuration(1);
    setShowPlanModal(true);
  };

  const handleUpdateUserPlan = async () => {
    if (!selectedUser) return;
    try {
      await api.put(`/admin/users/${selectedUser.id}/plan`, {
        plan: newPlan,
        duration: newPlan !== 'free' ? planDuration : null
      });
      setShowPlanModal(false);
      setSelectedUser(null);
      loadData();
      alert(`Plano atualizado para ${newPlan.toUpperCase()} com sucesso!`);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar plano');
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



  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'professionals', label: 'Psicólogos', icon: UserCheck },
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
                        <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Plano</th>
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
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.plan === 'elite' ? 'bg-purple-100 text-purple-700' :
                              user.plan === 'premium' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              {user.plan || 'free'}
                            </span>
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

      {/* Modal de Alteração de Plano */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-zinc-900">Alterar Plano do Usuário</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-lg p-4">
                <p className="text-sm text-zinc-500">Usuário</p>
                <p className="font-medium text-zinc-900">{selectedUser.name}</p>
                <p className="text-sm text-zinc-500">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Novo Plano</label>
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
