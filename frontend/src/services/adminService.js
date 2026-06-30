import API from './api'

// ─── Dashboard ──────────────────────────────────────────────────
// Backend returns: { success: true, data: { counts, financials, ... } }
export const getDashboardStats   = ()           => API.get('/dashboard/stats')

// ─── Branches ───────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllBranches  = ()           => API.get('/branches')
export const getBranchById   = (id)         => API.get(`/branches/${id}`)
export const createBranch    = (data)       => API.post('/branches', data)
export const updateBranch    = (id, data)   => API.put(`/branches/${id}`, data)
export const deleteBranch    = (id)         => API.delete(`/branches/${id}`)

// ─── Clients ────────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllClients  = ()           => API.get('/clients')
export const getClientById  = (id)         => API.get(`/clients/${id}`)
export const createClient   = (formData)   => API.post('/clients', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateClient   = (id, fd)     => API.put(`/clients/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteClient   = (id)         => API.delete(`/clients/${id}`)

// ─── Doctors ────────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllDoctors  = ()           => API.get('/doctors')
export const getDoctorById  = (id)         => API.get(`/doctors/${id}`)
export const createDoctor   = (formData)   => API.post('/doctors', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateDoctor   = (id, fd)     => API.put(`/doctors/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteDoctor   = (id)         => API.delete(`/doctors/${id}`)

// ─── Employees (Staff) ──────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllEmployees  = ()           => API.get('/employees')
export const getEmployeeById  = (id)         => API.get(`/employees/${id}`)
export const createEmployee   = (formData)   => API.post('/employees', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateEmployee   = (id, fd)     => API.put(`/employees/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteEmployee   = (id)         => API.delete(`/employees/${id}`)

// ─── Vendors ────────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllVendors  = ()           => API.get('/vendors')
export const getVendorById  = (id)         => API.get(`/vendors/${id}`)
export const createVendor   = (data)       => API.post('/vendors', data)
export const updateVendor   = (id, data)   => API.put(`/vendors/${id}`, data)
export const deleteVendor   = (id)         => API.delete(`/vendors/${id}`)

// ─── Auditors ───────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllAuditors  = ()           => API.get('/auditors')
export const getAuditorById  = (id)         => API.get(`/auditors/${id}`)
export const createAuditor   = (data)       => API.post('/auditors', data)
export const updateAuditor   = (id, data)   => API.put(`/auditors/${id}`, data)
export const deleteAuditor   = (id)         => API.delete(`/auditors/${id}`)

// ─── Invoices ───────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllInvoices  = ()           => API.get('/invoices')
export const getInvoiceById  = (id)         => API.get(`/invoices/${id}`)
export const getInvoiceStats = ()           => API.get('/invoices/stats')
export const createInvoice   = (formData)   => API.post('/invoices', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateInvoice   = (id, fd)     => API.put(`/invoices/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteInvoice   = (id)         => API.delete(`/invoices/${id}`)

// ─── Expenses ───────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllExpenses  = ()           => API.get('/expenses')
export const getExpenseById  = (id)         => API.get(`/expenses/${id}`)
export const getExpenseStats = ()           => API.get('/expenses/stats')
export const createExpense   = (formData)   => API.post('/expenses', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateExpense   = (id, fd)     => API.put(`/expenses/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteExpense   = (id)         => API.delete(`/expenses/${id}`)

// ─── Transactions ────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllTransactions  = ()           => API.get('/transactions')
export const getTransactionById  = (id)         => API.get(`/transactions/${id}`)
export const createTransaction   = (data)       => API.post('/transactions', data)
export const updateTransaction   = (id, data)   => API.put(`/transactions/${id}`, data)
export const deleteTransaction   = (id)         => API.delete(`/transactions/${id}`)

// ─── Order List ──────────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllOrders  = ()           => API.get('/orders')
export const getOrderById  = (id)         => API.get(`/orders/${id}`)
export const createOrder   = (data)       => API.post('/orders', data)
export const updateOrder   = (id, data)   => API.put(`/orders/${id}`, data)
export const deleteOrder   = (id)         => API.delete(`/orders/${id}`)

// ─── Estimation List ────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllEstimations  = ()           => API.get('/estimations')
export const getEstimationById  = (id)         => API.get(`/estimations/${id}`)
export const createEstimation   = (data)       => API.post('/estimations', data)
export const updateEstimation   = (id, data)   => API.put(`/estimations/${id}`, data)
export const deleteEstimation   = (id)         => API.delete(`/estimations/${id}`)

// ─── Delivery List ───────────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllDeliveries  = ()           => API.get('/deliveries')
export const getDeliveryById   = (id)         => API.get(`/deliveries/${id}`)
export const createDelivery    = (data)       => API.post('/deliveries', data)
export const updateDelivery    = (id, data)   => API.put(`/deliveries/${id}`, data)
export const deleteDelivery    = (id)         => API.delete(`/deliveries/${id}`)

// ─── Host (Superadmin) ───────────────────────────────────────────
// Backend returns: { success: true, data: [...] }
export const getAllHosts  = ()           => API.get('/hosts')
export const getHostById  = (id)         => API.get(`/hosts/${id}`)
export const createHost   = (data)       => API.post('/hosts', data)
export const updateHost   = (id, data)   => API.put(`/hosts/${id}`, data)
export const deleteHost   = (id)         => API.delete(`/hosts/${id}`)

// ─── Categories ──────────────────────────────────────────────────
export const getAllCategories  = ()           => API.get('/categories')
export const createCategory    = (data)       => API.post('/categories', data)
export const updateCategory    = (id, data)   => API.put(`/categories/${id}`, data)
export const deleteCategory    = (id)         => API.delete(`/categories/${id}`)

// ─── Brands ──────────────────────────────────────────────────────
export const getAllBrands  = ()           => API.get('/brands')
export const createBrand   = (data)       => API.post('/brands', data)
export const updateBrand   = (id, data)   => API.put(`/brands/${id}`, data)
export const deleteBrand   = (id)         => API.delete(`/brands/${id}`)

// ─── Payment Modes ───────────────────────────────────────────────
export const getAllPaymentModes  = ()           => API.get('/payment-modes')
export const createPaymentMode   = (data)       => API.post('/payment-modes', data)
export const updatePaymentMode   = (id, data)   => API.put(`/payment-modes/${id}`, data)
export const deletePaymentMode   = (id)         => API.delete(`/payment-modes/${id}`)

// ─── Products ────────────────────────────────────────────────────
export const getAllProducts  = ()           => API.get('/products')
export const createProduct   = (data)       => API.post('/products', data)
export const updateProduct   = (id, data)   => API.put(`/products/${id}`, data)
export const deleteProduct   = (id)         => API.delete(`/products/${id}`)

// ─── Treatments ──────────────────────────────────────────────────
export const getAllTreatments  = ()           => API.get('/treatments')
export const createTreatment   = (data)       => API.post('/treatments', data)
export const updateTreatment   = (id, data)   => API.put(`/treatments/${id}`, data)
export const deleteTreatment   = (id)         => API.delete(`/treatments/${id}`)
