import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Briefcase, GraduationCap, Building2, Eye, FileText, HeartHandshake, Users, Target,
  Home, User as UserIcon, MessageSquare, Settings as SettingsIcon, Star, Award, Bell,
  TrendingUp, PlayCircle, Plus, Check, X, Crown, Trash2, Search, ShieldCheck, Mail,
} from "lucide-react";
import { PATHS, isPathType, loadProfile, type PathType, type Values } from "@/lib/onboarding";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";
import { Messaging } from "@/components/messaging";
import {
  PageHeader, StatGrid, WelcomeBanner, QuickLinkCard, ActivityCard,
  OpportunitiesSection, NetworkSection, LearningSection, ServicesSection,
} from "@/components/dashboard-sections";
import { Badge, EmptyState } from "@/lib/auth";
import {
  loadOpportunities, loadApplicants, loadJobPostings, saveJobPostings,
  loadServices, loadServiceRequests, loadMentorshipRequests,
  loadCourses, loadTalentPool, saveTalentPool, loadAnalytics, loadBilling, loadTeam,
  loadConnections, loadVisibility,
} from "@/lib/store";

export const Route = createFileRoute("/dashboard/$type")({
  loader: ({ params }) => {
    if (!isPathType(params.type)) throw notFound();
    return { type: params.type };
  },
  head: ({ loaderData }) => {
    const label = loaderData ? PATHS[loaderData.type].label : "Account";
    return {
      meta: [
        { title: `${label} dashboard — OilSwift` },
        { name: "description", content: `Your ${label} dashboard on OilSwift: activity, opportunities and next steps.` },
        { property: "og:title", content: `${label} dashboard — OilSwift` },
        { property: "og:description", content: `Your ${label} dashboard on OilSwift.` },
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

function completenessPct(type: PathType, v: Values) {
  const base = ["avatar", "cover", "about", "headlineText"];
  const extra: Record<PathType, string[]> = {
    professional: ["displayName", "jobTitle", "disciplines", "certs", "experience", "cv"],
    student: ["displayName", "course", "institution", "interests", "projects", "letter"],
    organization: ["companyName", "rc", "segments", "address", "jobs", "cac"],
  };
  const keys = [...base, ...extra[type]];
  const done = keys.filter((k) => { const x = v[k]; return Array.isArray(x) ? x.length : x && x !== "[]"; });
  return Math.round((done.length / keys.length) * 100);
}

function Dashboard() {
  const { type } = Route.useLoaderData();
  const navigate = useNavigate();
  const [section, setSection] = useState("home");
  const [v, setV] = useState<Values | null>(null);
  useEffect(() => { setV(loadProfile(type)); setSection("home"); }, [type]);
  if (!v) return <div className="min-h-screen bg-background" />;

  const name = type === "organization" ? s(v["companyName"]) || "Your company" : s(v["displayName"]) || "there";
  const comp = completenessPct(type, v);
  const goTo = (id: string) => setSection(id);

  return (
    <DashboardShell type={type} navItems={navFor(type, v)} active={section} onNavigate={goTo} pageTitle={pageTitleFor(type, section)}>
      {renderSection(type, section, v, comp, goTo, navigate)}
    </DashboardShell>
  );
}

/* ---------- navigation per role ---------- */

function navFor(type: PathType, v: Values): NavItem[] {
  const common: NavItem[] = [
    { id: "home", label: "Home", icon: <Home className="size-4" /> },
  ];
  const profile: NavItem = { id: "profile", label: type === "organization" ? "Company Profile" : "My Profile", icon: <UserIcon className="size-4" /> };
  const messages: NavItem = { id: "messages", label: "Messages", icon: <MessageSquare className="size-4" /> };
  const settings: NavItem = { id: "settings", label: "Settings", icon: <SettingsIcon className="size-4" /> };

  if (type === "professional") return [
    ...common,
    profile,
    { id: "opportunities", label: "Opportunities", icon: <Briefcase className="size-4" /> },
    { id: "network", label: "Network", icon: <Users className="size-4" /> },
    { id: "learning", label: "Learning", icon: <Award className="size-4" /> },
    { id: "services", label: "Services", icon: <TrendingUp className="size-4" /> },
    messages, settings,
  ];

  if (type === "student") return [
    ...common,
    profile,
    { id: "opportunities", label: "Internships & Graduate Jobs", icon: <Briefcase className="size-4" /> },
    { id: "mentorship", label: "Mentorship", icon: <HeartHandshake className="size-4" /> },
    { id: "learning", label: "Learning", icon: <Award className="size-4" /> },
    messages, settings,
  ];

  // organization — conditional by category
  const category = s(v["category"]);
  const isTrainingProvider = category === "Training provider";
  const isRegulator = category === "Regulator / Agency";
  const isEmployer = !isTrainingProvider && !isRegulator;

  const items: NavItem[] = [...common, profile];
  if (isEmployer) {
    items.push(
      { id: "talent", label: "Talent Search", icon: <Search className="size-4" /> },
      { id: "post", label: "Post Opportunities", icon: <Plus className="size-4" /> },
    );
  }
  if (isTrainingProvider) {
    items.push({ id: "courses", label: "Courses", icon: <Award className="size-4" /> });
  }
  if (!isRegulator) {
    items.push({ id: "analytics", label: "Analytics", icon: <TrendingUp className="size-4" /> });
  } else {
    items.push({ id: "compliance", label: "Compliance", icon: <ShieldCheck className="size-4" /> });
  }
  items.push(messages);
  if (!isRegulator) items.push({ id: "billing", label: "Billing & Revenue", icon: <Crown className="size-4" /> });
  items.push(settings);
  return items;
}

function pageTitleFor(type: PathType, section: string) {
  const nav = navFor(type, loadProfile(type));
  return nav.find((n) => n.id === section)?.label ?? "Home";
}

function renderSection(
  type: PathType, section: string, v: Values, comp: number,
  goTo: (id: string) => void, navigate: ReturnType<typeof useNavigate>,
) {
  if (section === "home") return <HomeSection type={type} v={v} comp={comp} goTo={goTo} />;
  if (section === "profile") return <RedirectToProfile type={type} navigate={navigate} />;
  if (section === "opportunities") return <OpportunitiesSection type={type} />;
  if (section === "network") return <NetworkSection type={type} />;
  if (section === "learning") return <LearningSection type={type} />;
  if (section === "mentorship") return <NetworkSection type={type} />;
  if (section === "services") return <ServicesSection type={type} />;
  if (section === "messages") return <Messaging type={type} />;
  if (section === "settings") return <SettingsRedirect type={type} navigate={navigate} />;
  if (section === "talent") return <TalentSearchSection />;
  if (section === "post") return <PostOpportunitiesSection type={type} />;
  if (section === "courses") return <OrgCoursesSection type={type} />;
  if (section === "analytics") return <AnalyticsSection type={type} />;
  if (section === "billing") return <BillingSection type={type} />;
  if (section === "compliance") return <ComplianceSection />;
  return null;
}

function RedirectToProfile({ type, navigate }: { type: PathType; navigate: ReturnType<typeof useNavigate> }) {
  useEffect(() => { navigate({ to: "/profile/$type", params: { type } }); }, [type, navigate]);
  return <div className="min-h-40" />;
}

function SettingsRedirect({ type, navigate }: { type: PathType; navigate: ReturnType<typeof useNavigate> }) {
  useEffect(() => { navigate({ to: "/settings/$type", params: { type } }); }, [type, navigate]);
  return <div className="min-h-40" />;
}

/* ---------- HOME: professional & student ---------- */

function HomeSection({ type, v, comp, goTo }: { type: PathType; v: Values; comp: number; goTo: (id: string) => void }) {
  const visibility = loadVisibility(type);
  const applications = loadOpportunities(type).filter((o) => o.applied);
  const mentorship = loadMentorshipRequests(type);
  const courses = loadCourses(type);
  const enrolled = courses.filter((c) => c.status === "enrolled");
  const completed = courses.filter((c) => c.status === "completed");
  const notifications = loadNotifications(type).filter((n) => !n.read);

  if (type === "organization") return <OrgHome type={type} v={v} comp={comp} goTo={goTo} />;

  const isPro = type === "professional";
  const services = isPro ? loadServices(type) : [];
  const serviceReqs = isPro ? loadServiceRequests(type).filter((r) => r.status === "pending") : [];
  const connections = isPro ? loadConnections(type).filter((c) => c.status === "connected") : [];

  return (
    <div className="space-y-6">
      <WelcomeBanner name={s(v["displayName"]) || s(v["companyName"]) || "there"} type={type} completenessPct={comp} />

      <StatGrid items={[
        { label: "Profile completion", value: `${comp}%`, icon: <Target className="size-5" /> },
        { label: "Applications", value: String(applications.length), icon: <Briefcase className="size-5" /> },
        isPro
          ? { label: "Connections", value: String(connections.length), icon: <Users className="size-5" /> }
          : { label: "Mentorship requests", value: String(mentorship.length), icon: <HeartHandshake className="size-5" /> },
        { label: "Courses completed", value: String(completed.length), icon: <Award className="size-5" /> },
      ]} />

      <div className="grid gap-4 md:grid-cols-3">
        <QuickLinkCard to="/profile/$type" params={{ type }} icon={<UserIcon className="size-5" />} title={isPro ? "My Professional Passport" : "My Student Profile"} text={`Your profile is ${comp}% complete. ${comp < 100 ? "Finish it to stand out." : "Looking great."}`} />
        <QuickLinkCard to="/dashboard/$type" params={{ type }} icon={<Briefcase className="size-5" />} title={isPro ? "Browse opportunities" : "Find internships"} text={isPro ? "Jobs, contracts and tenders matching your skills." : "SIWES, internships and graduate trainee roles."} />
        <QuickLinkCard to="/dashboard/$type" params={{ type }} icon={<Award className="size-5" />} title="Continue learning" text={enrolled.length ? `You have ${enrolled.length} active course${enrolled.length !== 1 ? "s" : ""}.` : "Discover courses to build your skills."} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityCard title="Recent applications" icon={<FileText className="size-4" />} items={
          applications.length ? applications.slice(0, 4).map((a) => ({ label: a.title, value: a.applied === "review" ? "Under review" : "Submitted", tone: a.applied === "review" ? "gold" : "blue" }))
            : [{ label: "No applications yet", value: "Start", tone: "green" }]
        } />
        <ActivityCard title={isPro ? "Mentorship & services" : "Mentorship"} icon={<HeartHandshake className="size-4" />} items={
          isPro
            ? [
                ...mentorship.slice(0, 2).map((m) => ({ label: `${m.mentorName} — ${m.topic}`, value: m.status, tone: m.status === "active" ? "green" : "gold" })),
                ...serviceReqs.map((r) => ({ label: `${r.from} — ${r.serviceTitle}`, value: "New request", tone: "gold" })),
              ].slice(0, 4)
            : mentorship.slice(0, 4).map((m) => ({ label: `${m.mentorName} — ${m.topic}`, value: m.status, tone: m.status === "active" ? "green" : "gold" }))
        } />
      </div>

      {enrolled.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><PlayCircle className="size-4 text-primary" />Learning progress</h2>
          <div className="mt-4 space-y-4">
            {enrolled.slice(0, 3).map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{c.title}</span>
                  <span className="text-muted-foreground">{c.progress ?? 0}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${c.progress ?? 0}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-semibold text-foreground"><Bell className="size-4 text-primary" />Notifications</h2>
        {notifications.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You're all caught up.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                <div><p className="text-sm font-medium text-foreground">{n.title}</p><p className="text-sm text-muted-foreground">{n.body}</p></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card">
        <div>
          <p className="text-sm font-medium text-foreground">Profile visibility</p>
          <p className="text-sm text-muted-foreground capitalize">{visibility.overall === "members" ? "OilSwift Members only" : visibility.overall}</p>
        </div>
        <button onClick={() => goTo("settings")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
          Manage <Eye className="size-4" />
        </button>
      </div>
    </div>
  );
}

/* ---------- HOME: organization ---------- */

function OrgHome({ type, v, comp, goTo }: { type: PathType; v: Values; comp: number; goTo: (id: string) => void }) {
  const category = s(v["category"]);
  const isTrainingProvider = category === "Training provider";
  const isRegulator = category === "Regulator / Agency";
  const analytics = loadAnalytics(type);
  const applicants = loadApplicants(type);
  const jobs = loadJobPostings(type);
  const billing = loadBilling(type);
  const pendingInvoice = billing.find((b) => b.status === "pending");

  return (
    <div className="space-y-6">
      <WelcomeBanner name={s(v["companyName"]) || "Your company"} type="organization" completenessPct={comp} />

      <div className="flex items-center gap-2">
        <Badge tone="gold"><Building2 className="size-3" />{category || "Organization"}</Badge>
        <Badge tone="green"><ShieldCheck className="size-3" />Verification {comp >= 70 ? "under review" : "incomplete"}</Badge>
      </div>

      {isRegulator ? (
        <StatGrid items={[
          { label: "Profile completion", value: `${comp}%`, icon: <Target className="size-5" /> },
          { label: "Compliance records", value: "0", icon: <ShieldCheck className="size-5" /> },
          { label: "Pending reviews", value: "0", icon: <FileText className="size-5" /> },
          { label: "Verified bodies", value: "0", icon: <Check className="size-5" /> },
        ]} />
      ) : (
        <StatGrid items={[
          { label: "Profile views", value: String(analytics.profileViews), icon: <Eye className="size-5" /> },
          { label: "Active postings", value: String(jobs.filter((j) => j.status === "active").length), icon: <Briefcase className="size-5" /> },
          { label: "Applicants", value: String(applicants.length), icon: <FileText className="size-5" /> },
          isTrainingProvider
            ? { label: "Course enrolments", value: String(analytics.enrolments), icon: <Award className="size-5" /> }
            : { label: "Shortlisted", value: String(applicants.filter((a) => a.status === "shortlisted").length), icon: <Check className="size-5" /> },
        ]} />
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {!isRegulator && (
          <QuickLinkCard to="/dashboard/$type" params={{ type }} icon={<Plus className="size-5" />} title="Post an opportunity" text="Reach verified professionals and graduates." />
        )}
        {!isTrainingProvider && !isRegulator && (
          <QuickLinkCard to="/dashboard/$type" params={{ type }} icon={<Search className="size-5" />} title="Search talent" text="Find verified professionals by discipline and experience." />
        )}
        {isTrainingProvider && (
          <QuickLinkCard to="/dashboard/$type" params={{ type }} icon={<Award className="size-5" />} title="Manage courses" text="Upload, publish and track your training courses." />
        )}
        <QuickLinkCard to="/profile/$type" params={{ type }} icon={<Building2 className="size-5" />} title="Company profile" text={`${comp}% complete — keep it updated.`} />
      </div>

      {applicants.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><Users className="size-4 text-primary" />Recent applicants</h2>
          <ul className="mt-3 divide-y divide-border">
            {applicants.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{a.name.charAt(0)}</span>
                  <div><p className="text-sm font-medium text-foreground">{a.name}</p><p className="text-xs text-muted-foreground">{a.role} · {a.yearsExperience}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={a.matchScore >= 85 ? "green" : "gold"}>{a.matchScore}% match</Badge>
                  <Badge tone={a.status === "new" ? "blue" : a.status === "shortlisted" ? "green" : "neutral"}>{a.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pendingInvoice && (
        <div className="flex items-center justify-between rounded-2xl border border-gold/40 bg-gold-soft p-5">
          <div>
            <p className="text-sm font-semibold text-foreground">{pendingInvoice.description} — {pendingInvoice.amount}</p>
            <p className="text-sm text-muted-foreground">Due {pendingInvoice.date}</p>
          </div>
          <button onClick={() => goTo("billing")} className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-sm font-semibold text-ink-foreground">View billing</button>
        </div>
      )}
    </div>
  );
}

/* ---------- TALENT SEARCH (organization) ---------- */

function TalentSearchSection() {
  const [pool, setPool] = useState(() => loadTalentPool());
  const [search, setSearch] = useState("");
  const [disc, setDisc] = useState("");

  const filtered = pool.filter((p) => {
    if (p.visibility === "private") return false; // respect privacy — excluded from discovery
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.role.toLowerCase().includes(search.toLowerCase())) return false;
    if (disc && p.discipline !== disc) return false;
    return true;
  });

  const toggleShortlist = (id: string) => {
    const next = pool.map((p) => (p.id === id ? { ...p, shortlisted: !p.shortlisted } : p));
    setPool(next);
    saveTalentPool(next);
  };

  const disciplines = [...new Set(pool.filter((p) => p.visibility !== "private").map((p) => p.discipline))];

  return (
    <div>
      <PageHeader title="Talent Search" desc="Discover verified professionals. Only profiles the professional has made visible appear here." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or role…" /></div>
        <select value={disc} onChange={(e) => setDisc(e.target.value)} className="field h-10 w-full text-sm sm:w-48">
          <option value="">All disciplines</option>
          {disciplines.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Search className="size-6" />} title="No professionals found" text="Try adjusting your search or filters." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{p.name.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                  <p className="text-xs text-muted-foreground">{p.discipline} · {p.yearsExperience} · {p.location}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge tone={p.visibility === "public" ? "green" : "gold"}>{p.visibility === "public" ? "Public profile" : "Members-only"}</Badge>
                <button onClick={() => toggleShortlist(p.id)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold ${p.shortlisted ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-muted"}`}>
                  {p.shortlisted ? <Check className="size-3.5" /> : <Plus className="size-3.5" />} {p.shortlisted ? "Shortlisted" : "Shortlist"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Private profiles are excluded from discovery results. Contact details are never shown — messaging happens within OilSwift.</p>
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field pl-10" />
    </div>
  );
}

/* ---------- POST OPPORTUNITIES (organization) ---------- */

function PostOpportunitiesSection({ type }: { type: PathType }) {
  const [jobs, setJobs] = useState(() => loadJobPostings(type));
  const [tab, setTab] = useState("active");
  const [showCreate, setShowCreate] = useState(false);
  const [applicants, setApplicants] = useState(() => loadApplicants(type));
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", location: "", type: "Full-time", discipline: "Drilling", description: "" });

  const tabs = [
    { id: "active", label: "Active" },
    { id: "draft", label: "Drafts" },
    { id: "closed", label: "Closed" },
    { id: "applicants", label: "Applicants" },
  ];

  const filtered = jobs.filter((j) => j.status === tab);

  const setStatus = (id: string, status: "active" | "draft" | "closed") => {
    const next = jobs.map((j) => (j.id === id ? { ...j, status } : j));
    setJobs(next);
    saveJobPostings(type, next);
  };

  const create = () => {
    if (!draft.title.trim()) return;
    const next = [
      { id: `job-${Date.now()}`, ...draft, status: "active" as const, applicants: 0, postedAt: "Just now" },
      ...jobs,
    ];
    setJobs(next);
    saveJobPostings(type, next);
    setDraft({ title: "", location: "", type: "Full-time", discipline: "Drilling", description: "" });
    setShowCreate(false);
  };

  const jobApplicants = selectedJob ? applicants.filter((a) => a.role.toLowerCase().includes(selectedJob.toLowerCase().split(" ")[0] ?? "")) : [];

  return (
    <div>
      <PageHeader title="Post Opportunities" desc="Create and manage jobs, internships, contracts and tenders." action={
        <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep">
          <Plus className="size-4" /> Create opportunity
        </button>
      } />
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "applicants" ? (
        applicants.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="No applicants yet" text="Applicants to your postings will appear here." />
        ) : (
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{a.name.charAt(0)}</span>
                  <div>
                    <p className="font-semibold text-foreground">{a.name}</p>
                    <p className="text-sm text-muted-foreground">{a.role} · {a.discipline} · {a.yearsExperience}</p>
                    <p className="text-xs text-muted-foreground">Applied {a.appliedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={a.matchScore >= 85 ? "green" : "gold"}>{a.matchScore}% match</Badge>
                  <select value={a.status} onChange={(e) => {
                    const next = applicants.map((x) => (x.id === a.id ? { ...x, status: e.target.value as typeof a.status } : x));
                    setApplicants(next);
                  }} className="field h-9 w-36 text-sm">
                    {["new", "shortlisted", "interview", "offered", "rejected"].map((s) => <option key={s} value={s}>{s[0]!.toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-6" />} title={`No ${tab} opportunities`} text={tab === "active" ? "Create your first opportunity to start receiving applicants." : `Opportunities in ${tab} status appear here.`} />
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => (
            <div key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-foreground">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.location} · {j.type} · {j.discipline}</p>
                  <p className="mt-2 text-sm text-foreground">{j.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{j.applicants} applicant{j.applicants !== 1 ? "s" : ""} · Posted {j.postedAt}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge tone={j.status === "active" ? "green" : j.status === "draft" ? "gold" : "neutral"}>{j.status}</Badge>
                  <div className="flex gap-2">
                    {j.status === "draft" && <button onClick={() => setStatus(j.id, "active")} className="inline-flex h-8 items-center rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground">Publish</button>}
                    {j.status === "active" && <button onClick={() => setStatus(j.id, "closed")} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted">Close</button>}
                    {j.status === "closed" && <button onClick={() => setStatus(j.id, "active")} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground hover:bg-muted">Reopen</button>}
                    <button onClick={() => { setApplicants((prev) => prev); setSelectedJob(j.title); setTab("applicants"); }} className="inline-flex h-8 items-center rounded-full border border-border px-3 text-xs font-medium text-foreground hover:bg-muted">View applicants</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-background p-6 shadow-lift sm:max-w-lg sm:rounded-3xl">
            <h2 className="font-display text-lg font-semibold text-foreground">Create opportunity</h2>
            <div className="mt-4 space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Senior Drilling Engineer" className="field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Location</label>
                  <input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} placeholder="e.g. Offshore, Lagos" className="field" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
                  <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className="field">
                    {["Full-time", "Contract", "Internship", "Graduate", "Tender", "SIWES / IT"].map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Discipline</label>
                  <select value={draft.discipline} onChange={(e) => setDraft({ ...draft, discipline: e.target.value })} className="field">
                    {["Drilling", "Reservoir", "Production", "Geoscience", "HSE", "Pipeline & Facilities", "Process Engineering", "Instrumentation", "Supply Chain"].map((o) => <option key={o}>{o}</option>)}
                  </select></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe the role, requirements and duration…" className="field h-auto py-3" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={create} className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Publish opportunity</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- ORG COURSES (training provider) ---------- */

function OrgCoursesSection({ type }: { type: PathType }) {
  const [courses, setCourses] = useState(() => loadCourses(type));
  const [tab, setTab] = useState("my");
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ title: "", category: "Drilling", duration: "12 hours", level: "Beginner", price: "", description: "" });

  const tabs = [
    { id: "my", label: "My Courses" },
    { id: "pending", label: "Pending Review" },
    { id: "published", label: "Published" },
    { id: "learners", label: "Learners" },
  ];

  const save = (next: typeof courses) => { setCourses(next); saveCourses(type, next); };

  const create = () => {
    if (!draft.title.trim()) return;
    save([
      { id: `course-${Date.now()}`, title: draft.title, provider: "Your Company", category: draft.category, duration: draft.duration, level: draft.level as "Beginner" | "Intermediate" | "Advanced", rating: 0, enrolled: 0, price: draft.price || "Free", description: draft.description },
      ...courses,
    ]);
    setDraft({ title: "", category: "Drilling", duration: "12 hours", level: "Beginner", price: "", description: "" });
    setShowCreate(false);
  };

  const myTabCourses = tab === "my" ? courses : tab === "published" ? courses.filter((c) => c.enrolled > 0) : [];

  return (
    <div>
      <PageHeader title="Courses" desc="Prepare, publish and manage your training courses." action={
        <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep">
          <Plus className="size-4" /> Create course
        </button>
      } />
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "learners" ? (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold text-foreground">Learner management</h2>
          {courses.filter((c) => c.enrolled > 0).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No enrolments yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {courses.filter((c) => c.enrolled > 0).map((c) => (
                <li key={c.id} className="flex items-center justify-between py-3">
                  <div><p className="text-sm font-medium text-foreground">{c.title}</p><p className="text-xs text-muted-foreground">{c.enrolled} enrolled</p></div>
                  <Badge tone="green">Published</Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : tab === "pending" ? (
        <EmptyState icon={<Clock className="size-6" />} title="No courses pending review" text="Courses you submit for review will appear here. Course review workflow is a product decision still to be finalised." />
      ) : myTabCourses.length === 0 ? (
        <EmptyState icon={<Award className="size-6" />} title="No courses yet" text="Create your first course listing to start teaching on OilSwift." action={<button onClick={() => setShowCreate(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Create course</button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {myTabCourses.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <Badge tone="gold">{c.category}</Badge>
                  <h3 className="mt-2 font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.duration} · {c.level}</p>
                </div>
                <Badge tone={c.enrolled > 0 ? "green" : "neutral"}>{c.enrolled > 0 ? "Published" : "Draft"}</Badge>
              </div>
              <p className="mt-2 text-sm text-foreground">{c.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-foreground">{c.price}</span>
                <span className="text-muted-foreground">{c.enrolled} enrolled · {c.rating > 0 ? `★ ${c.rating}` : "No ratings"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-background p-6 shadow-lift sm:max-w-lg sm:rounded-3xl">
            <h2 className="font-display text-lg font-semibold text-foreground">Create course</h2>
            <div className="mt-4 space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-foreground">Course title</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Advanced Well Control" className="field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
                  <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
                    {["Drilling", "Reservoir", "Production", "HSE", "Pipeline & Facilities", "Process Engineering"].map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Level</label>
                  <select value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} className="field">
                    {["Beginner", "Intermediate", "Advanced"].map((o) => <option key={o}>{o}</option>)}
                  </select></div>
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Duration</label>
                  <input value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: e.target.value })} className="field" /></div>
                <div><label className="mb-1.5 block text-sm font-medium text-foreground">Price (₦)</label>
                  <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="e.g. ₦50,000" className="field" /></div>
              </div>
              <div><label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="What will learners gain?" className="field h-auto py-3" /></div>
            </div>
            <p className="mt-4 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
              Course sales and payments require payment integration. Commission rates are a business decision still to be made.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={create} className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Create course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- ANALYTICS (organization) ---------- */

function AnalyticsSection({ type }: { type: PathType }) {
  const v = loadProfile(type);
  const isTrainingProvider = s(v["category"]) === "Training provider";
  const a = loadAnalytics(type);

  return (
    <div>
      <PageHeader title="Analytics" desc={isTrainingProvider ? "Course and learner performance." : "Recruitment and engagement performance."} />
      {isTrainingProvider ? (
        <div className="space-y-6">
          <StatGrid items={[
            { label: "Course views", value: String(a.courseViews), icon: <Eye className="size-5" /> },
            { label: "Enrolments", value: String(a.enrolments), icon: <Users className="size-5" /> },
            { label: "Course revenue", value: `₦${a.courseRevenue.toLocaleString()}`, icon: <TrendingUp className="size-5" /> },
            { label: "Avg. rating", value: "4.5", icon: <Star className="size-5" /> },
          ]} />
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-semibold text-foreground">Revenue note</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Revenue figures reflect listed course prices and enrolment counts. Actual payouts depend on payment integration, which is not yet connected. Commission rates are a pending business decision.
            </p>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <StatGrid items={[
            { label: "Company profile views", value: String(a.profileViews), icon: <Eye className="size-5" /> },
            { label: "Job posting views", value: String(a.jobViews), icon: <Briefcase className="size-5" /> },
            { label: "Applications received", value: String(a.applications), icon: <FileText className="size-5" /> },
            { label: "Interviews", value: String(a.interviews), icon: <Users className="size-5" /> },
          ]} />
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-semibold text-foreground">Candidate engagement</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: "Profile → application rate", pct: Math.round((a.applications / Math.max(a.jobViews, 1)) * 100) },
                { label: "Shortlist rate", pct: Math.round((a.shortlisted / Math.max(a.applications, 1)) * 100) },
                { label: "Interview rate", pct: Math.round((a.interviews / Math.max(a.applications, 1)) * 100) },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{r.label}</span><span className="font-medium text-foreground">{r.pct}%</span></div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(r.pct, 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/* ---------- BILLING (organization) ---------- */

function BillingSection({ type }: { type: PathType }) {
  const billing = loadBilling(type);
  const v = loadProfile(type);
  const isTrainingProvider = s(v["category"]) === "Training provider";

  return (
    <div>
      <PageHeader title="Billing & Revenue" desc="Your subscription, transactions and revenue." />
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="flex items-center gap-2 font-semibold text-foreground"><Crown className="size-4 text-gold" />Subscription plan</h2>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Pro Plan</p>
              <p className="text-sm text-muted-foreground">₦45,000/month · Next billing 1 Dec 2026</p>
            </div>
            <button className="inline-flex h-9 items-center rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">Manage plan</button>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold text-foreground">Billing history</h2>
          {billing.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {billing.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{b.description}</p>
                    <p className="text-xs text-muted-foreground">{b.date} · {b.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">{b.amount}</span>
                    <Badge tone={b.status === "paid" ? "green" : b.status === "pending" ? "gold" : "red"}>{b.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold text-foreground">{isTrainingProvider ? "Course sales & payouts" : "Recruitment payments"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isTrainingProvider
              ? "Course sales revenue will be recorded here once payment integration is connected. Payout schedules and platform commission rates are pending business decisions."
              : "Recruitment-related payments (featured postings, subscription upgrades) will be recorded here once payment integration is connected."}
          </p>
        </section>
      </div>
    </div>
  );
}

/* ---------- COMPLIANCE (regulator) ---------- */

function ComplianceSection() {
  return (
    <div>
      <PageHeader title="Compliance" desc="Industry oversight, verification and approval workflows." />
      <EmptyState
        icon={<ShieldCheck className="size-6" />}
        title="Compliance workflows coming soon"
        text="Regulatory oversight, compliance records and approval processes require further product definition. This section is a placeholder for that structure."
      />
    </div>
  );
}
