import React from 'react'
import { LoginForm } from './login-form'
import { Metadata } from 'next'
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: "SignIn"
}

async function SignInPage({ searchParams }: { searchParams: Promise<{callbackUrl: string}>}) {
    const session = await auth()
  
    if(session) {
        return redirect("/admin/dashboard")
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <LoginForm />
            </div>
        </div>
    )
}

export default SignInPage