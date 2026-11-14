import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { fetchAdminAudit, fetchAdminStats } from "../../service/api";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ErrorState from "../../components/ErrorState";
import { formatRelativeTime } from "../../lib/format";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const ACTION_LABELS = {
  "user.role_changed": "Role changed",
  "user.deleted": "User deleted",
  "idea.deleted": "Idea deleted",
};

const ACTION_TONES = {
  "user.role_changed": "accent",
  "user.deleted": "danger",
  "idea.deleted": "warning",
};

function describeTarget(entry) {
  if (entry.detail?.email) return entry.detail.email;
  if (entry.detail?.title) return entry.detail.title;
  return entry.targetId || entry.targetType || "Unknown target";
}

function describeDetail(entry) {
  if (entry.action === "user.role_changed") {
    return `${entry.detail?.from || "user"} → ${entry.detail?.to || "user"}`;
  }
  if (entry.action === "user.deleted") {
    const count = entry.detail?.deletedIdeas;
    return `${count || 0} idea${count === 1 ? "" : "s"} removed`;
  }
  if (entry.action === "idea.deleted") {
    return entry.detail?.ownerEmail
      ? `Owner: ${entry.detail.ownerEmail}`
      : "Owner deleted";
  }
  return "";
}

const CARDS = [
  {
    key: "users",
    label: "Users",
    icon: UsersRound,
    hint: (stats) =>
      `${stats.admins} admin${stats.admins === 1 ? "" : "s"} · ${stats.users} total`,
    accent: "bg-surface-muted text-fg-muted",
  },
  {
    key: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    hint: (stats) => `${stats.ideasWithAnalysis} analyzed`,
    accent: "bg-accent-soft text-accent",
  },
  {
    key: "ideasWithAnalysis",
    label: "Analyses",
    icon: Sparkles,
    hint: (stats) =>
      stats.ideas === 0
        ? "No ideas saved yet"
        : `${Math.round((stats.ideasWithAnalysis / stats.ideas) * 100)}% of ideas`,
    accent: "bg-accent-soft text-accent",
  },
  {
    key: "signups7d",
    label: "Signups · 7 days",
    icon: UserPlus,
    hint: () => "New accounts this week",
    accent: "bg-surface-muted text-fg-muted",
  },
  {
    key: "admins",
    label: "Admins",
    icon: ShieldCheck,
    hint: () => "Full access accounts",
    accent: "bg-success-soft text-success-ink",
  },
];

function StatCard({ card, stats, loading, error, onRetry }) {
  const Icon = card.icon;
  const value = stats ? stats[card.key] : null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
          {card.label}
        </p>
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.accent}`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2" aria-hidden="true">
          <div className="skeleton h-8 w-16 rounded-lg" />
          <div className="skeleton h-3 w-24 rounded-full" />
        </div>
      ) : error ? (
        <div className="mt-3">
          <p className="text-2xl font-semibold text-fg-subtle">—</p>
          <p className="mt-1 text-xs font-medium text-danger-ink">
            Couldn’t load this total.
          </p>
          <p
            className="mt-1 line-clamp-2 text-[11px] leading-4 text-fg-subtle"
            title={error}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 cursor-pointer text-xs font-semibold text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      ) : !stats ? (
        <p className="mt-3 text-2xl font-semibold text-fg-subtle">—</p>
      ) : (
        <>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            {value ?? 0}
          </p>
          <p className="mt-1 text-xs text-fg-subtle">{card.hint(stats)}</p>
        </>
      )}
    </Card>
  );
}

export default function AdminOverview() {
  useDocumentMeta(
    "Admin overview · Ideanalyze AI",
    "Users, ideas, analyses, signups and recent admin activity."
  );

  const [stats, setStats] = useState({ loading: true, error: "", data: null });
  const [audit, setAudit] = useState({
    loading: true,
    error: "",
    entries: [],
  });
  const [reloadKey, setReloadKey] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect --
     These updates are the result of reading remote data, and the loading flags
     must be reset whenever the user asks for a retry. */
  useEffect(() => {
    let active = true;
    setStats((current) => ({ ...current, loading: true, error: "" }));
    setAudit((current) => ({ ...current, loading: true, error: "" }));

    fetchAdminStats()
      .then((data) => {
        if (active) setStats({ loading: false, error: "", data });
      })
      .catch((error) => {
        if (active) {
          setStats({ loading: false, error: error.message, data: null });
        }
      });

    fetchAdminAudit({ page: 1, limit: 5 })
      .then((data) => {
        if (active) {
          setAudit({ loading: false, error: "", entries: data.entries || [] });
        }
      })
      .catch((error) => {
        if (active) {
          setAudit({ loading: false, error: error.message, entries: [] });
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const retry = () => setReloadKey((current) => current + 1);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-fg">Overview</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Live totals across the whole workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="cursor-pointer text-xs font-semibold text-accent hover:underline"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {CARDS.map((card) => (
          <StatCard
            key={card.key}
            card={card}
            stats={stats.data}
            loading={stats.loading}
            error={stats.error}
            onRetry={retry}
          />
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-fg">Recent admin activity</h2>
              <p className="text-xs text-fg-subtle">
                The five newest entries from the audit trail.
              </p>
            </div>
          </div>
          <Link
            to="/admin/audit"
            className="text-xs font-semibold text-accent hover:underline"
          >
            View full log
          </Link>
        </div>

        <div className="mt-4">
          {audit.loading ? (
            <div className="space-y-3" role="status" aria-label="Loading recent admin activity">
              {[0, 1, 2].map((item) => (
                <div key={item} className="skeleton h-12 rounded-xl" aria-hidden="true" />
              ))}
            </div>
          ) : audit.error ? (
            <ErrorState message={audit.error} onRetry={retry} retryLabel="Reload activity" />
          ) : audit.entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-strong px-5 py-8 text-center">
              <p className="text-sm font-medium text-fg">No admin activity yet.</p>
              <p className="mt-1 text-sm text-fg-muted">
                Role changes, deleted users and deleted ideas will show up here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {audit.entries.map((entry) => (
                <li
                  key={entry._id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={ACTION_TONES[entry.action] || "neutral"}>
                        {ACTION_LABELS[entry.action] || entry.action}
                      </Badge>
                      <p className="truncate text-sm font-medium text-fg">
                        {describeTarget(entry)}
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-fg-subtle">
                      by {entry.actorEmail || entry.actorId} · {describeDetail(entry)}
                    </p>
                  </div>
                  <time
                    dateTime={entry.createdAt}
                    className="shrink-0 text-xs text-fg-subtle"
                  >
                    {formatRelativeTime(entry.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
