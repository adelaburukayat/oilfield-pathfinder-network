import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  BadgeCheck, MapPin, Phone, Camera, Pencil, Share2, X, Plus, Award, FileText, Briefcase,
  GraduationCap, Building2, Globe, Users, ShieldCheck, Mail, Layers, Target, Clock, Calendar,
  Upload, Trash2, Eye, Activity, Check, Linkedin, LayoutDashboard, HeartHandshake, MessageSquare, UserPlus, Clock3,
} from "lucide-react";
import { Logo, HelpLink } from "@/components/brand";
import { PATHS, isPathType, loadProfile, readImage, saveProfile, type Field, type PathType, type Values } from "@/lib/onboarding";

export const Route = createFileRoute("/profile/$type")({
  validateSearch: (s: Record<string, unknown>): { view?: "public" } => (s["view"] === "public" ? { view: "public" } : {}),
  loader: ({ params }) => {
    if (!isPathType(params.type)) throw notFound();
    return { type: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData ? PATHS[loaderData.type].label : "Profile";
    return {
      meta: [
        { title: `${label} profile — Pathfinder` },
        { name: "description", content: `Your ${label} profile on Pathfinder.` },
        { property: "og:title", content: `${label} profile — Pathfinder` },
        { property: "og:description", content: `Your ${label} profile on Pathfinder.` },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ProfilePage,
});

const str = (v: Values[string] | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");
const arr = (v: Values[string] | undefined) => (Array.isArray(v) ? v : []);
type Entry = Record<string, string>;
const list = (v: Values[string] | undefined): Entry[] => {
  try { return typeof v === "string" && v ? (JSON.parse(v) as Entry[]) : []; } catch { return []; }
};

/** True when the person looking is the profile owner; false in the visitor view. */
const OwnerCtx = createContext(true);
const useOwner = () => useContext(OwnerCtx);

/* ---------- tab + headline config per path ---------- */

type Tab = { id: string; label: string };
const TABS: Record<PathType, Tab[]> = {
  professional: [
    { id: "overview", label: "Overview" }, { id: "experience", label: "Experience" },
    { id: "certifications", label: "Certifications" }, { id: "mentoring", label: "Mentoring" }, { id: "documents", label: "Documents" }, { id: "activity", label: "Activity" },
  ],
  student: [
    { id: "overview", label: "Overview" }, { id: "education", label: "Education" },
    { id: "projects", label: "Projects & skills" }, { id: "opportunities", label: "Opportunities" }, { id: "documents", label: "Documents" },
  ],
  organization: [
    { id: "overview", label: "Overview" }, { id: "team", label: "Team" },
    { id: "jobs", label: "Jobs" }, { id: "documents", label: "Documents" }, { id: "activity", label: "Activity" },
  ],
};

function headline(type: PathType, v: Values) {
  if (type === "professional") return { name: str(v["displayName"]) || "Your name", sub: [str(v["jobTitle"]), str(v["employer"])].filter(Boolean).join(" · ") };
  if (type === "student") return { name: str(v["displayName"]) || "Your name", sub: [str(v["course"]), str(v["institution"])].filter(Boolean).join(" · ") };
  return { name: str(v["companyName"]) || "Company name", sub: [str(v["category"]), str(v["size"]) && `${str(v["size"])} employees`].filter(Boolean).join(" · ") };
}

function completeness(type: PathType, v: Values) {
  const base = ["avatar", "cover", "about", "headlineText"];
  const extra: Record<PathType, string[]> = {
    professional: ["displayName", "jobTitle", "disciplines", "certs", "experience", "cv"],
    student: ["displayName", "course", "institution", "interests", "projects", "letter"],
    organization: ["companyName", "rc", "segments", "address", "jobs", "cac"],
  };
  const keys = [...base, ...extra[type]];
  const done = keys.filter((k) => { const x = v[k]; return Array.isArray(x) ? x.length : x && x !== "[]"; });
  return { pct: Math.round((done.length / keys.length) * 100), missing: keys.filter((k) => !done.includes(k)) };
}

const LABELS: Record<string, string> = {
  avatar: "Add a profile photo", cover: "Add a cover photo", about: "Write an about section", headlineText: "Add a headline",
  displayName: "Add your name", jobTitle: "Add job title", disciplines: "Choose disciplines", certs: "Add certifications",
  experience: "Add work experience", cv: "Upload your CV", course: "Add course", institution: "Add institution",
  interests: "Choose interests", projects: "Add a project", letter: "Upload student ID", companyName: "Add company name",
  rc: "Add RC number", segments: "Choose segments", address: "Add head office", jobs: "Post a job", cac: "Upload CAC certificate",
};

/* ---------- page ---------- */

function ProfilePage() {
  const { type } = Route.useLoaderData();
  const [v, setV] = useState<Values | null>(null);
  const [tab, setTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { view } = Route.useSearch();
  const owner = view !== "public";
  const PRIVATE_TABS = ["documents", "activity"];
  useEffect(() => { setV(loadProfile(type)); setTab("overview"); }, [type]);

  if (!v) return <div className="min-h-screen bg-background" />;

  const update = (patch: Values) => {
    const nextV = { ...v, ...patch };
    setV(nextV);
    saveProfile(type, nextV);
  };

  const h = headline(type, v);
  const comp = completeness(type, v);
  const Icon = PATHS[type].icon;

  const share = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?view=public`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  return (
    <OwnerCtx.Provider value={owner}>
    <div className="min-h-screen bg-muted/40">
      {!owner && (
        <div className="flex items-center justify-center gap-3 bg-ink px-4 py-2.5 text-sm text-ink-foreground">
          <Eye className="size-4 text-gold" /> You're seeing this profile the way visitors see it.
          <Link to="/profile/$type" params={{ type }} className="font-semibold text-gold underline-offset-4 hover:underline">Back to my profile</Link>
        </div>
      )}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur md:px-10">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link to="/dashboard/$type" params={{ type }} className="hover:text-foreground">Dashboard</Link>
          <span className="font-medium text-foreground">Profile</span>
          <span>Opportunities</span><span>Network</span><span>Messages</span>
        </nav>
        <span className="hidden sm:block"><HelpLink /></span>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        {/* Identity card */}
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <Cover src={str(v["cover"])} onChange={(d) => update({ cover: d })} />
          <div className="relative px-6 pb-6 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="-mt-14 flex items-end gap-5 md:-mt-16">
                <Avatar src={str(v["avatar"])} fallback={<Icon className="size-10" />} square={type === "organization"} onChange={(d) => update({ avatar: d })} />
              </div>
              {owner ? (
              <div className="flex flex-wrap gap-2 md:pb-1">
                <Link to="/dashboard/$type" params={{ type }} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-ink-foreground hover:bg-ink/90">
                  <LayoutDashboard className="size-4 text-gold" /> Go to dashboard
                </Link>
                <Link to="/profile/$type" params={{ type }} search={{ view: "public" }} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                  <Eye className="size-4" /> View as visitor
                </Link>
                <button onClick={share} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                  {copied ? <Check className="size-4 text-primary" /> : <Share2 className="size-4" />} {copied ? "Link copied" : "Share"}
                </button>
                <button onClick={() => setEditing(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep">
                  <Pencil className="size-4" /> Edit profile
                </button>
              </div>
              ) : (
              <div className="flex flex-wrap gap-2 md:pb-1">
                <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted"><MessageSquare className="size-4" /> Message</button>
                <button className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep"><UserPlus className="size-4" /> {type === "organization" ? "Follow" : "Connect"}</button>
              </div>
              )}
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">{h.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-medium text-foreground ring-1 ring-gold/40">
                  <BadgeCheck className="size-3.5 text-gold" /> Verification pending
                </span>
              </div>
              {str(v["headlineText"]) && <p className="mt-1 text-foreground">{str(v["headlineText"])}</p>}
              {h.sub && <p className="mt-1 text-sm text-muted-foreground">{h.sub}</p>}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                {str(v["country"]) && <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" />{str(v["country"])}</span>}
                {str(v["phone"] ?? v["contactPhone"]) && <span className="inline-flex items-center gap-1.5"><Phone className="size-4" />{str(v["phone"] ?? v["contactPhone"])}</span>}
                {str(v["website"]) && <span className="inline-flex items-center gap-1.5"><Globe className="size-4" />{str(v["website"])}</span>}
                {str(v["linkedin"]) && <span className="inline-flex items-center gap-1.5"><Linkedin className="size-4" />{str(v["linkedin"])}</span>}
                <span className="inline-flex items-center gap-1.5"><Icon className="size-4" />{PATHS[type].label}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto border-t border-border px-4 md:px-6">
            {TABS[type].filter((t) => owner || !PRIVATE_TABS.includes(t.id)).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative whitespace-nowrap px-4 py-3.5 text-sm font-medium transition-colors ${tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t.label}
                {tab === t.id && <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold" />}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <TabBody type={type} tab={!owner && PRIVATE_TABS.includes(tab) ? "overview" : tab} v={v} update={update} onEdit={() => setEditing(true)} />
          </div>
          <aside className="space-y-6">
            {owner && (<>
            <Card title="Profile strength" icon={<Target className="size-4" />}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl font-semibold text-foreground">{comp.pct}%</span>
                <span className="text-xs text-muted-foreground">{comp.pct >= 80 ? "All-star" : comp.pct >= 50 ? "Intermediate" : "Getting started"}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-gold transition-all" style={{ width: `${comp.pct}%` }} /></div>
              <ul className="mt-4 space-y-2">
                {comp.missing.slice(0, 4).map((m) => (
                  <li key={m} className="flex items-center gap-2 text-sm text-muted-foreground"><Plus className="size-3.5 text-primary" />{LABELS[m] ?? m}</li>
                ))}
              </ul>
            </Card>
            </>)}
            <Verification type={type} v={v} />
            {type === "professional" && arr(v["mentoring"]).length > 0 && (
              <Card title="Open to mentoring" icon={<HeartHandshake className="size-4" />}>
                <ul className="space-y-2">{arr(v["mentoring"]).map((m) => <li key={m} className="flex items-center gap-2 text-sm text-foreground"><Check className="size-4 text-gold" />{m}</li>)}</ul>
              </Card>
            )}
            {owner && <Card title="Profile insights" icon={<Eye className="size-4" />}>
              <div className="grid grid-cols-2 gap-3">
                <Mini label="Profile views" value="0" /><Mini label="Search hits" value="0" />
                <Mini label={type === "organization" ? "Applicants" : "Endorsements"} value="0" /><Mini label="Connections" value="0" />
              </div>
            </Card>}
          </aside>
        </div>
      </main>

      {editing && owner && <EditDrawer type={type} v={v} onClose={() => setEditing(false)} onSave={(p) => { update(p); setEditing(false); }} />}
    </div>
    </OwnerCtx.Provider>
  );
}

function Verification({ type, v }: { type: PathType; v: Values }) {
  const items: { label: string; done: boolean }[] =
    type === "professional" ? [
      { label: "Profile photo", done: !!str(v["avatar"]) },
      { label: "NIN", done: !!str(v["nin"]) && !!str(v["ninSlip"]) },
      { label: `Certificates (${arr(v["certFiles"]).length})`, done: arr(v["certFiles"]).length > 0 },
    ] : type === "student" ? [
      { label: "Profile photo", done: !!str(v["avatar"]) },
      { label: "Student ID", done: !!str(v["letter"]) },
    ] : [
      { label: "Company logo", done: !!str(v["avatar"]) },
      { label: "CAC certificate", done: !!str(v["cac"]) },
      { label: "RC number", done: !!str(v["rc"]) },
    ];
  return (
    <Card title="Verification" icon={<ShieldCheck className="size-4" />}>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-foreground">{i.label}</span>
            {i.done ? <span className="inline-flex items-center gap-1 text-xs font-medium text-gold"><Clock3 className="size-3.5" /> Under review</span>
              : <span className="text-xs text-muted-foreground">Not submitted</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ---------- cover & avatar ---------- */

function Cover({ src, onChange }: { src: string; onChange: (d: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const owner = useOwner();
  return (
    <div className="group relative h-44 bg-ink md:h-56">
      {src ? <img src={src} alt="Cover" className="size-full object-cover" /> : (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 -top-24 size-80 rounded-full bg-primary/50 blur-3xl" />
          <div className="absolute -bottom-24 right-10 size-72 rounded-full bg-gold/30 blur-3xl" />
        </div>
      )}
      {owner && <button onClick={() => ref.current?.click()}
        className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-2 text-xs font-semibold text-foreground shadow-card backdrop-blur hover:bg-background">
        <Camera className="size-4" /> {src ? "Change cover" : "Add cover photo"}
      </button>}
      <input ref={ref} type="file" accept="image/*" className="sr-only"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange(await readImage(f, 1600)); e.target.value = ""; }} />
    </div>
  );
}

function Avatar({ src, fallback, square, onChange }: { src: string; fallback: ReactNode; square: boolean; onChange: (d: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const shape = square ? "rounded-2xl" : "rounded-full";
  const owner = useOwner();
  if (!owner) return (
    <div className={`relative size-28 overflow-hidden ${shape} bg-secondary text-primary ring-4 ring-card shadow-lift md:size-32`}>
      {src ? <img src={src} alt="Profile" className="size-full object-cover" /> : <span className="grid size-full place-items-center">{fallback}</span>}
    </div>
  );
  return (
    <button onClick={() => ref.current?.click()} aria-label="Change profile photo"
      className={`group relative size-28 overflow-hidden ${shape} bg-secondary text-primary ring-4 ring-card shadow-lift md:size-32`}>
      {src ? <img src={src} alt="Profile" className="size-full object-cover" /> : <span className="grid size-full place-items-center">{fallback}</span>}
      <span className="absolute inset-0 grid place-items-center bg-ink/55 text-ink-foreground opacity-0 transition-opacity group-hover:opacity-100">
        <Camera className="size-6" />
      </span>
      <input ref={ref} type="file" accept="image/*" className="sr-only"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange(await readImage(f, 500)); e.target.value = ""; }} />
    </button>
  );
}

/* ---------- shared UI ---------- */

function Card({ title, icon, children, action }: { title: string; icon: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold text-foreground"><span className="text-primary">{icon}</span>{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function IconBtn({ onClick, children, label }: { onClick: () => void; children: ReactNode; label: string }) {
  if (!useOwner()) return null;
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-deep" aria-label={label}>{children}</button>;
}

function Chips({ items, tone = "green" }: { items: string[]; tone?: "green" | "gold" }) {
  if (!items.length) return <Empty text="Nothing added yet" />;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i) => (
        <span key={i} className={`rounded-full px-3 py-1 text-sm ${tone === "gold" ? "bg-gold-soft text-foreground ring-1 ring-gold/40" : "bg-secondary text-secondary-foreground"}`}>{i}</span>
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

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/60 p-3"><p className="font-display text-xl font-semibold text-foreground">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-input p-4 text-center text-sm text-muted-foreground">{text}</p>;
}

function About({ v, onEdit }: { v: Values; onEdit: () => void }) {
  const t = str(v["about"]);
  const owner = useOwner();
  return (
    <Card title="About" icon={<FileText className="size-4" />} action={<IconBtn onClick={onEdit} label="Edit about"><Pencil className="size-3.5" /> Edit</IconBtn>}>
      {t ? <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{t}</p> : <Empty text={owner ? "Tell people who you are and what you do." : "No about section yet."} />}
    </Card>
  );
}

/* ---------- list editor (experience, projects, jobs) ---------- */

function ListSection({ title, icon, items, fields, onChange, render, emptyText }: {
  title: string; icon: ReactNode; items: Entry[]; fields: { name: string; label: string; area?: boolean }[];
  onChange: (items: Entry[]) => void; render: (e: Entry) => ReactNode; emptyText: string;
}) {
  const [draft, setDraft] = useState<Entry | null>(null);
  const owner = useOwner();
  return (
    <Card title={title} icon={icon} action={!draft && <IconBtn onClick={() => setDraft({})} label={`Add ${title}`}><Plus className="size-4" /> Add</IconBtn>}>
      {draft && (
        <div className="mb-4 grid gap-3 rounded-xl border border-border bg-muted/40 p-4">
          {fields.map((f) => f.area ? (
            <textarea key={f.name} rows={3} placeholder={f.label} value={draft[f.name] ?? ""} onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })} className="field h-auto py-3" />
          ) : (
            <input key={f.name} placeholder={f.label} value={draft[f.name] ?? ""} onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })} className="field" />
          ))}
          <div className="flex justify-end gap-2">
            <button onClick={() => setDraft(null)} className="h-9 rounded-full px-4 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={() => { if (Object.values(draft).some((x) => x.trim())) onChange([draft, ...items]); setDraft(null); }}
              className="h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Save</button>
          </div>
        </div>
      )}
      {items.length ? (
        <ul className="divide-y divide-border">
          {items.map((e, i) => (
            <li key={i} className="group flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">{render(e)}</div>
              {owner && <button onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove" className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"><Trash2 className="size-4" /></button>}
            </li>
          ))}
        </ul>
      ) : !draft && <Empty text={emptyText} />}
    </Card>
  );
}

/* ---------- documents ---------- */

function Documents({ v, update, preset }: { v: Values; update: (p: Values) => void; preset: { key: string; label: string }[] }) {
  const docs = list(v["docs"]);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Card title="Documents" icon={<FileText className="size-4" />} action={<IconBtn onClick={() => ref.current?.click()} label="Upload document"><Upload className="size-4" /> Upload</IconBtn>}>
      <input ref={ref} type="file" className="sr-only" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) update({ docs: JSON.stringify([{ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB`, date: new Date().toLocaleDateString() }, ...docs]) });
        e.target.value = "";
      }} />
      <ul className="space-y-3">
        {preset.map((p) => (
          <li key={p.key} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <span className="grid size-10 place-items-center rounded-lg bg-secondary text-primary"><FileText className="size-4" /></span>
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{p.label}</p><p className="text-xs text-muted-foreground">{str(v[p.key]) || "Not uploaded"}</p></div>
            {str(v[p.key]) ? <span className="text-xs font-medium text-gold">Under review</span> : <span className="text-xs text-muted-foreground">Missing</span>}
          </li>
        ))}
        {docs.map((d, i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <span className="grid size-10 place-items-center rounded-lg bg-gold-soft text-gold"><FileText className="size-4" /></span>
            <div className="flex-1"><p className="text-sm font-medium text-foreground">{d["name"]}</p><p className="text-xs text-muted-foreground">{d["size"]} · {d["date"]}</p></div>
            <button onClick={() => update({ docs: JSON.stringify(docs.filter((_, j) => j !== i)) })} aria-label="Remove" className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ActivityFeed({ v }: { v: Values }) {
  const items = [
    { t: "Profile created", d: "Your details were submitted for verification." },
    ...(str(v["avatar"]) ? [{ t: "Profile photo added", d: "Your profile is easier to recognise." }] : []),
    ...(str(v["cover"]) ? [{ t: "Cover photo added", d: "Your profile looks more complete." }] : []),
  ];
  return (
    <Card title="Activity" icon={<Activity className="size-4" />}>
      <ol className="relative space-y-5 border-l border-border pl-5">
        {items.map((i) => (
          <li key={i.t} className="relative"><span className="absolute -left-[26px] top-1 size-3 rounded-full bg-gold ring-4 ring-card" />
            <p className="text-sm font-medium text-foreground">{i.t}</p><p className="text-xs text-muted-foreground">{i.d}</p></li>
        ))}
      </ol>
    </Card>
  );
}

function Mentoring({ v, onEdit }: { v: Values; onEdit: () => void }) {
  const open = arr(v["mentoring"]);
  const owner = useOwner();
  return (
    <Card title="Mentoring" icon={<HeartHandshake className="size-4" />} action={<IconBtn onClick={onEdit} label="Edit mentoring"><Pencil className="size-3.5" /> Edit</IconBtn>}>
      {open.length ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {open.map((m) => (
              <div key={m} className="rounded-xl bg-ink p-4 text-ink-foreground">
                <HeartHandshake className="size-5 text-gold" /><p className="mt-2 text-sm font-semibold">{m}</p>
              </div>
            ))}
          </div>
          <div><p className="mb-2 text-xs text-muted-foreground">Topics</p><Chips items={arr(v["mentorAreas"])} /></div>
          <div className="grid grid-cols-2 gap-3"><Mini label="Time available" value={str(v["mentorTime"]) || "—"} /><Mini label="Format" value={str(v["mentorFormat"]) || "—"} /></div>
        </div>
      ) : <Empty text={owner ? "Turn on mentoring to help students, interns or organization staff." : "Not open to mentoring right now."} />}
    </Card>
  );
}

/* ---------- tab bodies ---------- */

function TabBody({ type, tab, v, update, onEdit }: { type: PathType; tab: string; v: Values; update: (p: Values) => void; onEdit: () => void }) {
  if (type === "professional") {
    if (tab === "experience") return (
      <ListSection title="Experience" icon={<Briefcase className="size-4" />} items={list(v["experience"])} onChange={(x) => update({ experience: JSON.stringify(x) })}
        emptyText="Add the roles, rigs and projects you've worked on."
        fields={[{ name: "role", label: "Role" }, { name: "company", label: "Company" }, { name: "period", label: "Period (e.g. 2019 – 2023)" }, { name: "location", label: "Location / asset" }, { name: "summary", label: "What you did", area: true }]}
        render={(e) => (<><p className="font-semibold text-foreground">{e["role"]}</p><p className="text-sm text-muted-foreground">{[e["company"], e["location"]].filter(Boolean).join(" · ")}</p><p className="text-xs text-muted-foreground">{e["period"]}</p>{e["summary"] && <p className="mt-2 text-sm text-foreground">{e["summary"]}</p>}</>)} />
    );
    if (tab === "certifications") return (
      <Card title="Certification vault" icon={<Award className="size-4" />} action={<IconBtn onClick={onEdit} label="Edit certifications"><Pencil className="size-3.5" /> Edit</IconBtn>}>
        {arr(v["certs"]).length ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {arr(v["certs"]).map((c) => (
              <li key={c} className="flex items-center gap-3 rounded-xl border border-border p-4">
                <span className="grid size-10 place-items-center rounded-lg bg-gold-soft text-gold"><Award className="size-5" /></span>
                <div><p className="text-sm font-semibold text-foreground">{c}</p><p className="text-xs text-muted-foreground">Listed certification</p></div>
              </li>
            ))}
          </ul>
        ) : <Empty text="No certifications listed yet." />}
        {arr(v["certFiles"]).length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gold">Uploaded certificates</p>
            <ul className="space-y-2">{arr(v["certFiles"]).map((n) => (
              <li key={n} className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm">
                <FileText className="size-4 text-primary" /><span className="flex-1 truncate text-foreground">{n}</span><span className="text-xs font-medium text-gold">Under review</span>
              </li>))}</ul>
          </div>
        )}
      </Card>
    );
    if (tab === "mentoring") return <Mentoring v={v} onEdit={onEdit} />;
    if (tab === "documents") return <Documents v={v} update={update} preset={[{ key: "cv", label: "Curriculum vitae" }, { key: "ninSlip", label: "NIN slip" }]} />;
    if (tab === "activity") return <ActivityFeed v={v} />;
    return (<>
      <About v={v} onEdit={onEdit} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Mini label="Years of experience" value={str(v["years"]) || "—"} />
        <Mini label="Certifications" value={String(arr(v["certs"]).length)} />
        <Mini label="Roles listed" value={String(list(v["experience"]).length)} />
      </div>
      <Card title="Disciplines" icon={<Layers className="size-4" />}><Chips items={arr(v["disciplines"])} /></Card>
      <Card title="Work environment" icon={<Globe className="size-4" />}><Chips items={arr(v["environment"])} tone="gold" /></Card>
      <Card title="Credentials" icon={<ShieldCheck className="size-4" />}><Row label="Licence no." value={str(v["license"])} /><Row label="LinkedIn" value={str(v["linkedin"])} /></Card>
      <Mentoring v={v} onEdit={onEdit} />
    </>);
  }

  if (type === "student") {
    if (tab === "education") return (
      <Card title="Education" icon={<GraduationCap className="size-4" />} action={<IconBtn onClick={onEdit} label="Edit education"><Pencil className="size-3.5" /> Edit</IconBtn>}>
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><GraduationCap className="size-6" /></span>
          <div><p className="font-semibold text-foreground">{str(v["institution"]) || "—"}</p><p className="text-sm text-muted-foreground">{str(v["course"])}</p>
            <p className="text-xs text-muted-foreground">{[str(v["level"]), str(v["gradYear"]) && `Class of ${str(v["gradYear"])}`].filter(Boolean).join(" · ")}</p></div>
        </div>
        <div className="mt-4"><Row label="Student ID" value={str(v["matric"])} /></div>
      </Card>
    );
    if (tab === "projects") return (<>
      <ListSection title="Projects" icon={<Layers className="size-4" />} items={list(v["projects"])} onChange={(x) => update({ projects: JSON.stringify(x) })}
        emptyText="Add class projects, field trips or research."
        fields={[{ name: "title", label: "Project title" }, { name: "where", label: "Course / organisation" }, { name: "summary", label: "Summary", area: true }]}
        render={(e) => (<><p className="font-semibold text-foreground">{e["title"]}</p><p className="text-sm text-muted-foreground">{e["where"]}</p>{e["summary"] && <p className="mt-2 text-sm text-foreground">{e["summary"]}</p>}</>)} />
      <Card title="Areas of interest" icon={<Target className="size-4" />}><Chips items={arr(v["interests"])} /></Card>
    </>);
    if (tab === "opportunities") return (<>
      <Card title="Looking for" icon={<Target className="size-4" />}><Chips items={arr(v["type"])} tone="gold" /></Card>
      <Card title="Availability" icon={<Clock className="size-4" />}>
        <div className="grid grid-cols-2 gap-3"><Mini label="Available from" value={str(v["availability"]) || "—"} /><Mini label="Duration" value={str(v["duration"]) || "—"} /></div>
      </Card>
      <Card title="Recommended for you" icon={<Briefcase className="size-4" />}><Empty text="Matching internships will appear here once your profile is verified." /></Card>
    </>);
    if (tab === "documents") return <Documents v={v} update={update} preset={[{ key: "letter", label: "Student ID / introduction letter" }]} />;
    return (<>
      <About v={v} onEdit={onEdit} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Mini label="Level" value={str(v["level"]) || "—"} /><Mini label="Graduating" value={str(v["gradYear"]) || "—"} /><Mini label="Projects" value={String(list(v["projects"]).length)} />
      </div>
      <Card title="Areas of interest" icon={<Layers className="size-4" />}><Chips items={arr(v["interests"])} /></Card>
      <Card title="Looking for" icon={<Calendar className="size-4" />}><Chips items={arr(v["type"])} tone="gold" /></Card>
    </>);
  }

  // organization
  if (tab === "team") return (
    <ListSection title="Team members" icon={<Users className="size-4" />} items={list(v["team"])} onChange={(x) => update({ team: JSON.stringify(x) })}
      emptyText="Invite staff so they can link their profiles to your company."
      fields={[{ name: "name", label: "Full name" }, { name: "email", label: "Work email" }, { name: "role", label: "Role" }]}
      render={(e) => (<div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{(e["name"] ?? "?").slice(0, 1).toUpperCase()}</span>
        <div><p className="font-medium text-foreground">{e["name"]}</p><p className="text-xs text-muted-foreground">{[e["role"], e["email"]].filter(Boolean).join(" · ")} · Invite sent</p></div></div>)} />
  );
  if (tab === "jobs") return (
    <ListSection title="Job openings" icon={<Briefcase className="size-4" />} items={list(v["jobs"])} onChange={(x) => update({ jobs: JSON.stringify(x) })}
      emptyText="Post your first role to start receiving verified applicants."
      fields={[{ name: "title", label: "Job title" }, { name: "location", label: "Location (e.g. Offshore, Bonny)" }, { name: "type", label: "Type (Full-time, Rotation, Contract)" }, { name: "summary", label: "Description", area: true }]}
      render={(e) => (<><div className="flex items-center gap-2"><p className="font-semibold text-foreground">{e["title"]}</p>{e["type"] && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs text-foreground">{e["type"]}</span>}</div>
        <p className="text-sm text-muted-foreground">{e["location"]}</p>{e["summary"] && <p className="mt-2 text-sm text-foreground">{e["summary"]}</p>}<p className="mt-2 text-xs text-muted-foreground">0 applicants</p></>)} />
  );
  if (tab === "documents") return <Documents v={v} update={update} preset={[{ key: "cac", label: "CAC certificate" }]} />;
  if (tab === "activity") return <ActivityFeed v={v} />;
  return (<>
    <About v={v} onEdit={onEdit} />
    <div className="grid gap-4 sm:grid-cols-4">
      <Mini label="Company size" value={str(v["size"]) || "—"} /><Mini label="Founded" value={str(v["founded"]) || "—"} />
      <Mini label="Team members" value={String(list(v["team"]).length)} /><Mini label="Open roles" value={String(list(v["jobs"]).length)} />
    </div>
    <Card title="Company record" icon={<Building2 className="size-4" />}>
      <Row label="RC number" value={str(v["rc"])} /><Row label="Permit" value={str(v["permit"])} /><Row label="Head office" value={str(v["address"])} />
      <div className="mt-4"><p className="mb-2 text-xs text-muted-foreground">Industry segments</p><Chips items={arr(v["segments"])} tone="gold" /></div>
    </Card>
    <Card title="Account admin" icon={<Users className="size-4" />}>
      <p className="font-semibold text-foreground">{str(v["contactName"]) || "—"}</p><p className="text-sm text-muted-foreground">{str(v["contactRole"])}</p>
      {str(v["contactEmail"]) && <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground"><Mail className="size-4 text-primary" />{str(v["contactEmail"])}</p>}
    </Card>
  </>);
}

/* ---------- edit drawer ---------- */

function EditDrawer({ type, v, onClose, onSave }: { type: PathType; v: Values; onClose: () => void; onSave: (p: Values) => void }) {
  const [d, setD] = useState<Values>(v);
  const intro: Field[] = [
    ...(type !== "organization" ? [{ name: "displayName", label: "Full name", type: "text" as const }] : []),
    { name: "headlineText", label: "Headline", type: "text", placeholder: type === "organization" ? "e.g. Delivering safe offshore operations since 2008" : "e.g. Drilling engineer · Deepwater specialist" },
    { name: "about", label: type === "organization" ? "About the company" : "About you", type: "textarea" },
  ];
  const sections = [{ id: "intro", title: "Intro", fields: intro }, ...PATHS[type].steps.map((s) => ({ ...s, fields: s.fields.filter((f) => !["file", "image", "files"].includes(f.type)) }))];
  const set = (n: string, x: string | string[]) => setD((s) => ({ ...s, [n]: x }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/50 backdrop-blur-sm" />
      <div className="relative flex h-full w-full max-w-xl flex-col bg-background shadow-lift animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Edit profile</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="size-5" /></button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {sections.map((s) => (
            <section key={s.id}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{s.title}</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {s.fields.map((f) => <EditField key={f.name} f={f} value={d[f.name]} onChange={(x) => set(f.name, x)} />)}
              </div>
            </section>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <button onClick={onClose} className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={() => onSave(d)} className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function EditField({ f, value, onChange }: { f: Field; value: Values[string] | undefined; onChange: (v: string | string[]) => void }) {
  const s = typeof value === "string" ? value : "";
  let control: ReactNode;
  if (f.type === "select") control = (
    <select value={s} onChange={(e) => onChange(e.target.value)} className="field"><option value="">Select…</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
  );
  else if (f.type === "textarea") control = <textarea rows={4} value={s} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className="field h-auto py-3" />;
  else if (f.type === "chips") {
    const a = Array.isArray(value) ? value : [];
    control = (
      <div className="flex flex-wrap gap-2">
        {f.options?.map((o) => { const on = a.includes(o); return (
          <button type="button" key={o} onClick={() => onChange(on ? a.filter((x) => x !== o) : [...a, o])}
            className={`inline-flex h-8 items-center gap-1 rounded-full border px-3 text-sm ${on ? "border-primary bg-secondary text-secondary-foreground" : "border-input bg-card text-foreground hover:border-primary/50"}`}>
            {on && <Check className="size-3.5" strokeWidth={3} />}{o}</button>); })}
      </div>
    );
  } else control = <input type={f.type} value={s} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className="field" />;
  return (
    <div className={f.half ? "col-span-2 sm:col-span-1" : "col-span-2"}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{f.label}</label>
      {control}
    </div>
  );
}
