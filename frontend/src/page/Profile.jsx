import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIdeas } from "../context/IdeasContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import SuccessMessage from "../components/SuccessMessage";

const inputStyles =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-900/50";

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { ideas } = useIdeas();

  const [isEditing, setIsEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const startEditing = () => {
    setNameDraft(user?.name || "");
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleSave = () => {
    if (!nameDraft.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    updateProfile({ name: nameDraft.trim() });
    setIsEditing(false);
    setSuccess("Profile updated successfully.");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">Profile</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account details and view platform stats.</p>

      <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900/90">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-md shadow-indigo-500/20">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name || "Builder"}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || ""}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{ideas.length}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Ideas Saved</p>
          </div>
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-950/50">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {new Set(ideas.map((idea) => idea.category).filter(Boolean)).size}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Categories Analyzed</p>
          </div>
        </div>

        {/* Form actions */}
        <div className="mt-6 space-y-3">
          <ErrorState message={error} />
          <SuccessMessage message={success} />

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Display name
                </label>
                <input
                  id="name"
                  type="text"
                  value={nameDraft}
                  onChange={(event) => setNameDraft(event.target.value)}
                  className={inputStyles}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>Save</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={startEditing} className="flex-1">
                Edit Profile
              </Button>
              <Button variant="danger" onClick={handleLogout} className="flex-1">
                Log Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Developer Information Card */}
      <div className="mt-6 rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-6 dark:border-indigo-900/40 dark:bg-indigo-950/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Ideanalyze AI Platform</h3>
            <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
              Designed & Developed by <span className="font-semibold">Sajal Chaulagain aka Mr. Chaule</span>
            </p>
          </div>
          <a
            href="https://sajalchaulagain.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Portfolio ↗
          </a>
        </div>
      </div>
    </div>
  );
}
