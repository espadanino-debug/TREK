import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <p className="text-5xl">🖍️</p>
      <h1 className="mt-4 text-3xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted">This page wandered off the coloring book.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-2xl bg-primary px-5 py-3 font-bold text-white hover:bg-primary-hover"
      >
        Make a coloring page
      </Link>
    </section>
  );
}
