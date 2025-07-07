'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'

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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
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
      toast.success('Cadastro realizado com sucesso!')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message || 'Ocorreu um erro ao cadastrar.')
    }
  }

  return (
    
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-xl p-8 shadow-lg">
        
        <h1 className="text-3xl font-bold text-primary mb-6 text-center">Crie sua conta</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1">
            <div className="relative flex items-center">
              <User className="w-5 h-5 absolute left-3 text-muted" />
              <input
                type="text"
                placeholder="Nome"
                {...register('name')}
                className="w-full bg-surface text-text border border-muted pl-10 pr-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            {errors.name && (<p className="text-red-400 text-left text-sm">{errors.name.message}</p>)}
          </div>

          <div className="space-y-1">
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

          <div className="space-y-1">
            <div className="relative flex items-center">
              <Phone className="w-5 h-5 absolute left-3 text-muted" />
              <input
                type="tel"
                placeholder="Celular"
                {...register('phone')}
                className="w-full bg-surface text-text border border-muted pl-10 pr-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            {errors.phone && (<p className="text-red-400 text-left text-sm">{errors.phone.message}</p>)}
          </div>

          <div className="space-y-1">
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 absolute left-3 text-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                {...register('password')}
                className="w-full bg-surface text-text border border-muted pl-10 pr-10 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-muted hover:text-primary transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (<p className="text-red-400 text-left text-sm">{errors.password.message}</p>)}
          </div>

          <div className="space-y-1">
            <div className="relative flex items-center">
              <Lock className="w-5 h-5 absolute left-3 text-muted" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirme a senha"
                {...register('confirmPassword')}
                className="w-full bg-surface text-text border border-muted pl-10 pr-10 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-muted hover:text-primary transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (<p className="text-red-400 text-left text-sm">{errors.confirmPassword.message}</p>)}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <p className="text-sm text-muted text-center">
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Faça login
            </button>
          </p>
        </form>
      </div>
    </main>
  )
}