'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha inválida')
})



type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema)
  })

  const router = useRouter()
  const { fetchUser } = useAuth()

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const resData = await res.json()
        throw new Error(resData.error || 'Erro ao fazer login')
      }

      await fetchUser()
      router.push('/')
      
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-lg space-y-4 text-center"
      >
        <h1 className="text-2xl font-bold text-primary text-center">Login</h1>

        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Senha"
            {...register('password')}
            className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded transition cursor-pointer"
        >
          {isSubmitting ? 'Logando...' : 'Login'}
        </button>

        {status === 'error' && (
          <p className="text-red-500 text-center">❌ {errorMessage}</p>
        )}

        <button
          type="button"
          onClick={() => router.push('/register')}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          Criar conta
        </button>
      </form>
    </div>
  )
}
