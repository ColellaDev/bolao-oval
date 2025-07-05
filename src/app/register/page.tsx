'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'


const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Número inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
})

type RegisterData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema)
  })

  const router = useRouter()

  const onSubmit = async (data: RegisterData) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const resData = await res.json()
        throw new Error(resData.error || 'Erro ao cadastrar')
      }
      router.push('/login')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message)
    }
  }

  return (
    
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-xl p-8 shadow-lg">
        
        <h1 className="text-3xl font-bold text-text mb-6 text-center">Cadastro</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Nome"
              {...register('name')}
              className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              type="tel"
              placeholder="Celular"
              {...register('phone')}
              className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Senha"
              {...register('password')}
              className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirme a senha"
              {...register('confirmPassword')}
              className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          {status === 'success' && (
            <p className="text-green-400 text-center font-medium">✅ Cadastro realizado com sucesso!</p>
          )}

          {status === 'error' && (
            <p className="text-red-400 text-center font-medium">❌ {errorMessage}</p>
          )}
        </form>
      </div>
    </main>
  )
}