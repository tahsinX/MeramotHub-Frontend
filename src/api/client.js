const API_BASE = 'http://127.0.0.1:8000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE;
  }

  getToken() {
    return localStorage.getItem('meramot_token');
  }

  setToken(token) {
    localStorage.setItem('meramot_token', token);
  }

  removeToken() {
    localStorage.removeItem('meramot_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = { ...options.headers };

    if (!(options.body instanceof URLSearchParams) && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  postForm(endpoint, data) {
    const body = new URLSearchParams(data);
    return this.request(endpoint, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  // ──── Auth ────
  async register(data) {
    return this.post('/auth/register', data);
  }

  async login(phone, password) {
    const result = await this.postForm('/auth/login', {
      username: phone,
      password: password,
    });
    if (result.access_token) {
      this.setToken(result.access_token);
    }
    return result;
  }

  async getMe() {
    return this.get('/auth/me');
  }

  updateProfile(data) {
    return this.patch('/auth/me', data);
  }

  logout() {
    this.removeToken();
  }

  // ──── Services ────
  getCategories() {
    return this.get('/services/categories');
  }

  // Backend GET /services/items should return items with provider_id, provider_name, provider_area
  getServiceItems(categoryId) {
    const q = categoryId ? `?category_id=${categoryId}` : '';
    return this.get(`/services/items${q}`);
  }

  getServiceItem(id) {
    return this.get(`/services/items/${id}`);
  }

  createServiceItem(data) {
    return this.post('/services/items', data);
  }

  getMyServiceItems() {
    return this.get('/services/items/my');
  }

  toggleServiceItemStatus(itemId) {
    return this.patch(`/services/items/${itemId}/status`);
  }

  editServiceItem(itemId, data) {
    return this.patch(`/services/items/${itemId}/edit`, data);
  }
  // ──── Providers ────
  getProviders() {
    return this.get('/providers/');
  }

  getNearbyProviders(lat, lon, radiusKm = 10) {
    return this.get(`/providers/nearby?latitude=${lat}&longitude=${lon}&radius_km=${radiusKm}`);
  }

  getPendingProviders() {
    return this.get('/providers/pending');
  }

  createProviderProfile(data) {
    return this.post('/providers/profile', data);
  }

  getMyProviderProfile() {
    return this.get('/providers/profile/me');
  }

  updateProviderLocation(data) {
    return this.patch('/providers/profile/location', data);
  }

  verifyProvider(id, data) {
    return this.patch(`/providers/${id}/verify`, data);
  }

  // ──── Bookings ────
  createBooking(data) {
    return this.post('/bookings/', data);
  }

  getMyBookings() {
    return this.get('/bookings/my');
  }

  getAssignedJobs() {
    return this.get('/bookings/assigned');
  }

  acceptBooking(id) {
    return this.patch(`/bookings/${id}/accept`);
  }

  startBooking(id) {
    return this.patch(`/bookings/${id}/start`);
  }

  completeBooking(id) {
    return this.patch(`/bookings/${id}/complete`);
  }

  confirmBooking(id) {
    return this.patch(`/bookings/${id}/confirm`);
  }

  cancelBooking(id) {
    return this.patch(`/bookings/${id}/cancel`);
  }

  // ──── Payments ────
  getMyPayments() {
    return this.get('/payments/my');
  }

  getMyEarnings() {
    return this.get('/payments/earnings');
  }

  getPaymentDashboard() {
    return this.get('/payments/dashboard');
  }

  // ──── Reviews ────
  createReview(data) {
    return this.post('/reviews/', data);
  }

  getMyReviews() {
    return this.get('/reviews/my');
  }

  getProviderReviews(providerId) {
    return this.get(`/reviews/provider/${providerId}`);
  }

  // ──── Complaints ────
  fileComplaint(data) {
    return this.post('/complaints/', data);
  }

  getMyComplaints() {
    return this.get('/complaints/my');
  }

  getAllComplaints() {
    return this.get('/complaints/');
  }

  assignComplaint(id, data) {
    return this.patch(`/complaints/${id}/assign`, data);
  }

  resolveComplaint(id, data) {
    return this.patch(`/complaints/${id}/resolve`, data);
  }

  // ──── Admin ────
  getAdminStats() {
    return this.get('/admin/stats');
  }

  getAdminUsers() {
    return this.get('/admin/users');
  }

  deactivateUser(id) {
    return this.patch(`/admin/users/${id}/deactivate`);
  }

  activateUser(id) {
    return this.patch(`/admin/users/${id}/activate`);
  }

  changeUserRole(id, data) {
    return this.patch(`/admin/users/${id}/role`, data);
  }

  getAreaManagerStats() {
    return this.get('/admin/area-manager/stats');
  }

  approveProvider(id) {
    return this.patch(`/admin/providers/${id}/approve`);
  }

  getVerifiedProviders() {
    return this.get('/admin/providers/verified');
  }

  createAreaManager(data) {
    return this.post('/admin/area-managers', data);
  }

  // ──── Chatbot ────
  chatBot(message) {
    return this.post('/chat/bot', { message });
  }

  getWhatsAppLink(providerId) {
    return this.post('/chat/whatsapp', { provider_id: providerId });
  }

  // ──── In-platform Messaging ────
  sendMessage(receiverId, text) {
    return this.post('/chat/messages', { receiver_id: receiverId, text });
  }

  getConversations() {
    return this.get('/chat/conversations');
  }

  getConversationMessages(userId) {
    return this.get(`/chat/conversations/${userId}/messages`);
  }

  getChatUser(userId) {
    return this.get(`/chat/users/${userId}`);
  }

  // ──── Priyo / Subscription ────
  subscribePriyo(plan = 'priyo_basic') {
    return this.post('/priyo/subscribe', { plan_name: plan });
  }

  getSubscription() {
    return this.get('/priyo/subscription');
  }

  unsubscribePriyo() {
    return this.delete('/priyo/unsubscribe');
  }

  instantBook(data) {
    return this.post('/priyo/instant-book', data);
  }
}

const api = new ApiClient();
export default api;
