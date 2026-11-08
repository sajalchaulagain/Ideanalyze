export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-fg">
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className={label ? "mt-1.5" : ""}>{children}</div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger-ink" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs leading-5 text-fg-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
