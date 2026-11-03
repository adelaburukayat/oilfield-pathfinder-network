import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CloudUpload, BadgeCheck, Pencil } from "lucide-react";
import { Logo, HelpLink } from "@/components/brand";
import { PATHS, isPathType, missingRequired, type Field, type Values } from "@/lib/onboarding";

export const Route = createFileRoute("/onboarding/$type")({
  loader: ({ params }) => {
    if (!isPathType(params.type)) throw notFound();
    return { type: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData ? PATHS[loaderData.type].label : "Onboarding";
    return {
      meta: [
        { title: `${label} onboarding — Energy Passport` },
        { name: "description", content: `Complete your ${label} Energy Passport in a few short steps.` },
        { property: "og:title", content: `${label} onboarding — Energy Passport` },
        { property: "og:description", content: `Complete your ${label} Energy Passport.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Onboarding,
});

function Onboarding() {
  const { type } = Route.useLoaderData();
  const path = PATHS[type];
  const steps = [...path.steps, { id: "review", title: "Review & submit", description: "Check your details before creating your passport.", fields: [] }];
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const step = steps[index] ?? steps[0]!;
  const isReview = step.id === "review";
  const progress = ((index + (done ? 1 : 0)) / steps.length) * 100;

  const set = (name: string, v: string | string[]) => {
    setValues((s) => ({ ...s, [name]: v }));
    setErrors((e) => e.filter((n) => n !== name));
  };

  const next = () => {
    if (isReview) return setDone(true);
    const missing = missingRequired(step, values);
    if (missing.length) return setErrors(missing);
    setErrors([]);
    setIndex((i) => i + 1);
  };

  const Icon = path.icon;

  return (
    <div className="grid min-h-screen lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr]">
      {/* Side panel */}
      <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col">
        <img src={path.image} alt="" width={1024} height={1280} className="absolute inset-0 size-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-ink-fade" />
        <div className="relative flex h-full flex-col p-10">
          <Logo inverted />
          <div className="mt-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-foreground/10 px-3 py-1 text-xs font-medium text-gold ring-1 ring-ink-foreground/15 backdrop-blur">
              <Icon className="size-3.5" /> {path.label} passport
            </span>
          </div>
          <div className="mt-auto">
            <h2 className="font-display text-3xl font-semibold leading-tight text-ink-foreground">{path.tagline}</h2>
            <p className="mt-3 text-sm text-ink-foreground/70">{path.description}</p>
            <ul className="mt-8 space-y-3">
              {path.perks.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-ink-foreground">
                  <span className="grid size-6 place-items-center rounded-full bg-gold text-ink"><Check className="size-3.5" strokeWidth={3} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-10 text-xs text-ink-foreground/50">Your data is encrypted and only shared with your consent.</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-5 md:px-12">
          <div className="flex items-center gap-4">
            <div className="lg:hidden"><Logo /></div>
            <Link to="/" className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex">
              <ArrowLeft className="size-4" /> Change path
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                {done ? "Complete" : <>Step <span className="text-foreground">{index + 1}</span> of {steps.length} · {step.title}</>}
              </span>
              <div className="flex gap-1">
                {steps.map((s, i) => (
                  <span key={s.id} className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${done || i < index ? "bg-gold" : i === index ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
            </div>
            <span className="hidden sm:block"><HelpLink /></span>
          </div>
        </header>

        <main className="flex flex-1 justify-center px-6 py-10 md:px-12 md:py-14">
          <div className="w-full max-w-2xl">
            {done ? (
              <Success name={String(values["firstName"] ?? values["companyName"] ?? "")} label={path.label} />
            ) : (
              <div key={step.id} className="animate-in fade-in slide-in-from-bottom-2 duration-400">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                  Step {index + 1} of {steps.length}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">{step.title}</h1>
                <p className="mt-2 text-muted-foreground">{step.description}</p>

                {isReview ? (
                  <Review steps={path.steps} values={values} onEdit={setIndex} />
                ) : (
                  <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-6">
                    {step.fields.map((f) => (
                      <FieldInput key={f.name} field={f} value={values[f.name]} error={errors.includes(f.name)} onChange={(v) => set(f.name, v)} />
                    ))}
                  </div>
                )}

                <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
                  {index === 0 ? (
                    <Link to="/" className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <ArrowLeft className="size-4" /> Back
                    </Link>
                  ) : (
                    <button onClick={() => setIndex((i) => i - 1)} className="inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                      <ArrowLeft className="size-4" /> Back
                    </button>
                  )}
                  <button onClick={next} className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lift transition-colors hover:bg-primary-deep">
                    {isReview ? "Create passport" : "Continue"} <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function FieldInput({ field, value, error, onChange }: { field: Field; value: Values[string] | undefined; error: boolean; onChange: (v: string | string[]) => void }) {
  const id = `f-${field.name}`;
  const errCls = error ? "border-destructive focus:border-destructive" : "";
  const str = typeof value === "string" ? value : "";

  let control;
  if (field.type === "select") {
    control = (
      <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={`field appearance-none bg-[length:16px] bg-[right_0.875rem_center] bg-no-repeat pr-10 ${errCls} ${str ? "" : "text-muted-foreground"}`}
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23667' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
        <option value="">Select…</option>
        {field.options?.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
  } else if (field.type === "textarea") {
    control = <textarea id={id} rows={3} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={`field h-auto py-3 ${errCls}`} />;
  } else if (field.type === "chips") {
    const arr = Array.isArray(value) ? value : [];
    control = (
      <div className="flex flex-wrap gap-2">
        {field.options?.map((o) => {
          const on = arr.includes(o);
          return (
            <button type="button" key={o} aria-pressed={on} onClick={() => onChange(on ? arr.filter((x) => x !== o) : [...arr, o])}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm transition-all ${on ? "border-primary bg-secondary text-secondary-foreground" : error ? "border-destructive/60 bg-card text-foreground" : "border-input bg-card text-foreground hover:border-primary/50"}`}>
              {on && <Check className="size-3.5" strokeWidth={3} />} {o}
            </button>
          );
        })}
      </div>
    );
  } else if (field.type === "file") {
    control = (
      <label htmlFor={id} className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-input bg-card p-5 transition-colors hover:border-primary hover:bg-secondary/40">
        <span className="grid size-11 place-items-center rounded-lg bg-secondary text-primary"><CloudUpload className="size-5" /></span>
        <span className="flex-1">
          <span className="block text-sm font-medium text-foreground">{str || "Click to upload"}</span>
          <span className="block text-xs text-muted-foreground">{field.hint}</span>
        </span>
        <input id={id} type="file" className="sr-only" onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")} />
      </label>
    );
  } else {
    control = <input id={id} type={field.type} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={`field ${errCls}`} />;
  }

  return (
    <div className={field.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {field.label} {field.required && <span className="text-gold">*</span>}
        </label>
        {field.hint && field.type !== "file" && <span className="text-xs text-muted-foreground">{field.hint}</span>}
      </div>
      {control}
      {error && <p className="mt-1.5 text-xs text-destructive">This field is required</p>}
    </div>
  );
}

function Review({ steps, values, onEdit }: { steps: typeof PATHS.professional.steps; values: Values; onEdit: (i: number) => void }) {
  return (
    <div className="mt-10 space-y-4">
      {steps.map((s, i) => (
        <section key={s.id} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">{s.title}</h3>
            <button onClick={() => onEdit(i)} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep">
              <Pencil className="size-3.5" /> Edit
            </button>
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {s.fields.map((f) => {
              const v = values[f.name];
              const text = Array.isArray(v) ? v.join(", ") : v;
              return (
                <div key={f.name}>
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="mt-0.5 text-sm text-foreground">{text || "—"}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

function Success({ name, label }: { name: string; label: string }) {
  const id = "EP-" + Math.abs([...name, ...label].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 1000000).toString().padStart(6, "0");
  return (
    <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
      <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary"><BadgeCheck className="size-7" /></span>
      <h1 className="mt-6 text-3xl font-semibold text-foreground md:text-4xl">Your passport is ready</h1>
      <p className="mt-2 max-w-md text-muted-foreground">We're reviewing your details. You'll get an email once verification is complete.</p>

      <div className="relative mt-10 w-full max-w-md overflow-hidden rounded-3xl bg-ink p-7 text-left text-ink-foreground shadow-lift">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 size-48 rounded-full bg-gold/25 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <Logo inverted />
          <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-medium text-gold ring-1 ring-gold/30">Pending review</span>
        </div>
        <div className="relative mt-12">
          <p className="text-xs uppercase tracking-[0.14em] text-ink-foreground/50">Holder</p>
          <p className="mt-1 font-display text-2xl font-semibold">{name || "—"}</p>
        </div>
        <div className="relative mt-6 flex justify-between text-sm">
          <div><p className="text-xs text-ink-foreground/50">Path</p><p className="mt-0.5">{label}</p></div>
          <div className="text-right"><p className="text-xs text-ink-foreground/50">Passport no.</p><p className="mt-0.5 font-mono tracking-wider text-gold">{id}</p></div>
        </div>
      </div>

      <Link to="/" className="mt-10 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep">
        Go to dashboard <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
