'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLogin } from '@/hooks/useAuth'
import styles from './LoginForm.module.css'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()
  const loginMutation = useLogin()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await loginMutation.mutateAsync({ email, password })
      router.push('/trade/KRW-BTC')
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>로그인</h1>

      <div className={styles.field}>
        <label className={styles.label}>이메일</label>
        <input
          type="email"
          className={styles.input}
          value={email}
          onChange={handleEmailChange}
          placeholder="이메일을 입력하세요"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>비밀번호</label>
        <input
          type="password"
          className={styles.input}
          value={password}
          onChange={handlePasswordChange}
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.submitButton} disabled={loginMutation.isPending}>
        {loginMutation.isPending ? '로그인 중...' : '로그인'}
      </button>

      <div className={styles.footer}>
        계정이 없으신가요? <Link href="/signup" className={styles.link}>회원가입</Link>
      </div>
    </form>
  )
}
