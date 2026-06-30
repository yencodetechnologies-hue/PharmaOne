import { useState } from 'react'

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }}>🔍</span>
      <input
        className="form-control"
        style={{ paddingLeft: 36 }}
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export function Toast({ message, type, onClose }) {
  if (!message) return null
  return (
    <div className={`toast toast-${type}`} onClick={onClose}>
      {type === 'success' ? '✓ ' : '✗ '}{message}
    </div>
  )
}

export function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Confirm Delete</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{message || 'Are you sure you want to delete this record? This action cannot be undone.'}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
            <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}
