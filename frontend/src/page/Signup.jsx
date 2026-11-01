import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";

/*
  Signup page — FRONTEND UI ONLY, no real account creation yet.
  Mirrors the Login page structure on purpose: both forms validate
  locally, then call one AuthContext function that will later hit
  the Express backend.
*/

const inputStyles =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, authLoading } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Frontend validation: catch obvious mistakes before any request.
    // (The backend will validate again — never trust the client alone.)
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // TODO: Send signup data to Express backend.
      // Later this becomes: POST http://localhost:5000/api/auth/signup
      // with { name, email, password }. Express will hash the password,
      // store the user in MongoDB, and reply with { user, token }.
      await signup(form.name.trim(), form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError("Signup failed. Please try again.");
      void err;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Start turning ideas into plans today.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <ErrorState message={error} />

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputStyles}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={inputStyles}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              className={inputStyles}
            />
          </div>
        </div>

        <Button type="submit" loading={authLoading} className="w-full" size="lg">
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
