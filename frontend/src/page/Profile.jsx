import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIdeas } from "../context/IdeasContext";
import Button from "../components/Button";
import ErrorState from "../components/ErrorState";
import SuccessMessage from "../components/SuccessMessage";

const inputStyles =
  "w-full rounded-xl border border-surface-600 bg-text-hi px-3.5 py-2.5 text-sm text-surface-800 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-surface-600 transition-colors dark:border-surface-600 dark:bg-surface-800 dark:text-surface-700 dark:focus:ring-accent-600/50";

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
      <h1 className="text-2xl font-bold tracking-tight text-surface-800 sm:text-3xl dark:text-text-hi">Profile</h1>
      <p className="mt-1 text-sm text-text-lo dark:text-text-mid">Manage your account details and view platform stats.</p>

      <div className="mt-6 rounded-2xl border border-surface-600/80 bg-text-hi p-6 shadow-xs sm:p-8 dark:border-surface-700 dark:bg-surface-800/90">
        {/* Avatar + identity */}
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-500 to-accent-600 text-2xl font-bold text-text-hi shadow-md shadow-accent-500/20">
            {user?.name?.charAt(0).toUpperCase() || "?"}
          </span>
          <div>
            <h2 className="text-xl font-bold text-surface-800 dark:text-text-hi">{user?.name || "Builder"}</h2>
            <p className="text-sm text-text-lo dark:text-text-mid">{user?.email || ""}</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-surface-600/60 bg-surface-800/80 p-4 text-center dark:border-surface-700 dark:bg-surface-900/50">
            <p className="text-2xl font-bold text-accent-500 dark:text-accent-300">{ideas.length}</p>
            <p className="text-xs font-semibold text-text-lo dark:text-text-mid">Total Ideas Saved</p>
          </div>
          <div className="rounded-xl border border-surface-600/60 bg-surface-800/80 p-4 text-center dark:border-surface-700 dark:bg-surface-900/50">
            <p className="text-2xl font-bold text-accent-500 dark:text-accent-300">
              {new Set(ideas.map((idea) => idea.category).filter(Boolean)).size}
            </p>
            <p className="text-xs font-semibold text-text-lo dark:text-text-mid">Categories Analyzed</p>
          </div>
        </div>

        {/* Form actions */}
        <div className="mt-6 space-y-3">
          <ErrorState message={error} />
          <SuccessMessage message={success} />

          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-surface-600 dark:text-surface-600">
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
      <div className="mt-6 rounded-2xl border border-accent-300/60 bg-surface-700/40 p-6 dark:border-accent-600/40 dark:bg-accent-600/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-accent-600 dark:text-accent-300">Ideanalyze AI Platform</h3>
            <p className="mt-1 text-xs text-accent-500 dark:text-accent-300">
              Designed & Developed by <span className="font-semibold">Sajal Chaulagain aka Mr. Chaule</span>
            </p>
          </div>
          <a
            href="https://sajalchaulagain.com.np/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-accent-500 px-3.5 py-2 text-xs font-semibold text-text-hi shadow-xs transition-all hover:bg-accent-500 dark:bg-accent-500 dark:hover:bg-accent-500"
          >
            Portfolio 
          </a>
        </div>
      </div>
    </div>
  );
}
