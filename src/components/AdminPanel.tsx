import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, UserCheck, Calendar, Settings, 
  BarChart3, Search, MoreVertical, Ban, CheckCircle, 
  Trash2, Edit, Plus, Video, X, Eye, ChevronLeft, ChevronRight,
  TrendingUp, DollarSign, Clock, Shield
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
  zoomEmail: string;
  isActive: boolean;
}

type Tab = 'dashboard' | 'users' | 'posts' | 'professionals' | 'appointments' | 'zoom';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
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
    name: '', email: '', password: '', specialty: '', crp: '', bio: '', photoUrl: '', hourlyRate: 0, zoomEmail: ''
  });
  
  // Zoom
  const [zoomConfig, setZoomConfig] = useState({ accountId: '', clientId: '', clientSecret: '' });
  const [zoomConfigured, setZoomConfigured] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

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
        case 'zoom':
          const zoomRes = await api.get('/admin/zoom/config');
          setZoomConfigured(zoomRes.data.data.configured);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar dados');
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
      setProfessionalForm({ name: '', email: '', password: '', specialty: '', crp: '', bio: '', photoUrl: '', hourlyRate: 0, zoomEmail: '' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar profissional');
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
      zoomEmail: prof.zoomEmail || ''
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

  // Zoom config
  const handleSaveZoomConfig = async () => {
    try {
      await api.post('/admin/zoom/config', zoomConfig);
      alert('Configuração do Zoom salva com sucesso!');
      setZoomConfigured(true);
    } catch (err) {
      alert('Erro ao salvar configuração do Zoom');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'posts', label: 'Posts', icon: MessageSquare },
    { id: 'professionals', label: 'Psicólogos', icon: UserCheck },
    { id: 'zoom', label: 'Zoom', icon: Video },
  ];

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
                    <p className="text-sm text-zinc-500">Psicólogos Ativos</p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 border border-zinc-200">
                    <div className="flex items-center justify-between mb-4">
                      <Calendar className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-3xl font-bold text-zinc-900">{dashboardData.appointments.total}</p>
                    <p className="text-sm text-zinc-500">Agendamentos</p>
                  </div>
                </div>

                {/* Users by Plan */}
                <div className="bg-white rounded-xl p-6 border border-zinc-200">
                  <h3 className="font-semibold text-zinc-900 mb-4">Usuários por Plano</h3>
                  <div className="flex gap-8">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-zinc-400"></div>
                      <span className="text-zinc-600">Free: {dashboardData.users.byPlan.free}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-indigo-500"></div>
                      <span className="text-zinc-600">Premium: {dashboardData.users.byPlan.premium}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                      <span className="text-zinc-600">Elite: {dashboardData.users.byPlan.elite}</span>
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
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Buscar usuário..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadData()}
                        className="pl-10 pr-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={userPlanFilter}
                      onChange={(e) => { setUserPlanFilter(e.target.value); setTimeout(loadData, 100); }}
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
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Usuário</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Plano</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Sequência</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Pontos</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Status</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-zinc-900">{user.name}</p>
                              <p className="text-sm text-zinc-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.plan === 'elite' ? 'bg-amber-100 text-amber-700' :
                              user.plan === 'premium' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-zinc-100 text-zinc-700'
                            }`}>
                              {user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">{user.streak || 0} dias</td>
                          <td className="px-6 py-4 text-zinc-600">{user.points || 0}</td>
                          <td className="px-6 py-4">
                            {user.isBanned ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Banido</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Ativo</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
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
                </div>
              </div>
            )}

            {/* Posts */}
            {activeTab === 'posts' && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Posts do Fórum</h2>
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Título</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Autor</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Categoria</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Curtidas</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-zinc-500 uppercase">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {posts.map(post => (
                        <tr key={post.id} className="hover:bg-zinc-50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-zinc-900 truncate max-w-xs">{post.title}</p>
                          </td>
                          <td className="px-6 py-4 text-zinc-600">{post.authorName}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
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
                </div>
              </div>
            )}

            {/* Professionals */}
            {activeTab === 'professionals' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900">Psicólogos</h2>
                  <button
                    onClick={() => { setEditingProfessional(null); setProfessionalForm({ name: '', email: '', password: '', specialty: '', crp: '', bio: '', photoUrl: '', hourlyRate: 0, zoomEmail: '' }); setShowProfessionalModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Psicólogo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {professionals.map(prof => (
                    <div key={prof.id} className="bg-white rounded-xl border border-zinc-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {prof.photoUrl ? (
                            <img src={prof.photoUrl} alt={prof.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserCheck className="w-6 h-6 text-indigo-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-zinc-900">{prof.name}</p>
                            <p className="text-sm text-zinc-500">{prof.specialty}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          prof.isActive ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          {prof.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-zinc-600"><span className="font-medium">CRP:</span> {prof.crp}</p>
                        <p className="text-sm text-zinc-600"><span className="font-medium">Email:</span> {prof.email}</p>
                        {prof.hourlyRate > 0 && (
                          <p className="text-sm text-zinc-600"><span className="font-medium">Valor/hora:</span> R$ {prof.hourlyRate}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProfessional(prof)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleProfessional(prof.id, prof.isActive)}
                          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                            prof.isActive 
                              ? 'border border-orange-200 text-orange-600 hover:bg-orange-50' 
                              : 'border border-green-200 text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {prof.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => handleDeleteProfessional(prof.id)}
                          className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Professional Modal */}
                {showProfessionalModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
                      <div className="flex items-center justify-between p-6 border-b border-zinc-200">
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {editingProfessional ? 'Editar Psicólogo' : 'Novo Psicólogo'}
                        </h3>
                        <button onClick={() => setShowProfessionalModal(false)} className="p-2 hover:bg-zinc-100 rounded-lg">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="p-6 space-y-4">
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Especialidade</label>
                            <input
                              type="text"
                              value={professionalForm.specialty}
                              onChange={(e) => setProfessionalForm({ ...professionalForm, specialty: e.target.value })}
                              placeholder="Ex: Psicologia Clínica"
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">CRP</label>
                            <input
                              type="text"
                              value={professionalForm.crp}
                              onChange={(e) => setProfessionalForm({ ...professionalForm, crp: e.target.value })}
                              placeholder="Ex: 06/123456"
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
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
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1">URL da Foto</label>
                          <input
                            type="url"
                            value={professionalForm.photoUrl}
                            onChange={(e) => setProfessionalForm({ ...professionalForm, photoUrl: e.target.value })}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Valor/hora (R$)</label>
                            <input
                              type="number"
                              value={professionalForm.hourlyRate}
                              onChange={(e) => setProfessionalForm({ ...professionalForm, hourlyRate: parseFloat(e.target.value) || 0 })}
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Email do Zoom</label>
                            <input
                              type="email"
                              value={professionalForm.zoomEmail}
                              onChange={(e) => setProfessionalForm({ ...professionalForm, zoomEmail: e.target.value })}
                              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 p-6 border-t border-zinc-200">
                        <button
                          onClick={() => setShowProfessionalModal(false)}
                          className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition-colors"
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
                )}
              </div>
            )}

            {/* Zoom Config */}
            {activeTab === 'zoom' && (
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-6">Configuração do Zoom</h2>
                
                <div className="bg-white rounded-xl border border-zinc-200 p-6 max-w-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <Video className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-zinc-900">Integração Zoom</h3>
                      <p className="text-sm text-zinc-500">Configure as credenciais da API do Zoom para videochamadas</p>
                    </div>
                    {zoomConfigured && (
                      <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Configurado
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Account ID</label>
                      <input
                        type="text"
                        value={zoomConfig.accountId}
                        onChange={(e) => setZoomConfig({ ...zoomConfig, accountId: e.target.value })}
                        placeholder="Seu Account ID do Zoom"
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Client ID</label>
                      <input
                        type="text"
                        value={zoomConfig.clientId}
                        onChange={(e) => setZoomConfig({ ...zoomConfig, clientId: e.target.value })}
                        placeholder="Seu Client ID do Zoom"
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Client Secret</label>
                      <input
                        type="password"
                        value={zoomConfig.clientSecret}
                        onChange={(e) => setZoomConfig({ ...zoomConfig, clientSecret: e.target.value })}
                        placeholder="Seu Client Secret do Zoom"
                        className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="bg-zinc-50 rounded-lg p-4 mt-4">
                      <h4 className="font-medium text-zinc-900 mb-2">Como obter as credenciais:</h4>
                      <ol className="text-sm text-zinc-600 space-y-1 list-decimal list-inside">
                        <li>Acesse <a href="https://marketplace.zoom.us" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">marketplace.zoom.us</a></li>
                        <li>Crie um app do tipo "Server-to-Server OAuth"</li>
                        <li>Copie o Account ID, Client ID e Client Secret</li>
                        <li>Ative os escopos: meeting:write, user:read</li>
                      </ol>
                    </div>

                    <button
                      onClick={handleSaveZoomConfig}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mt-4"
                    >
                      Salvar Configuração
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
