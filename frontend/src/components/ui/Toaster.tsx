'use client'

import { useToastStore } from '@/stores/toastStore'
import styles from './Toaster.module.css'

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const remove = useToastStore((state) => state.remove)

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${styles[t.type]}`}
          onClick={() => remove(t.id)}
          role="status"
        >
          <span className={styles.icon}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i'}
          </span>
          <span className={styles.message}>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
