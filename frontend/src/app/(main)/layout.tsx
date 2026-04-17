'use client'

import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { useWebSocket } from '@/hooks/useWebSocket'
import styles from './layout.module.css'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useWebSocket()

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
