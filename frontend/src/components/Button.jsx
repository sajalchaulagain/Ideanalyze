const variantStyles = {
  primary: "bg-gradient-to-r from-accent-500 to-accent-600 text-text-hi hover:from-accent-500 hover:to-accent-500 focus-visible:ring-accent-500 shadow-xs",
  secondary: "bg-surface-800 text-text-hi hover:bg-surface-700 dark:bg-surface-700 dark:hover:bg-surface-600 focus-visible:ring-text-lo",
  outline: "border border-surface-600 bg-text-hi text-surface-600 hover:bg-surface-800 dark:border-surface-600 dark:bg-surface-800 dark:text-surface-600 dark:hover:bg-surface-700 focus-visible:ring-accent-500",
  danger: "bg-danger-500 text-text-hi hover:bg-danger-500 dark:bg-danger-500 dark:hover:bg-danger-500 focus-visible:ring-danger-500",
  ghost: "text-text-mid hover:bg-surface-700 hover:text-surface-800 dark:text-surface-600 dark:hover:bg-surface-700 dark:hover:text-text-hi",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg",
  md: "px-4 py-2 text-sm font-semibold rounded-xl",
  lg: "px-6 py-3 text-base font-semibold rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
