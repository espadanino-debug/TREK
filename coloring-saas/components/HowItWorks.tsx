export function HowItWorks({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="mb-6 text-center text-2xl font-extrabold">How it works</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-border bg-card p-5">
            <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
              {i + 1}
            </span>
            <h3 className="mb-1 font-extrabold">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
