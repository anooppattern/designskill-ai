import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign Up — designskill AI",
};

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <AuthForm mode="signup" />
    </div>
  );
}
