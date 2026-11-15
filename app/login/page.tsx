"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { assets } from "@/lib/assets";

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

export default function LoginPage() {
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
     if (isLogin) {
  // TODO: call your login API here
  const role = new URLSearchParams(window.location.search).get("role");
  const routes: Record<string, string> = {
    seller: "/seller",
    customer: "/customer",
    admin: "/admin",
  };
  router.push(routes[role ?? ""] ?? "/customer");
      } else {
        // TODO: call your signup API here
        setInfoMessage("Account created! You can now log in.");
        setIsLogin(true);
        setFormData({ ...emptyForm, email: formData.email });
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setAuthError("");
    setInfoMessage("");
  };

  const inputClass = (hasError?: string) =>
    `w-full border rounded-lg px-4 py-2 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 ${
      hasError ? "border-red-400 focus:ring-red-400" : "border-white/20 focus:ring-[#c4b5fd]"
    }`;

  return (
    <div
      className="min-h-screen flex items-center justify-center md:justify-end md:pr-20 lg:pr-32 bg-gray-100 bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: `url(${assets.login})` }}
    >
      <div className="w-full max-w-md mt-8 mb-8 bg-[#1e1b4b] rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {isLogin ? "Welcome back" : "Create An Account"}
        </h2>
        <p className="text-gray-300 font-bold mb-6">
          {isLogin ? "Log in to your account" : "Sign up to get started"}
        </p>

        {infoMessage && (
          <div className="bg-green-500/10 border border-green-400/30 text-green-300 text-sm rounded-lg px-4 py-2 mb-4">
            {infoMessage}
          </div>
        )}
        {authError && (
          <div className="bg-red-500/10 border border-red-400/30 text-red-300 text-sm rounded-lg px-4 py-2 mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass(errors.name)}
                placeholder="user"
              />
              {errors.name && <p className="text-red-300 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass(errors.email)}
              placeholder="user@example.com"
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">Password</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
            {!isLogin && !errors.password && (
              <p className="text-gray-400 text-xs mt-1">
                Min 8 characters, upper case, lower case, a number, a special character
              </p>
            )}
            {isLogin && (
              <div className="text-right mt-1">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-[#c4b5fd] text-xs hover:underline"
                >
                  Forgot password ?
                </button>
              </div>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-1">
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-300 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#c4b5fd] text-gray-900 font-medium rounded-full py-2.5 mt-2 hover:brightness-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-300 text-sm mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={toggleMode} className="text-[#c4b5fd] hover:underline font-medium">
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}