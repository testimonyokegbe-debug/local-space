"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const emptyForm: FormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function AuthCard() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof FormData]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (authError) setAuthError("");
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    };
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isLogin) {
      const check = validatePassword(formData.password);
      if (!check.isValid) {
        const missing: string[] = [];
        if (!check.hasMinLength) missing.push("8+ characters");
        if (!check.hasUpperCase) missing.push("an uppercase letter");
        if (!check.hasLowerCase) missing.push("a lowercase letter");
        if (!check.hasNumber) missing.push("a number");
        if (!check.hasSpecialChar) missing.push("a special character");
        newErrors.password = `Password needs: ${missing.join(", ")}`;
      }
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError("");
    setInfoMessage("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const email = formData.email.trim();

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password,
        });
        if (error) throw new Error("Invalid email or password");

        router.push("/customer");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: formData.password,
          options: {
            data: { full_name: formData.name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw new Error(error.message);

        // Supabase returns an empty identities list when the email already exists
        if (data.user && data.user.identities?.length === 0) {
          throw new Error("An account with this email already exists. Try logging in.");
        }

        if (data.session) {
          // Email confirmation is off: user is already logged in
          router.push("/customer");
          router.refresh();
        } else {
          // Email confirmation is on: ask them to check their inbox
          setInfoMessage("Account created! Check your email to confirm, then log in.");
          setIsLogin(true);
          setFormData({ ...emptyForm, email });
        }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setAuthError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setAuthError(error.message);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setAuthError("");
    setInfoMessage("");
  };

  const inputClass = (hasError?: string) =>
    `w-full border rounded-lg px-4 py-2 bg-black/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 ${
      hasError ? "border-red-400 focus:ring-red-400" : "border-white/30 focus:ring-[#c4b5fd]"
    }`;

  return (
    <div className="grid overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md md:grid-cols-2">
      {/* LEFT: form */}
      <div className="p-8">
        <h1 className="mb-1 text-3xl font-bold text-white">Welcome to Local Space</h1>
        <p className="mb-6 text-sm text-gray-200">
          {isLogin ? "Log in to find and book trusted local services" : "Sign up to get started"}
        </p>

        {infoMessage && (
          <div className="mb-4 rounded-lg border border-green-400/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
            {infoMessage}
          </div>
        )}
        {authError && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-100">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass(errors.name)}
                placeholder="Your full name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-100">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass(errors.email)}
              placeholder="user@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-100">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${inputClass(errors.password)} pr-10`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password}</p>}
            {!isLogin && !errors.password && (
              <p className="mt-1 text-xs text-gray-300">
                Min 8 characters, upper case, lower case, a number, a special character
              </p>
            )}
            {isLogin && (
              <div className="mt-1 text-right">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs text-[#c4b5fd] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-100">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputClass(errors.confirmPassword)} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-300">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-[#c4b5fd] py-2.5 font-medium text-gray-900 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-300">
          <span className="h-px flex-1 bg-white/20" />
          OR
          <span className="h-px flex-1 bg-white/20" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 py-2.5 font-medium text-white transition hover:bg-white/20"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z" />
            <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-200">
          {isLogin ? "New to Local Space?" : "Already have an account?"}{" "}
          <button onClick={toggleMode} className="font-medium text-[#c4b5fd] hover:underline">
            {isLogin ? "Create new account" : "Log in"}
          </button>
        </p>
      </div>

      {/* RIGHT: QR code */}
      <div className="hidden flex-col items-center justify-center border-l border-white/20 bg-white/5 p-8 md:flex">
        <div className="rounded-2xl bg-white p-4">
          <QRCodeSVG value={SITE_URL} size={160} />
        </div>
        <p className="mt-6 max-w-[220px] text-center text-lg text-white">
          <span className="font-bold">Scan to open</span> Local Space on your phone
        </p>
      </div>
    </div>
  );
}