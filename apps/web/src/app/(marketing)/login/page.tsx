import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-24 h-64 glow-horizon opacity-70" />
      <div className="container-page relative py-16 sm:py-20">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
