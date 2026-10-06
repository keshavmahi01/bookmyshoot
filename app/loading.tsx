export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="skeleton h-8 w-64 rounded-lg" />
      <div className="mt-4 skeleton h-4 w-96 max-w-full rounded" />
      <div className="mt-8 grid gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
