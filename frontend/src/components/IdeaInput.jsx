import { ideaCategories } from "../data/ideaCategories";

const inputStyles =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900/50";

export default function IdeaInput({ form, onChange, onSubmit, loading }) {
  const handleField = (event) => {
    const { name, value } = event.target;
    onChange((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Idea title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleField}
          placeholder="e.g. Smart Waste Management for Kathmandu"
          className={inputStyles}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleField}
          rows={4}
          placeholder="Describe the problem you want to solve and who it helps..."
          className={`${inputStyles} resize-y`}
          required
        />
      </div>

      {/* Category + Target Audience */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleField}
            className={inputStyles}
          >
            <option value="">Select a category</option>
            {ideaCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="targetAudience" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Target audience
          </label>
          <input
            id="targetAudience"
            name="targetAudience"
            type="text"
            value={form.targetAudience}
            onChange={handleField}
            placeholder="e.g. Students, Municipalities..."
            className={inputStyles}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-base font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Analyzing with Ideanalyze AI...
          </>
        ) : (
          "✨ Analyze with AI"
        )}
      </button>
    </form>
  );
}
