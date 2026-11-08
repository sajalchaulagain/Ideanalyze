export default function LoadingState({ message = "Loading..." }) {
  return <div className="space-y-3" role="status" aria-label={message}>{[0, 1, 2].map((item) => <div key={item} className="animate-shimmer h-36 rounded-xl border border-surface-600" />)}</div>;
}
