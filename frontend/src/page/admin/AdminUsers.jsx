import { useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUserRole,
} from "../../service/api";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import AdminPagination from "../../components/admin/AdminPagination";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { inputClass } from "../../components/ui/formStyles";
import { formatDate, formatRelativeTime } from "../../lib/format";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const PAGE_SIZE = 20;

function RoleBadge({ role }) {
  return role === "admin" ? (
    <Badge tone="accent">
      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
      Admin
    </Badge>
  ) : (
    <Badge tone="neutral">
      <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
      User
    </Badge>
  );
}

export default function AdminUsers() {
  useDocumentMeta(
    "Users · Admin · Ideanalyze AI",
    "Search accounts, change roles and remove users."
  );

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState({ page: 1, search: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [pendingId, setPendingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirmUser, setConfirmUser] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef(null);

  const load = () => setReloadKey((current) => current + 1);

  const updateSearch = (event) => {
    const value = event.target.value;
    setSearchInput(value);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setParams({ page: 1, search: value.trim() });
    }, 300);
  };

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    },
    []
  );

  /* eslint-disable react-hooks/set-state-in-effect --
     Table loads are reads from the API; the loading flag belongs to the effect. */
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchAdminUsers({
      page: params.page,
      limit: PAGE_SIZE,
      search: params.search,
    })
      .then((payload) => {
        if (!active) return;
        if (payload.pages < params.page) {
          setParams({ page: payload.pages, search: params.search });
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
  }, [params, reloadKey]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleRole = async (target) => {
    if (pendingId) return;
    setPendingId(target._id);
    setActionError("");

    const nextRole = target.role === "admin" ? "user" : "admin";
    try {
      const updated = await updateAdminUserRole(target._id, nextRole);
      setData((current) =>
        current
          ? {
              ...current,
              users: current.users.map((row) =>
                row._id === target._id
                  ? { ...row, ...updated, ideaCount: row.ideaCount }
                  : row
              ),
            }
          : current
      );
      showToast(
        `${target.email} is now ${nextRole === "admin" ? "an admin" : "a regular user"}.`
      );
    } catch (mutationError) {
      setActionError(mutationError.message);
    } finally {
      setPendingId("");
    }
  };

  const openDelete = (target) => {
    setDeleteError("");
    setConfirmUser(target);
  };

  const closeDelete = () => {
    if (deleting) return;
    setConfirmUser(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!confirmUser || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const result = await deleteAdminUser(confirmUser._id);
      const removedIdeas = result?.deletedIdeas || 0;
      showToast(
        `Deleted ${confirmUser.email}${
          removedIdeas
            ? ` and ${removedIdeas} idea${removedIdeas === 1 ? "" : "s"}`
            : ""
        }.`
      );
      setConfirmUser(null);
      load();
    } catch (mutationError) {
      setDeleteError(mutationError.message);
    } finally {
      setDeleting(false);
    }
  };

  const users = data?.users || [];
  const isSelf = (target) => target._id === currentUser?.id;
  const searching = Boolean(params.search);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg">Users</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Promote or demote accounts, and remove users with their ideas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <label htmlFor="admin-user-search" className="sr-only">
              Search users
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
              aria-hidden="true"
            />
            <input
              id="admin-user-search"
              type="search"
              value={searchInput}
              onChange={updateSearch}
              placeholder="Search email or name"
              className={`${inputClass} pl-10`}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={load}
            aria-label="Reload users"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="mt-4">
          <ErrorState message={actionError} />
        </div>
      )}
      {error && data && (
        <div className="mt-4">
          <ErrorState
            message={error}
            onRetry={load}
            retryDisabled={loading}
            retryLabel="Reload users"
          />
        </div>
      )}

      <Card className="mt-4 p-4">
        {loading && !data ? (
          <div className="space-y-3" role="status" aria-label="Loading users">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-12 rounded-xl" aria-hidden="true" />
            ))}
          </div>
        ) : error && !data ? (
          <ErrorState
            message={error}
            onRetry={load}
            retryDisabled={loading}
            retryLabel="Try loading users again"
          />
        ) : users.length === 0 ? (
          <EmptyState
            title={searching ? "No matching users" : "No users yet"}
            message={
              searching
                ? `Nobody matches “${params.search}”. Try a shorter search or a different spelling.`
                : "New accounts will appear here as soon as people sign up."
            }
            actionLabel={searching ? "Clear search" : undefined}
            onAction={
              searching
                ? () => {
                    setSearchInput("");
                    setParams({ page: 1, search: "" });
                  }
                : undefined
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Email", "Name", "Role", "Ideas", "Joined", "Last login", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((target) => {
                    const self = isSelf(target);
                    const pending = pendingId === target._id;
                    return (
                      <tr key={target._id} className={pending ? "opacity-60" : ""}>
                        <td className="max-w-[220px] truncate px-3 py-3 font-medium text-fg">
                          {target.email}
                          {self && (
                            <span className="ml-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-fg-subtle">
                              you
                            </span>
                          )}
                        </td>
                        <td className="max-w-[160px] truncate px-3 py-3 text-fg-muted">
                          {target.name || "—"}
                        </td>
                        <td className="px-3 py-3">
                          <RoleBadge role={target.role} />
                        </td>
                        <td className="px-3 py-3 text-fg-muted">{target.ideaCount ?? 0}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-fg-muted">
                          {formatDate(target.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-fg-muted">
                          {target.lastLoginAt
                            ? formatRelativeTime(target.lastLoginAt)
                            : "Never"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleRole(target)}
                              loading={pending}
                              disabled={self || Boolean(pendingId && !pending)}
                              title={
                                self
                                  ? "You cannot change your own role."
                                  : undefined
                              }
                            >
                              {target.role === "admin" ? "Remove admin" : "Make admin"}
                            </Button>
                            <Button
                              variant="danger-outline"
                              size="sm"
                              onClick={() => openDelete(target)}
                              disabled={self || Boolean(pendingId) || deleting}
                              title={
                                self
                                  ? "You cannot delete your own account."
                                  : undefined
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {users.map((target) => {
                const self = isSelf(target);
                const pending = pendingId === target._id;
                return (
                  <li
                    key={target._id}
                    className="rounded-xl border border-border bg-surface-muted p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-fg">
                          {target.email}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-fg-muted">
                          {target.name || "No name"}
                          {self ? " · you" : ""}
                        </p>
                      </div>
                      <RoleBadge role={target.role} />
                    </div>
                    <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <dt className="text-fg-subtle">Ideas</dt>
                        <dd className="font-medium text-fg">{target.ideaCount ?? 0}</dd>
                      </div>
                      <div>
                        <dt className="text-fg-subtle">Joined</dt>
                        <dd className="font-medium text-fg">{formatDate(target.createdAt)}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-fg-subtle">Last login</dt>
                        <dd className="font-medium text-fg">
                          {target.lastLoginAt
                            ? formatRelativeTime(target.lastLoginAt)
                            : "Never"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleRole(target)}
                        loading={pending}
                        disabled={self || Boolean(pendingId && !pending)}
                      >
                        {target.role === "admin" ? "Remove admin" : "Make admin"}
                      </Button>
                      <Button
                        variant="danger-outline"
                        size="sm"
                        onClick={() => openDelete(target)}
                        disabled={self || Boolean(pendingId) || deleting}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4">
              <AdminPagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                noun="users"
                disabled={loading}
                onPageChange={(page) =>
                  setParams({ page, search: params.search })
                }
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={Boolean(confirmUser)}
        onClose={closeDelete}
        title="Delete user"
        description={
          confirmUser
            ? `${confirmUser.email} and their ${confirmUser.ideaCount ?? 0} saved idea${
                (confirmUser.ideaCount ?? 0) === 1 ? "" : "s"
              } will be permanently removed.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeDelete} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {confirmUser && (confirmUser.ideaCount ?? 0) > 0
                ? `Delete user and ${confirmUser.ideaCount} idea${
                    confirmUser.ideaCount === 1 ? "" : "s"
                  }`
                : "Delete user"}
            </Button>
          </>
        }
      >
        {deleteError && <ErrorState message={deleteError} />}
        <p className="text-sm leading-6 text-fg-muted">
          This cannot be undone. The account is removed from the database, and
          every idea is deleted first so nothing is left orphaned.
        </p>
      </Modal>
    </div>
  );
}
