import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="container-page py-16">
      <AuthForm mode="signup" />
    </div>
  );
}
