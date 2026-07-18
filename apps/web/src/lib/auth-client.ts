"use client";

import { createAuthClient } from "better-auth/react";
import { APP_URL } from "./config";

export const authClient = createAuthClient({
  baseURL: APP_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { signIn, signUp, signOut, useSession } = authClient;
