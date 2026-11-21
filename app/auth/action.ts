"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.resetPasswordForEmail(
    formData.get("email") as string,
    { redirectTo: `${origin}/auth/callback?next=/reset-password` }
  );

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?message=Check your email for the reset link");
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: formData.get("password") as string,
  });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/customer");
}