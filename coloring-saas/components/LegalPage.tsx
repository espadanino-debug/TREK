export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      {updated && <p className="mt-1 text-sm text-muted">Last updated: {updated}</p>}
      <div className="prose-simple mt-6">{children}</div>
    </article>
  );
}
