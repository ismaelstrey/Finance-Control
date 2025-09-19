"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
  };

  return (
    <Button
      onClick={handleGoogleSignIn}
      className={className}
      variant="outline"
    >
      <LogIn className="mr-2 h-4 w-4" />
      Entrar com Google
    </Button>
  );
}