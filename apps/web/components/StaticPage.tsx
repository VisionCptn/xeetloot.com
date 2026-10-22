interface Section {
  h: string;
  p: string;
}

export function StaticPage({ title, updated, body }: { title: string; updated: string; body: Section[] }) {
  return (
    <main className="px-4 py-10 sm:px-10 sm:py-16">
      <article className="mx-auto flex max-w-[720px] flex-col gap-6 text-start">
        <header className="flex flex-col gap-1.5">
          <h1 className="m-0 font-[var(--font-display)] text-[32px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[44px]">{title}</h1>
          <p className="m-0 text-sm text-[var(--tx2)]">{updated}</p>
        </header>
        {body.map((section) => (
          <section key={section.h} className="flex flex-col gap-2">
            <h2 className="m-0 text-xl">{section.h}</h2>
            <p className="m-0 text-base leading-relaxed text-[var(--tx2)]">{section.p}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
