import { createContext, useContext, useState, useCallback } from 'react'

const ConfirmDialogContext = createContext()

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null)

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      setDialog({
        title: config.title || 'Xác nhận',
        message: config.message || 'Bạn có chắc chắn?',
        confirmText: config.confirmText || 'Xác nhận',
        cancelText: config.cancelText || 'Hủy',
        onConfirm: () => {
          resolve(true)
          setDialog(null)
        },
        onCancel: () => {
          resolve(false)
          setDialog(null)
        },
        type: config.type || 'warning',
      })
    })
  }, [])

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      {dialog && <ConfirmDialog {...dialog} />}
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error('useConfirm must be used within ConfirmDialogProvider')
  }

  if (typeof context === 'function') {
    return context
  }

  if (typeof context.confirm === 'function') {
    return context.confirm
  }

  throw new Error('useConfirm must return a confirm function')
}

function ConfirmDialog({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type,
}) {
  const isError = type === 'error'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(2, 6, 23, 0.72)',
        zIndex: 2147483647,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '28rem',
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <span
            className={`material-symbols-outlined text-[48px] ${
              isError ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            {isError ? 'error' : 'warning'}
          </span>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#f8fafc', fontSize: '1.75rem', fontWeight: 700 }}>
          {title}
        </h3>

        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#cbd5e1', fontSize: '1rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: '#475569',
              color: '#e2e8f0',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              background: isError ? '#f87171' : '#60a5fa',
              color: '#0f172a',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
