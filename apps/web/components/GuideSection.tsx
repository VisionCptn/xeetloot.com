interface GuideStep {
  title: string;
  desc: string;
}

export function GuideSection({ title, intro, steps }: { title: string; intro: string; steps: GuideStep[] }) {
  return (
    <main className="px-4 py-10 sm:px-10 sm:py-16">
      <article className="mx-auto flex max-w-[720px] flex-col gap-6 text-start">
        <header className="flex flex-col gap-1.5">
          <h1 className="m-0 font-[var(--font-display)] text-[32px] leading-tight font-extrabold tracking-[-0.025em] sm:text-[44px]">{title}</h1>
          <p className="m-0 text-base text-[var(--tx2)]">{intro}</p>
        </header>
        <ol className="m-0 flex list-none flex-col gap-4 p-0">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4 rounded-2xl border border-[var(--bd)] bg-[var(--sf)] p-4">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--ac)] font-[var(--font-display)] font-extrabold text-[var(--on-ac)]">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-[17px]">{step.title}</h2>
                <p className="m-0 text-[15px] text-[var(--tx2)]">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </article>
    </main>
  );
}
