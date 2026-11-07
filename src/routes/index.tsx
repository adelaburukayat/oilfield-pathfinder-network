import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Logo, HelpLink } from "@/components/brand";
import { PATHS, PATH_ORDER, type PathType } from "@/lib/onboarding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Choose your path — OilSwift" },
      { name: "description", content: "Create your OilSwift profile as a professional, intern/student or organization in the oil and gas industry." },
      { property: "og:title", content: "Choose your path — OilSwift" },
      { property: "og:description", content: "Start your verified oil and gas profile in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChoosePath,
});

function ChoosePath() {
  const [selected, setSelected] = useState<PathType | null>(null);
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Logo />
        <HelpLink />
      </header>

      <main className="relative mx-auto max-w-7xl px-6 pb-20 pt-6 md:pt-12">
        <div className="mx-auto max-w-2xl text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-secondary-foreground shadow-card">
            <ShieldCheck className="size-3.5 text-primary" /> Email verified
            <span className="h-3 w-px bg-border" />
            <span className="text-muted-foreground">Step 1 of 4</span>
          </span>
          <h1 className="mt-6 text-4xl font-semibold text-foreground md:text-5xl">Choose your path</h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Select the option that best describes you. Your profile is tailored to each path.
          </p>
        </div>

        <div role="radiogroup" className="mt-12 grid gap-5 md:grid-cols-3">
          {PATH_ORDER.map((key, i) => {
            const p = PATHS[key];
            const active = selected === key;
            const Icon = p.icon;
            return (
              <button
                key={key}
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(key)}
                onDoubleClick={() => navigate({ to: "/onboarding/$type", params: { type: key } })}
                style={{ animationDelay: `${i * 80}ms` }}
                className={`group relative flex h-[460px] flex-col overflow-hidden rounded-3xl text-left outline-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both focus-visible:ring-4 focus-visible:ring-ring/30 ${
                  active ? "ring-2 ring-gold ring-offset-4 ring-offset-background shadow-lift" : "shadow-card hover:-translate-y-1 hover:shadow-lift"
                }`}
              >
                <img src={p.image} alt="" width={1024} height={1280} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-ink-fade" />

                <div className="relative flex items-start justify-between p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-card/15 text-ink-foreground backdrop-blur-md ring-1 ring-ink-foreground/20">
                    <Icon className="size-5" />
                  </span>
                  <span className={`grid size-7 place-items-center rounded-full border transition-all ${active ? "border-gold bg-gold text-ink" : "border-ink-foreground/40 bg-ink/20 backdrop-blur"}`}>
                    {active && <Check className="size-4" strokeWidth={3} />}
                  </span>
                </div>

                <div className="relative mt-auto p-6 text-ink-foreground">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-gold">{p.tagline}</p>
                  <h2 className="mt-2 text-2xl font-semibold">{p.label}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-foreground/75">{p.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.perks.map((perk) => (
                      <li key={perk} className="rounded-full bg-ink-foreground/10 px-2.5 py-1 text-xs text-ink-foreground/90 ring-1 ring-ink-foreground/15 backdrop-blur">
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            disabled={!selected}
            onClick={() => selected && navigate({ to: "/onboarding/$type", params: { type: selected } })}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lift transition-all hover:bg-primary-deep disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            Continue{selected ? ` as ${PATHS[selected].label}` : ""} <ArrowRight className="size-4" />
          </button>
          <p className="text-xs text-muted-foreground">You can add another path to your profile later.</p>
        </div>
      </main>
    </div>
  );
}
