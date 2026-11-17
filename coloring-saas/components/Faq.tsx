import { JsonLd } from "./JsonLd";

export type FaqItem = { q: string; a: string };

// FAQ list plus matching FAQPage JSON-LD.
export function Faq({ items, title = "Questions parents ask" }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h2 className="mb-4 text-2xl font-extrabold">{title}</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((item) => (
          <details key={item.q} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {item.q}
              <span className="text-primary transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="mt-2 leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </section>
  );
}
