import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import * as S from '../services/adminService'

/*
 ╔══════════════════════════════════════════════════════╗
 ║   Generic helpers — useGet, useSave, useRemove       ║
 ╚══════════════════════════════════════════════════════╝
*/

/**
 * Generic GET query wrapper
 * @param {string}   key       - query key
 * @param {Function} fetchFn   - adminService fetch function
 */
export const useGetAll = (key, fetchFn) =>
  useQuery({
    queryKey: [key],
    queryFn: () => fetchFn().then(r => r.data.data || []),
    staleTime: 30_000,
  })

/**
 * Generic SAVE mutation (create or update)
 * @param {Function} createFn
 * @param {Function} updateFn
 * @param {string}   invalidateKey
 */
export const useSave = (createFn, updateFn, invalidateKey) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => id ? updateFn(id, data) : createFn(data),
    onSuccess: (_, { id }) => {
      toast.success(id ? 'Updated successfully' : 'Created successfully')
      qc.invalidateQueries({ queryKey: [invalidateKey] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Operation failed')
    },
  })
}

/**
 * Generic DELETE mutation
 * @param {Function} deleteFn
 * @param {string}   invalidateKey
 */
export const useRemove = (deleteFn, invalidateKey) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => deleteFn(id),
    onSuccess: () => {
      toast.success('Deleted successfully')
      qc.invalidateQueries({ queryKey: [invalidateKey] })
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Delete failed')
    },
  })
}

/*
 ╔══════════════════════════════════════════════════════╗
 ║   Module-specific hooks                              ║
 ╚══════════════════════════════════════════════════════╝
*/

// ─── Branches ──────────────────────────────────────────────────
export const useBranches  = ()     => useGetAll('branches', S.getAllBranches)
export const useSaveBranch = ()    => useSave(S.createBranch, S.updateBranch, 'branches')
export const useDeleteBranch = ()  => useRemove(S.deleteBranch, 'branches')

// ─── Clients ───────────────────────────────────────────────────
export const useClients    = ()    => useGetAll('clients', S.getAllClients)
export const useSaveClient = ()    => useSave(S.createClient, S.updateClient, 'clients')
export const useDeleteClient = ()  => useRemove(S.deleteClient, 'clients')

// ─── Doctors ───────────────────────────────────────────────────
export const useDoctors    = ()    => useGetAll('doctors', S.getAllDoctors)
export const useSaveDoctor = ()    => useSave(S.createDoctor, S.updateDoctor, 'doctors')
export const useDeleteDoctor = ()  => useRemove(S.deleteDoctor, 'doctors')

// ─── Employees ─────────────────────────────────────────────────
export const useEmployees     = ()  => useGetAll('employees', S.getAllEmployees)
export const useSaveEmployee  = ()  => useSave(S.createEmployee, S.updateEmployee, 'employees')
export const useDeleteEmployee = () => useRemove(S.deleteEmployee, 'employees')

// ─── Vendors ───────────────────────────────────────────────────
export const useVendors     = ()   => useGetAll('vendors', S.getAllVendors)
export const useSaveVendor  = ()   => useSave(S.createVendor, S.updateVendor, 'vendors')
export const useDeleteVendor = ()  => useRemove(S.deleteVendor, 'vendors')

// ─── Auditors ──────────────────────────────────────────────────
export const useAuditors     = ()  => useGetAll('auditors', S.getAllAuditors)
export const useSaveAuditor  = ()  => useSave(S.createAuditor, S.updateAuditor, 'auditors')
export const useDeleteAuditor = () => useRemove(S.deleteAuditor, 'auditors')

// ─── Invoices ──────────────────────────────────────────────────
export const useInvoices     = ()  => useGetAll('invoices', S.getAllInvoices)
export const useSaveInvoice  = ()  => useSave(S.createInvoice, S.updateInvoice, 'invoices')
export const useDeleteInvoice = () => useRemove(S.deleteInvoice, 'invoices')

// ─── Expenses ──────────────────────────────────────────────────
export const useExpenses     = ()  => useGetAll('expenses', S.getAllExpenses)
export const useSaveExpense  = ()  => useSave(S.createExpense, S.updateExpense, 'expenses')
export const useDeleteExpense = () => useRemove(S.deleteExpense, 'expenses')

// ─── Transactions ───────────────────────────────────────────────
export const useTransactions     = ()  => useGetAll('transactions', S.getAllTransactions)
export const useSaveTransaction  = ()  => useSave(S.createTransaction, S.updateTransaction, 'transactions')
export const useDeleteTransaction = () => useRemove(S.deleteTransaction, 'transactions')

// ─── Orders ────────────────────────────────────────────────────
export const useOrders     = ()    => useGetAll('orders', S.getAllOrders)
export const useSaveOrder  = ()    => useSave(S.createOrder, S.updateOrder, 'orders')
export const useDeleteOrder = ()   => useRemove(S.deleteOrder, 'orders')

// ─── Estimations ───────────────────────────────────────────────
export const useEstimations     = ()  => useGetAll('estimations', S.getAllEstimations)
export const useSaveEstimation  = ()  => useSave(S.createEstimation, S.updateEstimation, 'estimations')
export const useDeleteEstimation = () => useRemove(S.deleteEstimation, 'estimations')

// ─── Deliveries ────────────────────────────────────────────────
export const useDeliveries     = ()  => useGetAll('deliveries', S.getAllDeliveries)
export const useSaveDelivery   = ()  => useSave(S.createDelivery, S.updateDelivery, 'deliveries')
export const useDeleteDelivery = ()  => useRemove(S.deleteDelivery, 'deliveries')

// ─── Hosts ─────────────────────────────────────────────────────
export const useHosts     = ()    => useGetAll('hosts', S.getAllHosts)
export const useSaveHost  = ()    => useSave(S.createHost, S.updateHost, 'hosts')
export const useDeleteHost = ()   => useRemove(S.deleteHost, 'hosts')

// ─── Dashboard ─────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () => S.getDashboardStats().then(r => r.data.data),
    staleTime: 60_000,
  })

// ─── Categories ────────────────────────────────────────────────
export const useCategories     = ()  => useGetAll('categories', S.getAllCategories)
export const useSaveCategory   = ()  => useSave(S.createCategory, S.updateCategory, 'categories')
export const useDeleteCategory = ()  => useRemove(S.deleteCategory, 'categories')

// ─── Brands ────────────────────────────────────────────────────
export const useBrands     = ()  => useGetAll('brands', S.getAllBrands)
export const useSaveBrand  = ()  => useSave(S.createBrand, S.updateBrand, 'brands')
export const useDeleteBrand = () => useRemove(S.deleteBrand, 'brands')

// ─── Payment Modes ─────────────────────────────────────────────
export const usePaymentModes     = ()  => useGetAll('paymentModes', S.getAllPaymentModes)
export const useSavePaymentMode  = ()  => useSave(S.createPaymentMode, S.updatePaymentMode, 'paymentModes')
export const useDeletePaymentMode = () => useRemove(S.deletePaymentMode, 'paymentModes')

// ─── Products ──────────────────────────────────────────────────
export const useProducts     = ()  => useGetAll('products', S.getAllProducts)
export const useSaveProduct  = ()  => useSave(S.createProduct, S.updateProduct, 'products')
export const useDeleteProduct = () => useRemove(S.deleteProduct, 'products')

// ─── Treatments ────────────────────────────────────────────────
export const useTreatments     = ()  => useGetAll('treatments', S.getAllTreatments)
export const useSaveTreatment  = ()  => useSave(S.createTreatment, S.updateTreatment, 'treatments')
export const useDeleteTreatment = () => useRemove(S.deleteTreatment, 'treatments')
