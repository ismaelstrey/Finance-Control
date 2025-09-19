import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  fetchOptions: {
    onError: (e) => {
      if (e.error.status === 401) {
        window.location.href = "/login";
      }
    },
  },
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;