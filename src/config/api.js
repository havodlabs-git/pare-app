// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://pare-app-backend-295077330394.us-central1.run.app';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  GET_ME: '/api/auth/me',
  
  // User
  GET_PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',
  UPDATE_PLAN: '/api/users/plan',
  CHANGE_PASSWORD: '/api/users/password',
  DELETE_ACCOUNT: '/api/users/account',
  GET_DASHBOARD: '/api/users/dashboard',
  
  // Modules
  GET_MODULES: '/api/modules',
  CREATE_MODULE: '/api/modules',
  GET_MODULE: (id) => `/api/modules/${id}`,
  DELETE_MODULE: (id) => `/api/modules/${id}`,
  CHECK_IN: (id) => `/api/modules/${id}/checkin`,
  RECORD_RELAPSE: (id) => `/api/modules/${id}/relapse`,
  GET_MODULE_STATS: (id) => `/api/modules/${id}/stats`,
  
  // Achievements
  GET_ALL_ACHIEVEMENTS: '/api/achievements',
  GET_USER_ACHIEVEMENTS: '/api/achievements/user',
  GET_ACHIEVEMENTS_STATUS: '/api/achievements/status',
  CHECK_ACHIEVEMENTS: (moduleId) => `/api/achievements/check/${moduleId}`,
  INITIALIZE_ACHIEVEMENTS: '/api/achievements/initialize',
  
  // Forum
  GET_POSTS: '/api/forum/posts',
  CREATE_POST: '/api/forum/posts',
  GET_POST: (id) => `/api/forum/posts/${id}`,
  UPDATE_POST: (id) => `/api/forum/posts/${id}`,
  DELETE_POST: (id) => `/api/forum/posts/${id}`,
  TOGGLE_LIKE: (id) => `/api/forum/posts/${id}/like`,
  ADD_REPLY: (id) => `/api/forum/posts/${id}/reply`,
  DELETE_REPLY: (postId, replyId) => `/api/forum/posts/${postId}/reply/${replyId}`,
  GET_FORUM_STATS: '/api/forum/stats',
};
