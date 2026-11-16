import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search, Bookmark, MapPin, Briefcase, Calendar, ChevronRight, Heart, Star,
  Check, X, Plus, Send, Trash2, Eye, Clock, Award, TrendingUp, Users, FileText,
  PlayCircle, BookOpen, Pencil, MessageSquare, Target,
} from "lucide-react";
import type { ReactNode } from "react";
import type { PathType } from "@/lib/onboarding";
import {
  loadOpportunities, saveOpportunities, loadCourses, saveCourses,
  loadConnections, saveConnections, loadMentors, loadMentorshipRequests, saveMentorshipRequests,
  loadServices, saveServices, loadServiceRequests, saveServiceRequests,
  loadNotifications, saveNotifications, uid,
  type Opportunity, type Course, type Connection, type Mentor, type MentorshipRequest,
  type Service, type ServiceRequest, type Notification,
} from "@/lib/store";
import { Badge, EmptyState } from "@/lib/auth";

/* ---------- shared building blocks ---------- */

export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatGrid({ items }: { items: { label: string; value: string; icon: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((t) => (
        <div key={t.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <span className="text-primary">{t.icon}</span>
          <p className="mt-3 font-display text-2xl font-semibold text-foreground">{t.value}</p>
          <p className="text-sm text-muted-foreground">{t.label}</p>
        </div>
      ))}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field pl-10" />
    </div>
  );
}

function DiscFilter({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="field h-10 w-full text-sm sm:w-48">
      <option value="">All disciplines</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

const DISCIPLINES = ["Drilling", "Reservoir", "Production", "Geoscience", "HSE", "Pipeline & Facilities", "Process Engineering", "Instrumentation", "Supply Chain"];

/* ---------- opportunities ---------- */

export function OpportunitiesSection({ type }: { type: PathType }) {
  const [tab, setTab] = useState<string>("browse");
  const [items, setItems] = useState<Opportunity[]>(() => loadOpportunities(type));
  const [search, setSearch] = useState("");
  const [disc, setDisc] = useState("");
  const [selected, setSelected] = useState<Opportunity | null>(null);

  const tabs = [
    { id: "browse", label: "Browse" },
    { id: "saved", label: "Saved" },
    { id: "applied", label: "My Applications" },
  ];

  const filtered = items.filter((o) => {
    if (tab === "saved" && !o.saved) return false;
    if (tab === "applied" && !o.applied) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (disc && o.discipline !== disc) return false;
    return true;
  });

  const toggleSave = (id: string) => {
    const next = items.map((o) => (o.id === id ? { ...o, saved: !o.saved } : o));
    setItems(next);
    saveOpportunities(type, next);
  };

  const apply = (id: string) => {
    const next = items.map((o) => (o.id === id ? { ...o, applied: "submitted" as const } : o));
    setItems(next);
    saveOpportunities(type, next);
    setSelected((s) => (s && s.id === id ? { ...s, applied: "submitted" } : s));
  };

  const statusLabel: Record<string, { label: string; tone: "neutral" | "green" | "gold" | "blue" }> = {
    submitted: { label: "Submitted", tone: "blue" },
    review: { label: "Under Review", tone: "gold" },
    shortlisted: { label: "Shortlisted", tone: "green" },
    interview: { label: "Interview", tone: "green" },
    rejected: { label: "Rejected", tone: "neutral" },
  };

  return (
    <div>
      <PageHeader title="Opportunities" desc="Browse jobs, contracts and tenders in the Nigerian oil and gas industry." />
      <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Search opportunities…" /></div>
        <DiscFilter value={disc} onChange={setDisc} options={DISCIPLINES} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-6" />} title="No opportunities found" text={tab === "saved" ? "Save opportunities to find them here later." : tab === "applied" ? "Your applications will appear here." : "Try adjusting your search or filters."} />
      ) : (
        <div className="grid gap-4">
          {filtered.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{o.title}</h3>
                    {o.applied && <Badge tone={statusLabel[o.applied]?.tone ?? "neutral"}>{statusLabel[o.applied]?.label}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{o.company}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{o.location}</span>
                    <span className="inline-flex items-center gap-1"><Briefcase className="size-3.5" />{o.type}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="size-3.5" />{o.postedAt}</span>
                  </div>
                  <p className="mt-3 text-sm text-foreground">{o.description}</p>
                </div>
                <button onClick={() => toggleSave(o.id)} className={`shrink-0 rounded-lg p-2 transition-colors ${o.saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <Bookmark className={`size-5 ${o.saved ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button onClick={() => setSelected(o)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                  <Eye className="size-4" /> View details
                </button>
                {!o.applied ? (
                  <button onClick={() => apply(o.id)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
                    <Send className="size-4" /> Apply
                  </button>
                ) : (
                  <Badge tone={statusLabel[o.applied]?.tone ?? "neutral"}>Applied · {statusLabel[o.applied]?.label}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {selected && (
        <OppDetailModal opp={selected} onClose={() => setSelected(null)} onApply={() => apply(selected.id)} />
      )}
    </div>
  );
}

function OppDetailModal({ opp, onClose, onApply }: { opp: Opportunity; onClose: () => void; onApply: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-background p-6 shadow-lift sm:max-w-lg sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">{opp.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{opp.company}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted"><X className="size-5" /></button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="green">{opp.type}</Badge>
          <Badge>{opp.discipline}</Badge>
          <Badge><MapPin className="size-3" />{opp.location}</Badge>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground">{opp.description}</p>
        <div className="mt-4 space-y-2 rounded-xl bg-muted/50 p-4 text-sm">
          <p className="text-muted-foreground"><Calendar className="mr-2 inline size-4" />Posted {opp.postedAt}</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-muted">Close</button>
          {!opp.applied && (
            <button onClick={() => { onApply(); }} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
              <Send className="size-4" /> Apply now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- network ---------- */

export function NetworkSection({ type }: { type: PathType }) {
  const [tab, setTab] = useState<string>("discover");
  const [connections, setConnections] = useState<Connection[]>(() => loadConnections(type));
  const [mentors] = useState<Mentor[]>(() => loadMentors());
  const [requests, setRequests] = useState<MentorshipRequest[]>(() => loadMentorshipRequests(type));
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "discover", label: "Discover Professionals" },
    { id: "connections", label: "My Connections" },
    { id: "requests", label: "Connection Requests" },
    { id: "mentorship", label: "Mentorship" },
  ];

  const actOnConnection = (id: string, status: Connection["status"]) => {
    const next = connections.map((c) => (c.id === id ? { ...c, status } : c));
    setConnections(next);
    saveConnections(type, next);
  };

  const actOnMentorship = (id: string, status: MentorshipRequest["status"]) => {
    const next = requests.map((r) => (r.id === id ? { ...r, status } : r));
    setRequests(next);
    saveMentorshipRequests(type, next);
  };

  const discover = connections.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const connected = connections.filter((c) => c.status === "connected");
  const pending = connections.filter((c) => c.status === "pending");
  const myMentorships = requests;

  return (
    <div>
      <PageHeader title="Network" desc="Discover professionals, manage connections and mentorship." />
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "discover" && (
        <>
          <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search professionals…" /></div>
          {discover.length === 0 ? (
            <EmptyState icon={<Users className="size-6" />} title="No professionals found" text="Try a different search term." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {discover.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{c.name.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.role}</p>
                      <p className="text-xs text-muted-foreground">{c.company} · {c.mutual} mutual</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    {c.status === "connected" ? (
                      <Badge tone="green"><Check className="size-3" /> Connected</Badge>
                    ) : c.status === "pending" ? (
                      <Badge tone="gold">Pending</Badge>
                    ) : (
                      <button onClick={() => actOnConnection(c.id, "pending")} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">
                        <UserPlus2 /> Connect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "connections" && (
        connected.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="No connections yet" text="Discover professionals and send connection requests." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {connected.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{c.name.charAt(0)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.role} · {c.company}</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-foreground hover:bg-muted"><MessageSquare className="size-3.5" /> Message</button>
                  <Badge tone="green"><Check className="size-3" /> Connected</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "requests" && (
        pending.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="No pending requests" text="Connection requests you receive will appear here." />
        ) : (
          <div className="grid gap-4">
            {pending.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{c.name.charAt(0)}</span>
                  <div>
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.role} · {c.company}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => actOnConnection(c.id, "connected")} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"><Check className="size-4" /> Accept</button>
                  <button onClick={() => actOnConnection(c.id, "requested")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground hover:bg-muted"><X className="size-4" /> Decline</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "mentorship" && (
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold text-foreground">Find a mentor</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {mentors.map((m) => (
                <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{m.name.charAt(0)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{m.name}</p>
                      <p className="text-sm text-muted-foreground">{m.role} · {m.company}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3.5 fill-gold text-gold" /> {m.rating} · {m.mentees} mentees · {m.format}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.disciplines.map((d) => <Badge key={d} tone="green">{d}</Badge>)}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button onClick={() => setRequests((r) => [{ id: uid(), mentorName: m.name, mentorRole: `${m.role} · ${m.company}`, topic: m.disciplines[0] ?? "General", status: "pending", createdAt: "now" }, ...r])}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">
                      Request mentorship
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-foreground">{type === "professional" ? "Mentorship requests" : "My mentorship requests"}</h3>
            {myMentorships.length === 0 ? (
              <EmptyState icon={<Heart className="size-6" />} title="No mentorship requests" text="Your mentorship activity will appear here." />
            ) : (
              <div className="grid gap-4">
                {myMentorships.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{type === "professional" ? r.mentorName : r.mentorName}</p>
                        <p className="text-sm text-muted-foreground">{r.mentorRole}</p>
                        <p className="mt-1 text-sm text-foreground">Topic: {r.topic}</p>
                        <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {r.status === "pending" ? (
                          type === "professional" ? (
                            <div className="flex gap-2">
                              <button onClick={() => actOnMentorship(r.id, "accepted")} className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">Accept</button>
                              <button onClick={() => actOnMentorship(r.id, "declined")} className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted">Decline</button>
                            </div>
                          ) : <Badge tone="gold">Pending</Badge>
                        ) : r.status === "accepted" || r.status === "active" ? <Badge tone="green">Active</Badge>
                          : r.status === "declined" ? <Badge>Declined</Badge>
                          : <Badge tone="green">Completed</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserPlus2() { return <Plus className="size-3.5" />; }

/* ---------- learning ---------- */

export function LearningSection({ type }: { type: PathType }) {
  const [tab, setTab] = useState<string>("browse");
  const [courses, setCourses] = useState<Course[]>(() => loadCourses(type));
  const [search, setSearch] = useState("");

  const tabs = [
    { id: "browse", label: "Browse Courses" },
    { id: "enrolled", label: "My Learning" },
    { id: "completed", label: "Completed" },
    ...(type === "student" ? [{ id: "scholarships", label: "Scholarships" }] : []),
  ];

  const filtered = courses.filter((c) => {
    if (tab === "enrolled" && c.status !== "enrolled") return false;
    if (tab === "completed" && c.status !== "completed") return false;
    if (tab === "browse" && c.status) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const enroll = (id: string) => {
    const next = courses.map((c) => (c.id === id ? { ...c, status: "enrolled" as const, progress: 0 } : c));
    setCourses(next);
    saveCourses(type, next);
  };

  return (
    <div>
      <PageHeader title="Learning" desc="Discover courses, track your progress and earn certificates." />
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${tab === t.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "scholarships" ? (
        <EmptyState icon={<Award className="size-6" />} title="Scholarships coming soon" text="OilSwift is partnering with industry bodies to offer scholarships. Check back for updates." />
      ) : (
        <>
          <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search courses…" /></div>
          {filtered.length === 0 ? (
            <EmptyState icon={<BookOpen className="size-6" />} title="No courses found" text={tab === "enrolled" ? "Enroll in courses to track them here." : tab === "completed" ? "Your completed courses will appear here." : "Try a different search."} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filtered.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge tone="gold">{c.category}</Badge>
                      <h3 className="mt-2 font-semibold text-foreground">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.provider}</p>
                    </div>
                    <Badge>{c.level}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-foreground">{c.description}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{c.duration}</span>
                    <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-gold text-gold" />{c.rating}</span>
                    <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{c.enrolled}</span>
                  </div>
                  {c.status === "enrolled" && typeof c.progress === "number" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span><span>{c.progress}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${c.progress}%` }} /></div>
                    </div>
                  )}
                  {c.status === "completed" && (
                    <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary"><Award className="size-4" /> Certificate earned</div>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-semibold text-foreground">{c.price}</span>
                    {!c.status ? (
                      <button onClick={() => enroll(c.id)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">
                        <Plus className="size-4" /> Enroll
                      </button>
                    ) : c.status === "enrolled" ? (
                      <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                        <PlayCircle className="size-4" /> Continue
                      </button>
                    ) : (
                      <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-foreground hover:bg-muted">
                        <FileText className="size-4" /> View certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- services (professional) ---------- */

export function ServicesSection({ type }: { type: PathType }) {
  const [tab, setTab] = useState<string>("list");
  const [services, setServices] = useState<Service[]>(() => loadServices(type));
  const [requests, setRequests] = useState<ServiceRequest[]>(() => loadServiceRequests(type));
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({ title: "", description: "", category: "Consulting" });

  const tabs = [
    { id: "list", label: "My Services" },
    { id: "requests", label: "Service Requests" },
    { id: "active", label: "Active Engagements" },
    { id: "completed", label: "Completed" },
  ];

  const createService = () => {
    if (!draft.title.trim()) return;
    const next = [...services, { id: uid(), title: draft.title, description: draft.description, category: draft.category, status: "active" as const, requests: 0 }];
    setServices(next);
    saveServices(type, next);
    setDraft({ title: "", description: "", category: "Consulting" });
    setShowCreate(false);
  };

  const actOnRequest = (id: string, status: ServiceRequest["status"]) => {
    const next = requests.map((r) => (r.id === id ? { ...r, status } : r));
    setRequests(next);
    saveServiceRequests(type, next);
  };

  const filteredReqs = requests.filter((r) => {
    if (tab === "requests") return r.status === "pending";
    if (tab === "active") return r.status === "active" || r.status === "accepted";
    if (tab === "completed") return r.status === "completed";
    return false;
  });

  return (
    <div>
      <PageHeader title="Services" desc="Offer your professional services and manage engagement requests." action={
        <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lift hover:bg-primary-deep">
          <Plus className="size-4" /> Add service
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

      {tab === "list" && (
        services.length === 0 ? (
          <EmptyState icon={<Briefcase className="size-6" />} title="No services yet" text="Create a service listing to start receiving requests." action={<button onClick={() => setShowCreate(true)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Add service</button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge tone="gold">{s.category}</Badge>
                    <h3 className="mt-2 font-semibold text-foreground">{s.title}</h3>
                  </div>
                  <Badge tone={s.status === "active" ? "green" : s.status === "paused" ? "gold" : "neutral"}>{s.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-foreground">{s.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{s.requests} request{s.requests !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {(tab === "requests" || tab === "active" || tab === "completed") && (
        filteredReqs.length === 0 ? (
          <EmptyState icon={<MessageSquare className="size-6" />} title="Nothing here yet" text={tab === "requests" ? "New service requests will appear here." : tab === "active" ? "Active engagements will appear here." : "Completed engagements will appear here."} />
        ) : (
          <div className="grid gap-4">
            {filteredReqs.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{r.serviceTitle}</p>
                    <p className="text-sm text-muted-foreground">From {r.from} · {r.fromType}</p>
                    <p className="mt-2 text-sm text-foreground">{r.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{r.createdAt}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => actOnRequest(r.id, "accepted")} className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary-deep">Accept</button>
                        <button onClick={() => actOnRequest(r.id, "declined")} className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground hover:bg-muted">Decline</button>
                      </div>
                    )}
                    {r.status === "accepted" && <Badge tone="green">Accepted</Badge>}
                    {r.status === "active" && <Badge tone="blue">Active</Badge>}
                    {r.status === "completed" && <Badge tone="green">Completed</Badge>}
                    {r.status === "declined" && <Badge>Declined</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-background p-6 shadow-lift sm:rounded-3xl">
            <h2 className="font-display text-lg font-semibold text-foreground">Create service</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Service title</label>
                <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Well Integrity Audit" className="field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Category</label>
                <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="field">
                  {["Consulting", "Technical Review", "Training", "Audit", "Advisory"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                <textarea rows={3} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe what you offer…" className="field h-auto py-3" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="h-10 rounded-full px-5 text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={createService} className="h-10 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Create service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- home/overview widgets ---------- */

export function WelcomeBanner({ name, type, completenessPct }: { name: string; type: PathType; completenessPct: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink p-8 text-ink-foreground md:p-10">
      <div className="absolute -right-16 -top-20 size-72 rounded-full bg-primary/40 blur-3xl" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{type} dashboard</p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Welcome, {name}</h1>
          <p className="mt-2 text-ink-foreground/70">Here's what's happening with your account today.</p>
        </div>
        {completenessPct < 100 && (
          <div className="rounded-2xl bg-ink-foreground/10 p-4 ring-1 ring-ink-foreground/15">
            <p className="text-xs text-ink-foreground/70">Profile completion</p>
            <p className="font-display text-2xl font-semibold text-gold">{completenessPct}%</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function QuickLinkCard({ title, text, icon, to }: { title: string; text: string; icon: ReactNode; to: string }) {
  return (
    <Link to={to as any} className="block rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <span className="grid size-10 place-items-center rounded-xl bg-gold-soft text-gold">{icon}</span>
      <p className="mt-3 font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </Link>
  );
}

export function ActivityCard({ title, items, icon }: { title: string; items: { label: string; value: string; tone?: "neutral" | "green" | "gold" }[]; icon: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-semibold text-foreground"><span className="text-primary">{icon}</span>{title}</h2>
      <ul className="mt-3 space-y-2">
        {items.map((i, idx) => (
          <li key={idx} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{i.label}</span>
            <Badge tone={i.tone ?? "neutral"}>{i.value}</Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}
