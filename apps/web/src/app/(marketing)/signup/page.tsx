import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-24 h-64 glow-horizon opacity-70" />
      <div className="container-page relative py-16 sm:py-20">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
