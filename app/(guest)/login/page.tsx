import React from "react";
import { LoginForm } from "./login-form";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sign In",
};

async function SignInPage() {
  const session = await auth();

  if (session) {
    return redirect("/admin/home");
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE (Branding) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white flex-col justify-center items-center p-10">
        
        <div className="max-w-md text-center space-y-6">
          
          <Image
            src="/sy.png"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto"
          />

          <h1 className="text-3xl font-bold">
            SY ASSOCIATES
          </h1>

          <p className="text-blue-100">
            Manage billing, track revenue, and analyze profit & loss —
            all in one powerful platform.
          </p>

        </div>
      </div>

      {/* RIGHT SIDE (Login Form) */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[#F8FAFC] p-6 md:p-10">
        
        <div className="w-full max-w-md space-y-6">

          {/* TITLE */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#1E293B]">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-gray-500">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* FORM CARD */}
          <div className="bg-white shadow-lg rounded-xl p-6 border">
            <LoginForm />
          </div>

          {/* FOOTER */}
          <p className="text-center text-xs text-gray-400">
            © {new Date().getFullYear()} SY ASSOCIATES
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignInPage;