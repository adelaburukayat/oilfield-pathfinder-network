import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BadgeCheck, MapPin, Phone, Briefcase, GraduationCap, Building2, Award, FileText, Linkedin,
  Calendar, Clock, Globe, Users, ShieldCheck, Mail, Pencil, Target, Layers,
} from "lucide-react";
import { Logo, HelpLink } from "@/components/brand";
import { PATHS, isPathType, loadProfile, type PathType, type Values } from "@/lib/onboarding";

export const Route = createFileRoute("/profile/$type")({
  loader: ({ params }) => {
    if (!isPathType(params.type)) throw notFound();
    return { type: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData ? PATHS[loaderData.type].label : "Profile";
    return {
      meta: [
        { title: `${label} profile — Energy Passport` },
        { name: "description", content: `Your ${label} Energy Passport profile.` },
        { property: "og:title", content: `${label} profile — Energy Passport` },
        { property: "og:description", content: `Your ${label} Energy Passport profile.` },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProfilePage,
});

const s = (v: Values[string] | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");
const arr = (v: Values[string] | undefined) => (Array.isArray(v) ? v : []);

function ProfilePage() {
  const { type } = Route.useLoaderData();
  const [v, setV] = useState<Values | null>(null);
  useEffect(() => setV(loadProfile(type)), [type]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 md:px-12">
        <Logo />
        <div className="flex items-center gap-5">
          <Link to="/onboarding/$type" params={{ type }} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep">
            <Pencil className="size-3.5" /> Edit profile
          </Link>
          <span className="hidden sm:block"><HelpLink /></span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10 md:px-12">
        {v && <Body type={type} v={v} />}
      </main>
    </div>
  );
}

function Body({ type, v }: { type: PathType; v: Values }) {
  if (type === "professional") return <Professional v={v} />;
  if (type === "student") return <Student v={v} />;
  return <Organization v={v} />;
}

/* ---------- shared bits ---------- */

function Hero({ icon, eyebrow, title, subtitle, meta, badge }: { icon: ReactNode; eyebrow: string; title: string; subtitle: string; meta: ReactNode; badge: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground shadow-lift md:p-10">
      <div className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
      <div className="absolute -bottom-24 left-10 size-56 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-ink-foreground/15">{icon}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">{title || "—"}</h1>
            <p className="mt-1 text-ink-foreground/70">{subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-foreground/80">{meta}</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold ring-1 ring-gold/30 md:self-auto">
          <BadgeCheck className="size-3.5" /> {badge}
        </span>
      </div>
    </section>
  );
}

function Meta({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  if (!children) return null;
  return <span className="inline-flex items-center gap-1.5">{icon}{children}</span>;
}

function Card({ title, icon, children, className = "" }: { title: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-6 shadow-card ${className}`}>
      <h2 className="flex items-center gap-2 font-semibold text-foreground"><span className="text-primary">{icon}</span>{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Chips({ items, tone = "green" }: { items: string[]; tone?: "green" | "gold" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Nothing added yet</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className={`rounded-full px-3 py-1 text-sm ${tone === "gold" ? "bg-gold/15 text-foreground ring-1 ring-gold/40" : "bg-secondary text-secondary-foreground"}`}>{i}</span>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}

/* ---------- Professional ---------- */

function Professional({ v }: { v: Values }) {
  const certs = arr(v.certs);
  return (
    <div className="space-y-6">
      <Hero icon={<Briefcase className="size-7" />} eyebrow="Professional passport" title={s(v.jobTitle)} subtitle={s(v.employer) || "Independent"} badge="Verification pending"
        meta={<><Meta icon={<MapPin className="size-4" />}>{s(v.country)}</Meta><Meta icon={<Phone className="size-4" />}>{s(v.phone)}</Meta></>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Years of experience" value={s(v.years)} />
        <Stat label="Certifications" value={String(certs.length)} />
        <Stat label="Disciplines" value={String(arr(v.disciplines).length)} />
      </div>
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Disciplines" icon={<Layers className="size-4" />}><Chips items={arr(v.disciplines)} /></Card>
          <Card title="Certification vault" icon={<Award className="size-4" />}>
            {certs.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {certs.map((c) => (
                  <li key={c} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-gold/15 text-gold"><Award className="size-4" /></span>
                    <span><span className="block text-sm font-medium text-foreground">{c}</span><span className="block text-xs text-muted-foreground">Awaiting document</span></span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-muted-foreground">No certifications added yet</p>}
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Work environment" icon={<Globe className="size-4" />}><Chips items={arr(v.environment)} tone="gold" /></Card>
          <Card title="Credentials" icon={<ShieldCheck className="size-4" />}>
            <Row label="Licence no." value={s(v.license)} />
            <Row label="LinkedIn" value={s(v.linkedin)} />
            <Row label="CV" value={s(v.cv)} />
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Student ---------- */

function Student({ v }: { v: Values }) {
  const levels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Graduate", "Postgraduate"];
  const pos = Math.max(0, levels.indexOf(s(v.level)));
  const pct = Math.round(((pos + 1) / 5) * 100);
  return (
    <div className="space-y-6">
      <Hero icon={<GraduationCap className="size-7" />} eyebrow="Student passport" title={s(v.course)} subtitle={s(v.institution)} badge="Open to opportunities"
        meta={<><Meta icon={<MapPin className="size-4" />}>{s(v.country)}</Meta><Meta icon={<Phone className="size-4" />}>{s(v.phone)}</Meta><Meta icon={<Calendar className="size-4" />}>{v.gradYear ? `Class of ${s(v.gradYear)}` : ""}</Meta></>} />
      <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card title="Academic progress" icon={<GraduationCap className="size-4" />}>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-2xl font-semibold text-foreground">{s(v.level) || "—"}</span>
              <span className="text-xs text-muted-foreground">{Math.min(pct, 100)}%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gold" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
            <div className="mt-4"><Row label="Student ID" value={s(v.matric)} /><Row label="Graduation" value={s(v.gradYear)} /></div>
          </Card>
          <Card title="Documents" icon={<FileText className="size-4" />}><Row label="ID / letter" value={s(v.letter)} /></Card>
        </div>
        <div className="space-y-6">
          <Card title="Looking for" icon={<Target className="size-4" />}><Chips items={arr(v.type)} tone="gold" /></Card>
          <Card title="Areas of interest" icon={<Layers className="size-4" />}><Chips items={arr(v.interests)} /></Card>
          <Card title="Availability" icon={<Clock className="size-4" />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-secondary p-4"><p className="text-xs text-muted-foreground">Available from</p><p className="mt-1 font-semibold text-foreground">{s(v.availability) || "—"}</p></div>
              <div className="rounded-xl bg-secondary p-4"><p className="text-xs text-muted-foreground">Duration</p><p className="mt-1 font-semibold text-foreground">{s(v.duration) || "—"}</p></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Organization ---------- */

function Organization({ v }: { v: Values }) {
  return (
    <div className="space-y-6">
      <Hero icon={<Building2 className="size-7" />} eyebrow="Organization account" title={s(v.companyName)} subtitle={s(v.category)} badge="Company verification pending"
        meta={<><Meta icon={<ShieldCheck className="size-4" />}>{s(v.rc)}</Meta><Meta icon={<Globe className="size-4" />}>{s(v.website)}</Meta></>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Company size" value={s(v.size)} />
        <Stat label="Founded" value={s(v.founded)} />
        <Stat label="Verified staff" value="0" />
        <Stat label="Open roles" value="0" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card title="Company record" icon={<Building2 className="size-4" />} className="md:col-span-2">
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div><Row label="RC number" value={s(v.rc)} /><Row label="Category" value={s(v.category)} /><Row label="Permit" value={s(v.permit)} /></div>
            <div><Row label="Website" value={s(v.website)} /><Row label="CAC certificate" value={s(v.cac)} /><Row label="Head office" value={s(v.address)} /></div>
          </div>
          <div className="mt-5"><p className="mb-2 text-xs text-muted-foreground">Industry segments</p><Chips items={arr(v.segments)} tone="gold" /></div>
        </Card>
        <Card title="Account admin" icon={<Users className="size-4" />}>
          <p className="font-semibold text-foreground">{s(v.contactName) || "—"}</p>
          <p className="text-sm text-muted-foreground">{s(v.contactRole)}</p>
          <div className="mt-4 space-y-2 text-sm text-foreground">
            <Meta icon={<Mail className="size-4 text-primary" />}>{s(v.contactEmail)}</Meta>
            <div><Meta icon={<Phone className="size-4 text-primary" />}>{s(v.contactPhone)}</Meta></div>
          </div>
        </Card>
      </div>
      <Card title="Workforce" icon={<Users className="size-4" />}>
        <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-input p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Invite your team to create passports and verify them under your company.</p>
          <button className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Invite team</button>
        </div>
      </Card>
    </div>
  );
}
