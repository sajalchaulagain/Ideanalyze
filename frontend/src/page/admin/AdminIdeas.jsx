import { useEffect, useRef, useState } from "react";
import { Eye, Lightbulb, RefreshCw, Search, Trash2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
  deleteAdminIdea,
  fetchAdminIdeas,
} from "../../service/api";
import AIAnalysis from "../../components/AIAnalysis";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import AdminPagination from "../../components/admin/AdminPagination";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import { inputClass } from "../../components/ui/formStyles";
import { formatDate, hasAnalysis } from "../../lib/format";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

const PAGE_SIZE = 20;

export default function AdminIdeas() {
  useDocumentMeta(
    "Ideas · Admin · Ideanalyze AI",
    "Review every saved idea, inspect its analysis and remove content."
  );

  const { showToast } = useToast();

  const [searchInput, setSearchInput] = useState("");
  const [params, setParams] = useState({ page: 1, search: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [detailIdea, setDetailIdea] = useState(null);
  const [confirmIdea, setConfirmIdea] = useState(null);
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

    fetchAdminIdeas({
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

  const openDelete = (idea) => {
    setDeleteError("");
    setConfirmIdea(idea);
  };

  const closeDelete = () => {
    if (deleting) return;
    setConfirmIdea(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!confirmIdea || deleting) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAdminIdea(confirmIdea._id);
      showToast(`Deleted “${confirmIdea.title}”.`);
      setConfirmIdea(null);
      load();
    } catch (mutationError) {
      setDeleteError(mutationError.message);
    } finally {
      setDeleting(false);
    }
  };

  const ideas = data?.ideas || [];
  const searching = Boolean(params.search);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg">Ideas</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Every saved idea, its owner, and whether an analysis exists.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <label htmlFor="admin-idea-search" className="sr-only">
              Search ideas
            </label>
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
              aria-hidden="true"
            />
            <input
              id="admin-idea-search"
              type="search"
              value={searchInput}
              onChange={updateSearch}
              placeholder="Search by title"
              className={`${inputClass} pl-10`}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={load}
            aria-label="Reload ideas"
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
          </Button>
        </div>
      </div>

      {error && data && (
        <div className="mt-4">
          <ErrorState
            message={error}
            onRetry={load}
            retryDisabled={loading}
            retryLabel="Reload ideas"
          />
        </div>
      )}

      <Card className="mt-4 p-4">
        {loading && !data ? (
          <div className="space-y-3" role="status" aria-label="Loading ideas">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-12 rounded-xl" aria-hidden="true" />
            ))}
          </div>
        ) : error && !data ? (
          <ErrorState
            message={error}
            onRetry={load}
            retryDisabled={loading}
            retryLabel="Try loading ideas again"
          />
        ) : ideas.length === 0 ? (
          <EmptyState
            icon={Lightbulb}
            title={searching ? "No matching ideas" : "No ideas yet"}
            message={
              searching
                ? `Nothing matches “${params.search}”. Try a different title keyword.`
                : "Saved ideas from every account will appear here."
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
              <table className="w-full min-w-[880px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Title", "Owner", "Category", "Created", "Analysis", "Actions"].map(
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
                  {ideas.map((idea) => (
                    <tr key={idea._id}>
                      <td className="max-w-[260px] px-3 py-3">
                        <p className="truncate font-medium text-fg">{idea.title}</p>
                        <p className="mt-0.5 truncate text-xs text-fg-subtle">
                          {idea.description}
                        </p>
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-3 text-fg-muted">
                        {idea.userEmail || "Deleted user"}
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone="neutral">{idea.category || "Other"}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-fg-muted">
                        {formatDate(idea.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        {hasAnalysis(idea.aiAnalysis) ? (
                          <Badge tone="success">Analyzed</Badge>
                        ) : (
                          <Badge tone="neutral">Not analyzed</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDetailIdea(idea)}
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            View
                          </Button>
                          <Button
                            variant="danger-outline"
                            size="sm"
                            onClick={() => openDelete(idea)}
                            disabled={deleting}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="space-y-3 md:hidden">
              {ideas.map((idea) => (
                <li
                  key={idea._id}
                  className="rounded-xl border border-border bg-surface-muted p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-fg">
                      {idea.title}
                    </p>
                    {hasAnalysis(idea.aiAnalysis) ? (
                      <Badge tone="success">Analyzed</Badge>
                    ) : (
                      <Badge tone="neutral">Not analyzed</Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-fg-muted">
                    {idea.description}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <dt className="text-fg-subtle">Owner</dt>
                      <dd className="break-all font-medium text-fg">
                        {idea.userEmail || "Deleted user"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-fg-subtle">Category</dt>
                      <dd className="font-medium text-fg">{idea.category || "Other"}</dd>
                    </div>
                    <div>
                      <dt className="text-fg-subtle">Created</dt>
                      <dd className="font-medium text-fg">{formatDate(idea.createdAt)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailIdea(idea)}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      View
                    </Button>
                    <Button
                      variant="danger-outline"
                      size="sm"
                      onClick={() => openDelete(idea)}
                      disabled={deleting}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <AdminPagination
                page={data.page}
                pages={data.pages}
                total={data.total}
                noun="ideas"
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
        open={Boolean(detailIdea)}
        onClose={() => setDetailIdea(null)}
        title={detailIdea?.title || "Idea details"}
        description={
          detailIdea
            ? `${detailIdea.userEmail || "Deleted user"} · ${
                detailIdea.category || "Other"
              } · ${formatDate(detailIdea.createdAt)}`
            : undefined
        }
      >
        {detailIdea && (
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
                Description
              </p>
              <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-6 text-fg-muted">
                {detailIdea.description}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
                Target audience
              </p>
              <p className="mt-1.5 break-words text-sm leading-6 text-fg-muted">
                {detailIdea.targetAudience || "Not specified"}
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <AIAnalysis analysis={detailIdea.aiAnalysis} compact />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(confirmIdea)}
        onClose={closeDelete}
        title="Delete idea"
        description={
          confirmIdea
            ? `“${confirmIdea.title}” will be permanently removed from ${confirmIdea.userEmail || "a deleted account"}.`
            : undefined
        }
        footer={
          <>
            <Button variant="outline" onClick={closeDelete} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete idea
            </Button>
          </>
        }
      >
        {deleteError && <ErrorState message={deleteError} />}
        <p className="text-sm leading-6 text-fg-muted">
          This cannot be undone. The idea and its saved analysis are removed for
          everyone.
        </p>
      </Modal>
    </div>
  );
}
