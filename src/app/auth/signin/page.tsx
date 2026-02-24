import { AuthForm } from "@/components/auth-form";

export const metadata = {
  title: "Sign In — designskill AI",
};

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <AuthForm mode="signin" />
    </div>
  );
}
