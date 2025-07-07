'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Lock, Mail } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha inválida')
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
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
      toast.success('Login realizado com sucesso!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Erro ao fazer login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-2xl space-y-6 text-center border border-zinc-800"
      >
        <h1 className="text-3xl font-bold text-primary text-center">
          Login
        </h1>

        <div className="space-y-2">
          <div className="relative flex items-center">
            <Mail className="w-5 h-5 absolute left-3 text-muted" />
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full bg-surface text-text border border-muted pl-10 pr-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
          {errors.email && (<p className="text-red-400 text-left text-sm">{errors.email.message}</p>)}
        </div>

        <div className="space-y-2">
          <div className="relative flex items-center">
            <Lock className="w-5 h-5 absolute left-3 text-muted" />
            <input
              type="password"
              placeholder="Senha"
              {...register('password')}
              className="w-full bg-surface text-text border border-muted pl-10 pr-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>
          {errors.password && (<p className="text-red-400 text-left text-sm">{errors.password.message}</p>)}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logando...' : 'Login'}
        </button>

        <p className="text-sm text-muted">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            Crie uma agora
          </button>
        </p>
      </form>
    </div>
  )
}
