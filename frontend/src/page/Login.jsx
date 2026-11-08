import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";

const inputStyles =
  "w-full rounded-xl border border-surface-600 bg-text-hi px-3.5 py-2.5 text-sm text-surface-800 placeholder:text-text-mid focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-surface-600 transition-colors dark:border-surface-600 dark:bg-surface-800 dark:text-surface-700 dark:placeholder:text-text-lo";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authLoading } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password) {
      setError("Please enter both your email and password.");
      return;
    }

    try {
      await login(form.email.trim(), form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-surface-800 dark:text-text-hi">Welcome back</h1>
      <p className="mt-1 text-sm text-text-lo dark:text-text-mid">Log in to continue analyzing your ideas with Ideanalyze AI.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ErrorState message={error} />

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-surface-600 dark:text-surface-600">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={inputStyles}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="mb-1.5 text-sm font-semibold text-surface-600 dark:text-surface-600">Password</label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"
            className={inputStyles}
          />
        </div>

        <Button type="submit" loading={authLoading} className="w-full" size="lg">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-lo dark:text-text-mid">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-accent-500 hover:text-accent-500 dark:text-accent-300">
          Sign up
        </Link>
      </p>
    </div>
  );
}
