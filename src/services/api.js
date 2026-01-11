import { API_URL, API_ENDPOINTS } from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
    this.token = localStorage.getItem('pare_token');
  }

  // Helper method to get headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method to handle fetch
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.auth !== false),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Generic HTTP methods (axios-like interface for AdminPanel)
  async get(endpoint, config = {}) {
    let url = endpoint;
    if (config.params) {
      const queryParams = new URLSearchParams(config.params).toString();
      if (queryParams) {
        url = `${endpoint}?${queryParams}`;
      }
    }
    const response = await this.request(`/api${url}`, { method: 'GET' });
    return { data: response };
  }

  async post(endpoint, data = {}) {
    const response = await this.request(`/api${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { data: response };
  }

  async put(endpoint, data = {}) {
    const response = await this.request(`/api${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return { data: response };
  }

  async delete(endpoint) {
    const response = await this.request(`/api${endpoint}`, {
      method: 'DELETE',
    });
    return { data: response };
  }

  // Set token
  setToken(token) {
    this.token = token;
    localStorage.setItem('pare_token', token);
  }

  // Clear token
  clearToken() {
    this.token = null;
    localStorage.removeItem('pare_token');
  }

  // Auth endpoints
  async register(name, email, password) {
    const data = await this.request(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      auth: false,
    });
    
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    
    return data;
  }

  async login(email, password) {
    const data = await this.request(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      auth: false,
    });
    
    if (data.data?.token) {
      this.setToken(data.data.token);
    }
    
    return data;
  }

  async getMe() {
    return await this.request(API_ENDPOINTS.GET_ME);
  }

  // User endpoints
  async getProfile() {
    return await this.request(API_ENDPOINTS.GET_PROFILE);
  }

  async updateProfile(profileData) {
    return await this.request(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async updatePlan(plan) {
    return await this.request(API_ENDPOINTS.UPDATE_PLAN, {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return await this.request(API_ENDPOINTS.CHANGE_PASSWORD, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async deleteAccount() {
    return await this.request(API_ENDPOINTS.DELETE_ACCOUNT, {
      method: 'DELETE',
    });
  }

  async getDashboard() {
    return await this.request(API_ENDPOINTS.GET_DASHBOARD);
  }

  // Module endpoints
  async getModules() {
    return await this.request(API_ENDPOINTS.GET_MODULES);
  }

  async createModule(moduleData) {
    return await this.request(API_ENDPOINTS.CREATE_MODULE, {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  }

  async getModule(id) {
    return await this.request(API_ENDPOINTS.GET_MODULE(id));
  }

  async deleteModule(id) {
    return await this.request(API_ENDPOINTS.DELETE_MODULE(id), {
      method: 'DELETE',
    });
  }

  async checkIn(id) {
    return await this.request(API_ENDPOINTS.CHECK_IN(id), {
      method: 'PUT',
    });
  }

  async recordRelapse(id, note) {
    return await this.request(API_ENDPOINTS.RECORD_RELAPSE(id), {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async getModuleStats(id) {
    return await this.request(API_ENDPOINTS.GET_MODULE_STATS(id));
  }

  // Achievement endpoints
  async getAllAchievements() {
    return await this.request(API_ENDPOINTS.GET_ALL_ACHIEVEMENTS);
  }

  async getUserAchievements() {
    return await this.request(API_ENDPOINTS.GET_USER_ACHIEVEMENTS);
  }

  async getAchievementsStatus() {
    return await this.request(API_ENDPOINTS.GET_ACHIEVEMENTS_STATUS);
  }

  async checkAchievements(moduleId) {
    return await this.request(API_ENDPOINTS.CHECK_ACHIEVEMENTS(moduleId), {
      method: 'POST',
    });
  }

  async initializeAchievements() {
    return await this.request(API_ENDPOINTS.INITIALIZE_ACHIEVEMENTS, {
      method: 'POST',
    });
  }

  // Forum endpoints
  async getPosts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams 
      ? `${API_ENDPOINTS.GET_POSTS}?${queryParams}` 
      : API_ENDPOINTS.GET_POSTS;
    return await this.request(endpoint);
  }

  async createPost(postData) {
    return await this.request(API_ENDPOINTS.CREATE_POST, {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getPost(id) {
    return await this.request(API_ENDPOINTS.GET_POST(id));
  }

  async updatePost(id, postData) {
    return await this.request(API_ENDPOINTS.UPDATE_POST(id), {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id) {
    return await this.request(API_ENDPOINTS.DELETE_POST(id), {
      method: 'DELETE',
    });
  }

  async toggleLike(id) {
    return await this.request(API_ENDPOINTS.TOGGLE_LIKE(id), {
      method: 'POST',
    });
  }

  async addReply(id, replyData) {
    return await this.request(API_ENDPOINTS.ADD_REPLY(id), {
      method: 'POST',
      body: JSON.stringify(replyData),
    });
  }

  async deleteReply(postId, replyId) {
    return await this.request(API_ENDPOINTS.DELETE_REPLY(postId, replyId), {
      method: 'DELETE',
    });
  }

  async getForumStats() {
    return await this.request(API_ENDPOINTS.GET_FORUM_STATS);
  }
}

// Export singleton instance
export const api = new ApiService();
export default api;
