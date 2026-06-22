import api from './api';

export const adminService = {
  getDashboardStats: async () => {
    const data = await api.get('/admin/dashboard').then(r => r.data);
    return {
      users: {
        total:               data.totalUsers,
        jobSeekers:          data.seekers,
        employers:           data.employers,
        activeSubscriptions: data.activeSubs,
        verifiedUsers:       data.verifiedUsers,
        newThisWeek:         data.newThisWeek,
      },
      jobs: {
        total:  data.totalJobs,
        active: data.activeJobs,
      },
      payments: {
        total:        data.totalPayments,
        totalRevenue: data.revenue,
        monthlyRevenue: data.monthlyRevenue,
      },
    };
  },

  getUsers: async ({ page = 1, limit = 10, role, search } = {}) => {
    return api.get('/admin/users', { params: { page, limit, role, search } }).then(r => r.data);
  },

  updateUserStatus: async (id, { isActive, isVerified }) => {
    return api.patch(`/admin/users/${id}`, { isActive, isVerified }).then(r => r.data);
  },

  getAllJobs: async ({ page = 1, limit = 10, status, search } = {}) => {
    return api.get('/admin/jobs', { params: { page, limit, status, search } }).then(r => r.data);
  },

  getSkills: async () => {
    return api.get('/admin/skills').then(r => r.data);
  },

  createSkill: async (data) => {
    return api.post('/admin/skills', data).then(r => r.data);
  },

  updateSkill: async (id, data) => {
    return api.put(`/admin/skills/${id}`, data).then(r => r.data);
  },

  getQuestions: async ({ skillId } = {}) => {
    return api.get('/admin/questions', { params: { skillId } }).then(r => r.data);
  },

  createQuestion: async (data) => {
    return api.post('/admin/questions', data).then(r => r.data);
  },

  updateQuestion: async (id, data) => {
    return api.put(`/admin/questions/${id}`, data).then(r => r.data);
  },

  deleteQuestion: async (id) => {
    return api.delete(`/admin/questions/${id}`).then(r => r.data);
  },

  getPayments: async ({ page = 1, limit = 20, status, type } = {}) => {
    return api.get('/admin/payments', { params: { page, limit, status, type } }).then(r => r.data);
  },
};