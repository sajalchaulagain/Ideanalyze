import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { fetchAdminAudit } from "../../service/api";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import AdminPagination from "../../components/admin/AdminPagination";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import { formatDate, formatRelativeTime } from "../../lib/format";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const PAGE_SIZE = 50;

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
    return `Role ${entry.detail?.from || "user"} → ${entry.detail?.to || "user"}.`;
  }
  if (entry.action === "user.deleted") {
    const count = entry.detail?.deletedIdeas || 0;
    return `${count} idea${count === 1 ? "" : "s"} deleted with the account.`;
  }
  if (entry.action === "idea.deleted") {
    return entry.detail?.ownerEmail
      ? `Owner ${entry.detail.ownerEmail}.`
      : "Owned by an account that no longer exists.";
  }
  return "";
}

export default function AdminAudit() {
  useDocumentMeta(
    "Audit log · Admin · Ideanalyze AI",
    "A reverse-chronological record of every admin mutation."
  );

  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect --
     The audit log is read from the API; the loading flag belongs to the effect. */
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchAdminAudit({ page, limit: PAGE_SIZE })
      .then((payload) => {
        if (!active) return;
        if (payload.pages < page) {
          setPage(payload.pages);
          return;
        }
        setData(payload);
        setError("");
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, reloadKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const entries = data?.entries || [];

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg">Audit log</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Newest first. This view is read-only — entries are written by the
            API, never edited here.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={loading}
          className="w-fit cursor-pointer text-xs font-semibold text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      {error && data && (
        <div className="mt-4">
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((current) => current + 1)}
            retryDisabled={loading}
            retryLabel="Reload audit log"
          />
        </div>
      )}

      <Card className="mt-4 p-4">
        {loading && !data ? (
          <div className="space-y-3" role="status" aria-label="Loading audit log">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="skeleton h-14 rounded-xl" aria-hidden="true" />
            ))}
          </div>
        ) : error && !data ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((current) => current + 1)}
            retryDisabled={loading}
            retryLabel="Try loading the audit log again"
          />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No admin activity yet"
            message="Role changes, deleted users and deleted ideas are recorded here automatically."
          />
        ) : (
          <>
            <ol className="divide-y divide-border">
              {entries.map((entry) => (
                <li key={entry._id} className="py-3.5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={ACTION_TONES[entry.action] || "neutral"}>
                          {ACTION_LABELS[entry.action] || entry.action}
                        </Badge>
                        <p className="min-w-0 break-all text-sm font-medium text-fg">
                          {describeTarget(entry)}
                        </p>
                      </div>
                      <p className="mt-1.5 text-xs text-fg-muted">
                        <span className="font-medium text-fg">
                          {entry.actorEmail || entry.actorId}
                        </span>{" "}
                        · {describeDetail(entry)}
                      </p>
                    </div>
                    <time
                      dateTime={entry.createdAt}
                      title={formatDate(entry.createdAt)}
                      className="shrink-0 text-xs text-fg-subtle"
                    >
                      {formatRelativeTime(entry.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-4">
              <AdminPagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                noun="entries"
                disabled={loading}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
