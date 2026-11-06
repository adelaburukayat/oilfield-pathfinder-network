import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, Eye, HeartHandshake, Users, FileText, Target, UserCircle, Bell } from "lucide-react";
import { Logo, HelpLink } from "@/components/brand";
import { PATHS, isPathType, loadProfile, type PathType, type Values } from "@/lib/onboarding";

export const Route = createFileRoute("/dashboard/$type")({
  loader: ({ params }) => {
    if (!isPathType(params.type)) throw notFound();
    return { type: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData ? PATHS[loaderData.type].label : "Account";
    return {
      meta: [
        { title: `${label} dashboard — Pathfinder` },
        { name: "description", content: `Your ${label} dashboard on Pathfinder: activity, opportunities and next steps.` },
        { property: "og:title", content: `${label} dashboard — Pathfinder` },
        { property: "og:description", content: `Your ${label} dashboard on Pathfinder.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: Dashboard,
});

const s = (v: Values[string] | undefined) => (Array.isArray(v) ? v.join(", ") : v ?? "");
const count = (v: Values[string] | undefined) => {
  try { return typeof v === "string" && v ? (JSON.parse(v) as unknown[]).length : 0; } catch { return 0; }
};

type Tile = { label: string; value: string; icon: typeof Eye };
type Action = { title: string; text: string; icon: typeof Eye };

function config(type: PathType, v: Values): { tiles: Tile[]; actions: Action[] } {
  if (type === "professional") return {
    tiles: [
      { label: "Profile views", value: "0", icon: Eye },
      { label: "Certificates", value: String(Array.isArray(v["certFiles"]) ? v["certFiles"].length : 0), icon: FileText },
      { label: "Mentees", value: "0", icon: HeartHandshake },
      { label: "Job matches", value: "0", icon: Briefcase },
    ],
    actions: [
      { title: "Browse opportunities", text: "Roles that match your disciplines and experience.", icon: Briefcase },
      { title: "Mentoring requests", text: Array.isArray(v["mentoring"]) && v["mentoring"].length ? "Requests from students and organizations show here." : "Turn on mentoring from your profile to receive requests.", icon: HeartHandshake },
      { title: "Verification status", text: "We're reviewing your NIN and certificates.", icon: Target },
    ],
  };
  if (type === "student") return {
    tiles: [
      { label: "Profile views", value: "0", icon: Eye },
      { label: "Applications", value: "0", icon: Briefcase },
      { label: "Projects", value: String(count(v["projects"])), icon: FileText },
      { label: "Mentors", value: "0", icon: HeartHandshake },
    ],
    actions: [
      { title: "Find internships", text: "SIWES, internships and graduate trainee roles.", icon: Briefcase },
      { title: "Find a mentor", text: "Connect with professionals open to mentoring.", icon: HeartHandshake },
      { title: "Build your profile", text: "Add projects to stand out to recruiters.", icon: Target },
    ],
  };
  return {
    tiles: [
      { label: "Team members", value: String(count(v["team"])), icon: Users },
      { label: "Open roles", value: String(count(v["jobs"])), icon: Briefcase },
      { label: "Applicants", value: "0", icon: FileText },
      { label: "Mentors engaged", value: "0", icon: HeartHandshake },
    ],
    actions: [
      { title: "Post a job", text: "Reach verified professionals and graduates.", icon: Briefcase },
      { title: "Invite your team", text: "Link your staff to your company page.", icon: Users },
      { title: "Request mentors", text: "Find professionals to mentor your staff.", icon: HeartHandshake },
    ],
  };
}

function Dashboard() {
  const { type } = Route.useLoaderData();
  const [v, setV] = useState<Values | null>(null);
  useEffect(() => { setV(loadProfile(type)); }, [type]);
  if (!v) return <div className="min-h-screen bg-background" />;

  const name = type === "organization" ? s(v["companyName"]) || "your company" : (s(v["displayName"]) || "there");
  const { tiles, actions } = config(type, v);
  const avatar = s(v["avatar"]);

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur md:px-10">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <span className="font-medium text-foreground">Dashboard</span>
          <Link to="/profile/$type" params={{ type }} className="hover:text-foreground">Profile</Link>
          <span>Opportunities</span><span>Messages</span>
        </nav>
        <div className="flex items-center gap-4">
          <Bell className="size-5 text-muted-foreground" />
          <span className="hidden sm:block"><HelpLink /></span>
          <Link to="/profile/$type" params={{ type }} aria-label="My profile" className={`size-9 overflow-hidden bg-secondary ${type === "organization" ? "rounded-lg" : "rounded-full"}`}>
            {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : <UserCircle className="m-1.5 size-6 text-primary" />}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground md:p-10">
          <div className="absolute -right-16 -top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{PATHS[type].label} dashboard</p>
              <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Welcome, {name}</h1>
              <p className="mt-2 text-ink-foreground/70">Here's what's happening with your account today.</p>
            </div>
            <Link to="/profile/$type" params={{ type }} className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-gold px-5 text-sm font-semibold text-ink hover:opacity-90">
              View my profile <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <t.icon className="size-5 text-primary" />
              <p className="mt-4 font-display text-3xl font-semibold text-foreground">{t.value}</p>
              <p className="text-sm text-muted-foreground">{t.label}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-semibold text-foreground">Next steps</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {actions.map((a) => (
            <div key={a.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="grid size-10 place-items-center rounded-xl bg-gold-soft text-gold"><a.icon className="size-5" /></span>
              <p className="mt-4 font-semibold text-foreground">{a.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
