import client from './client';

const unwrap = (res) => {
  if (res && res.data !== undefined) return res.data;
  return res;
};

export const adminApi = {
  // Auth
  login: async (email, password) => {
    const res = await client.post('/auth/login', { email, password });
    return unwrap(res); // { access_token, user }
  },

  // Dashboard Metrics
  getStats: async () => {
    const res = await client.get('/admin/stats');
    return unwrap(res);
  },

  // Shop Management
  getShops: async (params = {}) => {
    const res = await client.get('/admin/shops', { params });
    return unwrap(res); // { shops: [], total: number }
  },

  updateShopStatus: async (shopId, status, reason = '') => {
    const res = await client.patch(`/admin/shops/${shopId}/status`, { status, reason });
    return unwrap(res);
  },

  banShop: async (shopId, { reason, blacklist_ip = true, blacklist_device = true, blacklist_images = true }) => {
    const res = await client.post(`/admin/shops/${shopId}/ban`, {
      reason,
      blacklist_ip,
      blacklist_device,
      blacklist_images,
    });
    return unwrap(res);
  },

  // Reports & Grievance Desk
  getReports: async (params = {}) => {
    const res = await client.get('/admin/reports', { params });
    return unwrap(res);
  },

  resolveReport: async (reportId, status, actionTaken) => {
    const res = await client.post(`/admin/reports/${reportId}/resolve`, {
      status,
      action_taken: actionTaken,
    });
    return unwrap(res);
  },

  // Blacklist & Ban Evasion
  getBannedEntities: async (params = {}) => {
    const res = await client.get('/admin/banned-entities', { params });
    return unwrap(res);
  },

  addBannedEntity: async ({ entity_type, entity_value, reason }) => {
    const res = await client.post('/admin/banned-entities', {
      entity_type,
      entity_value,
      reason,
    });
    return unwrap(res);
  },

  unbanEntity: async (id) => {
    const res = await client.delete(`/admin/banned-entities/${id}`);
    return unwrap(res);
  },

  // Categories Management
  getCategories: async () => {
    const res = await client.get('/admin/categories');
    return unwrap(res); // array of categories
  },

  createCategory: async (payload) => {
    const res = await client.post('/admin/categories', payload);
    return unwrap(res);
  },

  updateCategory: async (id, payload) => {
    const res = await client.put(`/admin/categories/${id}`, payload);
    return unwrap(res);
  },

  deleteCategory: async (id) => {
    const res = await client.delete(`/admin/categories/${id}`);
    return unwrap(res);
  },

  // User & Merchant Directory
  getUsers: async (params = {}) => {
    const res = await client.get('/admin/users', { params });
    return unwrap(res); // { users: [], total: number }
  },

  updateUserStatus: async (userId, { is_active, role }) => {
    const res = await client.patch(`/admin/users/${userId}/status`, { is_active, role });
    return unwrap(res);
  },

  // Master Catalog & High-Speed Seeding Engine
  getMasterProducts: async (params = {}) => {
    const res = await client.get('/admin/catalog/products', { params });
    return unwrap(res);
  },

  createMasterProduct: async (payload) => {
    const res = await client.post('/admin/catalog/products', payload);
    return unwrap(res);
  },

  updateMasterProduct: async (id, payload) => {
    const res = await client.put(`/admin/catalog/products/${id}`, payload);
    return unwrap(res);
  },

  deleteMasterProduct: async (id) => {
    const res = await client.delete(`/admin/catalog/products/${id}`);
    return unwrap(res);
  },

  getMasterCatalogStats: async () => {
    const res = await client.get('/admin/catalog/stats');
    return unwrap(res);
  },

  bulkSeedMasterCatalog: async (products) => {
    const res = await client.post('/admin/catalog/bulk-seed', { products });
    return unwrap(res);
  },

  // Soft-Delete vs Hard-Delete Governance
  getSoftDeletedProducts: async (params = {}) => {
    const res = await client.get('/admin/products/soft-deleted', { params });
    return unwrap(res);
  },

  restoreProduct: async (id) => {
    const res = await client.post(`/admin/products/${id}/restore`);
    return unwrap(res);
  },

  hardDeleteProduct: async (id) => {
    const res = await client.delete(`/admin/products/${id}`);
    return unwrap(res);
  },

  // System Error Telemetry & Live Performance Metrics
  getErrors: async () => {
    const res = await client.get('/admin/errors');
    return unwrap(res);
  },

  clearErrors: async () => {
    const res = await client.delete('/admin/errors/clear');
    return unwrap(res);
  },

  getPerformanceMetrics: async () => {
    const res = await client.get('/admin/performance-metrics');
    return unwrap(res);
  },

  // Database Backups & Snapshots
  triggerBackup: async () => {
    const res = await client.post('/admin/backup/trigger');
    return unwrap(res);
  },

  getBackups: async () => {
    const res = await client.get('/admin/backups');
    return unwrap(res);
  },
};
