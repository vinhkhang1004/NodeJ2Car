import api from './api';

// ─── CATEGORIES ───────────────────────────────────────────────
export const fetchCategories = (activeOnly = false) =>
    api.get('/categories', { params: activeOnly ? { active: 'true' } : {} });

export const fetchCategoryById = (id) => api.get(`/categories/${id}`);

export const createCategory = (data) => api.post('/categories', data);

export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const fetchCategoryStats = () => api.get('/categories/admin/stats');

// ─── PRODUCTS ─────────────────────────────────────────────────
export const fetchProducts = (params = {}) => api.get('/products', { params });

export const fetchProductById = (id) => api.get(`/products/${id}`);

export const createProduct = (data) => api.post('/products', data);

export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const fetchProductAdminStats = () => api.get('/products/admin/stats');

// ─── UPLOAD ───────────────────────────────────────────────────
export const uploadImage = (formData) => api.post('/upload', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});
