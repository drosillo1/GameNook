// src/lib/toast.ts
type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id:      string
  type:    ToastType
  message: string
}

type Listener = (toasts: Toast[]) => void

class ToastStore {
  private toasts:    Toast[]    = []
  private listeners: Listener[] = []

  subscribe(fn: Listener) {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }

  private emit() {
    this.listeners.forEach(fn => fn([...this.toasts]))
  }

  add(message: string, type: ToastType = 'success') {
    const id = Math.random().toString(36).slice(2)
    this.toasts.push({ id, type, message })
    this.emit()
    setTimeout(() => this.remove(id), 3500)
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.emit()
  }
}

export const toastStore = new ToastStore()

// Helpers de uso rápido
export const toast = {
  success: (msg: string) => toastStore.add(msg, 'success'),
  error:   (msg: string) => toastStore.add(msg, 'error'),
  info:    (msg: string) => toastStore.add(msg, 'info'),
  warning: (msg: string) => toastStore.add(msg, 'warning'),
}