export default function Card({
  as: Tag = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={`rounded-2xl border border-border bg-surface shadow-card ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
