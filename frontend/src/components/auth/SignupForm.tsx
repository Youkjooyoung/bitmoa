'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSignup } from '@/hooks/useAuth'
import styles from './LoginForm.module.css'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const router = useRouter()
  const signupMutation = useSignup()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.')
      return
    }

    try {
      await signupMutation.mutateAsync({ email, password, nickname })
      router.push('/login')
    } catch (err) {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h1 className={styles.title}>회원가입</h1>

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
          placeholder="8자 이상 입력하세요"
          required
          minLength={8}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>닉네임</label>
        <input
          type="text"
          className={styles.input}
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임을 입력하세요"
          required
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button type="submit" className={styles.submitButton} disabled={signupMutation.isPending}>
        {signupMutation.isPending ? '가입 중...' : '회원가입'}
      </button>

      <div className={styles.footer}>
        이미 계정이 있으신가요? <Link href="/login" className={styles.link}>로그인</Link>
      </div>
    </form>
  )
}
