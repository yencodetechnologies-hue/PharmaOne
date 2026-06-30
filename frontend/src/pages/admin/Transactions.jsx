import { useState } from 'react'
import {
  useTransactions,
  useSaveTransaction,
  useDeleteTransaction,
} from '../../hooks/useAdminMutations'
import { SearchBar, ConfirmModal } from '../../components/common/UIComponents'

const init = {
  rollType: '', staffName: '', amount: '',
  transactionDate: '', paymentMode: 'Cash',
  referenceNo: '', notes: '',
}
const ROLL_TYPES    = ['Collection', 'Refund', 'Advance', 'Salary', 'Commission', 'Other']
const PAYMENT_MODES = ['Reference Mode', 'Cash', 'Card', 'UPI', 'Net Banking', 'Cheque']
const PM_COLOR      = { Cash:'success', Card:'info', UPI:'primary', 'Net Banking':'warning', 'Reference Mode':'danger', Cheque:'primary' }

export default function Transactions() {
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(init)
  const [deleteId, setDeleteId]   = useState(null)

  const { data = [], isLoading }  = useTransactions()
  const saveMutation              = useSaveTransaction()
  const deleteMutation            = useDeleteTransaction()

  const F = (k) => ({
    className: 'form-control',
    value: form[k],
    onChange: (e) => setForm({ ...form, [k]: e.target.value }),
  })

  const openCreate = () => { setEditing(null); setForm(init); setShowModal(true) }
  const openEdit   = (t) => {
    setEditing(t._id)
    setForm({
      rollType: t.rollType || '', staffName: t.staffName || '',
      amount: t.amount || '', transactionDate: t.transactionDate?.slice(0, 10) || '',
      paymentMode: t.paymentMode || 'Cash',
      referenceNo: t.referenceNo || '', notes: t.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(
      { id: editing, data: form },
      { onSuccess: () => { setShowModal(false); setEditing(null) } }
    )
  }

  const handleDelete = () => {
    deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  const filtered = data.filter(d =>
    `${d.staffName} ${d.rollType} ${d.paymentMode}`.toLowerCase().includes(search.toLowerCase())
  )
  const total = data.reduce((s, d) => s + Number(d.amount || 0), 0)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>Total: ₹{total.toLocaleString('en-IN')} across {data.length} records</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Transaction</button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by staff, roll type..." />
        </div>

        {isLoading ? (
          <div className="loading"><div className="spinner" />Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48 }}>💳</div>
            <h3>No transactions found</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Roll Type</th><th>Staff Name</th><th>Amount</th>
                  <th>Payment Mode</th><th>Reference No</th>
                  <th>Transaction Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d._id}>
                    <td><span className="badge badge-primary">{d.rollType || '—'}</span></td>
                    <td style={{ fontWeight: 600 }}>{d.staffName || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(d.amount).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${PM_COLOR[d.paymentMode] || 'primary'}`}>{d.paymentMode}</span></td>
                    <td style={{ fontSize: 13 }}>{d.referenceNo || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {d.transactionDate ? new Date(d.transactionDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(d)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal ── scrollbar INSIDE card ─────────────────── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-lg">

            {/* Sticky header — never scrolls */}
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Transaction' : '+ Add Transaction'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Scrollable body — scrollbar lives here */}
            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="modal-body">
                <div className="section-title">Transaction Details</div>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Roll Type *</label>
                    <select {...F('rollType')} required>
                      <option value="">Select Roll Type</option>
                      {ROLL_TYPES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Staff Name *</label>
                    <input {...F('staffName')} placeholder="Enter staff name" required />
                  </div>
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label>Amount *</label>
                    <input {...F('amount')} type="number" placeholder="0.00" required />
                  </div>
                  <div className="form-group">
                    <label>Transaction Date *</label>
                    <input {...F('transactionDate')} type="date" required />
                  </div>
                  <div className="form-group">
                    <label>Payment Mode *</label>
                    <select {...F('paymentMode')} required>
                      {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Reference No</label>
                  <input {...F('referenceNo')} placeholder="Reference / Transaction ID" />
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea {...F('notes')} className="form-control" rows={3} placeholder="Additional notes..." />
                </div>
              </div>

              {/* Sticky footer — never scrolls */}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? '⏳ Saving...' : (editing ? 'Update Transaction' : 'Create Transaction')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
