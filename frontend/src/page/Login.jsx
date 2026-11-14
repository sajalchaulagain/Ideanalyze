import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import FormField from "../components/ui/FormField";
import { inputClass } from "../components/ui/formStyles";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading, isAuthenticated } = useAuth();

  useDocumentMeta(
    "Log in · Ideanalyze AI",
    "Log in to analyse and manage your startup ideas."
  );

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const redirectTo = location.state?.from || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!emailPattern.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      await login(form.email.trim(), form.password);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setServerError(
        error.message || "Login failed. Check your email and password."
      );
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
        Welcome back
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        Log in to your workspace
      </h1>
      <p className="mt-2 text-sm leading-6 text-fg-muted">
        Continue turning ideas into clear, testable plans.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        {serverError && <ErrorState message={serverError} />}

        <FormField label="Email" htmlFor="login-email" required error={errors.email}>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update}
            className={inputClass}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
        </FormField>

        <FormField
          label="Password"
          htmlFor="login-password"
          required
          error={errors.password}
        >
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update}
              className={`${inputClass} pr-12`}
              placeholder="Your password"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </FormField>

        <Button type="submit" loading={authLoading} className="w-full" size="lg">
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-fg-muted">
        New here?{" "}
        <Link
          to="/signup"
          className="font-semibold text-accent transition-colors hover:text-accent/80"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
