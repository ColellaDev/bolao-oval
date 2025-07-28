'use client'

import Image from 'next/image'
import Logo from '@/assets/Logo.png'
import { RegisterForm } from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 max-w-6xl w-full">
        <div>
          <Image
            src={Logo}
            alt="Bolão Oval Logo"
            width={400}
            height={400}
            quality={100}
            priority
            className="h-40 w-40 object-contain lg:h-96 lg:w-96"
          />
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}