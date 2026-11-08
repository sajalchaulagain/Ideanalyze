import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import FormField from "../components/ui/FormField";
import { inputClass } from "../components/ui/formStyles";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

function scorePassword(value) {
  return [
    value.length >= 8,
    /[A-Z]/.test(value) && /[a-z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;
}

function PasswordField({
  id,
  name,
  label,
  value,
  onChange,
  show,
  onToggle,
  error,
  hint,
}) {
  return (
    <FormField label={label} htmlFor={id} required error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={value}
          onChange={onChange}
          className={`${inputClass} pr-12`}
          placeholder="At least 8 characters"
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-surface-muted hover:text-fg"
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={show}
        >
          {show ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </FormField>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, authLoading, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [show, setShow] = useState({ password: false, confirmPassword: false });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  };

  const score = scorePassword(form.password);
  const strengthLabel = strengthLabels[score] || "";
  const strengthColor =
    score < 2 ? "bg-danger" : score < 4 ? "bg-warning" : "bg-success";

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!emailPattern.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Create a password.";
    else if (form.password.length < 8)
      next.password = "Use at least 8 characters.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "Include at least one letter and one number.";
    if (form.password !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    try {
      await signup(form.name.trim(), form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error.code === "EMAIL_TAKEN" || error.field === "email") {
        setErrors((current) => ({
          ...current,
          email: error.message || "That email is already registered.",
        }));
      } else if (error.field === "password") {
        setErrors((current) => ({
          ...current,
          password: error.message || "Choose a stronger password.",
        }));
      } else {
        setServerError(error.message || "Signup failed. Please try again.");
      }
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-accent">
        Start building
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        Create your workspace
      </h1>
      <p className="mt-2 text-sm leading-6 text-fg-muted">
        Keep your ideas, analysis, and next steps together.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        {serverError && <ErrorState message={serverError} />}

        <FormField label="Name" htmlFor="signup-name" required error={errors.name}>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={update}
            className={inputClass}
            placeholder="Your name"
            maxLength={80}
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>

        <FormField label="Email" htmlFor="signup-email" required error={errors.email}>
          <input
            id="signup-email"
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

        <div>
          <PasswordField
            id="signup-password"
            name="password"
            label="Password"
            value={form.password}
            onChange={update}
            show={show.password}
            onToggle={() =>
              setShow((current) => ({
                ...current,
                password: !current.password,
              }))
            }
            error={errors.password}
            hint="At least 8 characters with a letter and a number."
          />
          <div className="mt-2">
            <div
              className="grid grid-cols-4 gap-1"
              role="progressbar"
              aria-label="Password strength"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={score}
            >
              {[0, 1, 2, 3].map((segment) => (
                <span
                  key={segment}
                  className={`h-1 rounded-full ${
                    segment < score ? strengthColor : "bg-surface-strong"
                  }`}
                />
              ))}
            </div>
            {form.password && (
              <p className="mt-1.5 text-xs font-medium text-fg-muted">
                Strength: {strengthLabel}
              </p>
            )}
          </div>
        </div>

        <PasswordField
          id="signup-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={form.confirmPassword}
          onChange={update}
          show={show.confirmPassword}
          onToggle={() =>
            setShow((current) => ({
              ...current,
              confirmPassword: !current.confirmPassword,
            }))
          }
          error={errors.confirmPassword}
        />

        <Button type="submit" loading={authLoading} className="w-full" size="lg">
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-fg-muted">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-accent transition-colors hover:text-accent/80"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
