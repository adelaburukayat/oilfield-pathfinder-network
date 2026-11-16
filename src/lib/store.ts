import type { PathType } from "./onboarding";

const LS_PREFIX = "ep-";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${LS_PREFIX}${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export type Visibility = "public" | "members" | "private";

export type ProfileData = Record<string, string | string[]>;

export type Notification = {
  id: string;
  type:
    | "message" | "connection" | "mentorship" | "application" | "applicant"
    | "course" | "service" | "engagement" | "verification" | "system";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
};

export type Opportunity = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Contract" | "Internship" | "Graduate" | "Tender" | "SIWES / IT";
  discipline: string;
  postedAt: string;
  description: string;
  saved: boolean;
  applied?: "submitted" | "review" | "shortlisted" | "interview" | "rejected" | undefined;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "active" | "paused" | "draft";
  requests: number;
};

export type ServiceRequest = {
  id: string;
  serviceTitle: string;
  from: string;
  fromType: string;
  message: string;
  status: "pending" | "accepted" | "declined" | "active" | "completed";
  createdAt: string;
};

export type Connection = {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar?: string;
  status: "connected" | "pending" | "requested";
  mutual: number;
};

export type Mentor = {
  id: string;
  name: string;
  role: string;
  company: string;
  disciplines: string[];
  avatar?: string;
  rating: number;
  mentees: number;
  format: string;
};

export type MentorshipRequest = {
  id: string;
  mentorName: string;
  mentorRole: string;
  topic: string;
  status: "pending" | "accepted" | "declined" | "active" | "completed";
  createdAt: string;
};

export type Course = {
  id: string;
  title: string;
  provider: string;
  category: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  enrolled: number;
  price: string;
  description: string;
  progress?: number;
  status?: "enrolled" | "completed" | undefined;
};

export type JobPosting = {
  id: string;
  title: string;
  location: string;
  type: string;
  discipline: string;
  status: "active" | "draft" | "closed";
  applicants: number;
  postedAt: string;
  description: string;
};

export type Applicant = {
  id: string;
  name: string;
  role: string;
  discipline: string;
  yearsExperience: string;
  avatar?: string;
  status: "new" | "shortlisted" | "interview" | "offered" | "rejected";
  appliedAt: string;
  matchScore: number;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending";
  permissions: "admin" | "editor" | "viewer";
};

export type SavedProfessional = {
  id: string;
  name: string;
  role: string;
  discipline: string;
  yearsExperience: string;
  location: string;
  avatar?: string;
  visibility: Visibility;
  shortlisted: boolean;
};

export type BillingRecord = {
  id: string;
  description: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "failed";
  type: "subscription" | "recruitment" | "course" | "payout";
};

const uid = () => Math.random().toString(36).slice(2, 10);
export { uid };

/* ---------- profile ---------- */

export function loadProfileData(type: PathType): ProfileData {
  try {
    return JSON.parse(localStorage.getItem(`${LS_PREFIX}profile-${type}`) ?? "{}") as ProfileData;
  } catch {
    return {};
  }
}
export function saveProfileData(type: PathType, v: ProfileData) {
  try { localStorage.setItem(`${LS_PREFIX}profile-${type}`, JSON.stringify(v)); } catch { /* ignore */ }
}

/* ---------- visibility ---------- */

const SECTION_KEYS = [
  "about", "disciplines", "experience", "certifications",
  "mentoring", "credentials", "education", "projects", "company",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export type VisibilitySettings = {
  overall: Visibility;
  sections: Partial<Record<SectionKey, Visibility>>;
};

const DEFAULT_VISIBILITY: VisibilitySettings = {
  overall: "members",
  sections: {
    about: "members",
    disciplines: "members",
    experience: "members",
    certifications: "members",
    mentoring: "private",
    credentials: "members",
    education: "members",
    projects: "members",
    company: "public",
  },
};

export function loadVisibility(type: PathType): VisibilitySettings {
  return read(`visibility-${type}`, DEFAULT_VISIBILITY);
}
export function saveVisibility(type: PathType, v: VisibilitySettings) {
  write(`visibility-${type}`, v);
}

export function isSectionVisible(
  overall: Visibility,
  section: Visibility | undefined,
  viewerIsOwner: boolean,
  viewerIsAuthenticated: boolean,
): boolean {
  if (viewerIsOwner) return true;
  const effective = section ?? "members";
  if (overall === "private") return false;
  if (overall === "members" && !viewerIsAuthenticated) return false;
  if (effective === "private") return false;
  if (effective === "members" && !viewerIsAuthenticated) return false;
  return true;
}

/* ---------- notifications ---------- */

export function loadNotifications(type: PathType): Notification[] {
  return read(`notifications-${type}`, seedNotifications(type));
}
export function saveNotifications(type: PathType, n: Notification[]) {
  write(`notifications-${type}`, n);
}

function seedNotifications(type: PathType): Notification[] {
  const base: Notification[] = [
    {
      id: uid(), type: "verification", title: "Verification in progress",
      body: "We're reviewing your submitted documents. This usually takes 2–3 business days.",
      createdAt: "2h ago", read: false,
    },
    {
      id: uid(), type: "system", title: "Welcome to OilSwift",
      body: "Complete your profile to increase your visibility and unlock all features.",
      createdAt: "1d ago", read: true,
    },
  ];
  if (type === "professional") {
    base.unshift({
      id: uid(), type: "mentorship", title: "New mentorship request",
      body: "A student is requesting mentorship on Drilling Engineering.",
      createdAt: "30m ago", read: false,
    });
  }
  if (type === "organization") {
    base.unshift({
      id: uid(), type: "applicant", title: "New applicant",
      body: "A professional applied to your Drilling Supervisor role.",
      createdAt: "1h ago", read: false,
    });
  }
  if (type === "student") {
    base.unshift({
      id: uid(), type: "application", title: "Application under review",
      body: "Your internship application at Chevron is now under review.",
      createdAt: "3h ago", read: false,
    });
  }
  return base;
}

/* ---------- conversations ---------- */

export function loadConversations(type: PathType): Conversation[] {
  return read(`conversations-${type}`, seedConversations(type));
}
export function saveConversations(type: PathType, c: Conversation[]) {
  write(`conversations-${type}`, c);
}

function seedConversations(type: PathType): Conversation[] {
  if (type === "professional") return [
    { id: uid(), name: "Ada Okafor", role: "Student · Petroleum Engineering", lastMessage: "Thank you for the guidance on well completion design.", lastAt: "10m", unread: 2 },
    { id: uid(), name: "Chevron Recruitment", role: "Employer", lastMessage: "We'd like to schedule an interview for the Drilling Supervisor role.", lastAt: "2h", unread: 1 },
    { id: uid(), name: "Nnamdi Eze", role: "Senior Reservoir Engineer · Shell", lastMessage: "Let's connect — I think we have mutual contacts at NPDC.", lastAt: "1d", unread: 0 },
  ];
  if (type === "student") return [
    { id: uid(), name: "Engr. Bola Adeyemi", role: "Mentor · Drilling Manager", lastMessage: "Happy to mentor you. Let's set up our first session.", lastAt: "1h", unread: 1 },
    { id: uid(), name: "TotalEnergies HR", role: "Employer", lastMessage: "Your internship application has been shortlisted.", lastAt: "5h", unread: 0 },
  ];
  return [
    { id: uid(), name: "Tunde Bakare", role: "Professional · Pipeline Engineer", lastMessage: "I'm interested in the Pipeline Supervisor role.", lastAt: "20m", unread: 3 },
    { id: uid(), name: "Sarah Okon", role: "Student · Geology", lastMessage: "Is the internship still open?", lastAt: "3h", unread: 0 },
    { id: uid(), name: "OilSwift Team", role: "Platform", lastMessage: "Your verification documents have been received.", lastAt: "2d", unread: 0 },
  ];
}

export function loadMessages(conversationId: string): Message[] {
  return read(`messages-${conversationId}`, []);
}
export function saveMessages(conversationId: string, m: Message[]) {
  write(`messages-${conversationId}`, m);
}

/* ---------- opportunities ---------- */

export function loadOpportunities(type: PathType): Opportunity[] {
  return read(`opportunities-${type}`, seedOpportunities(type));
}
export function saveOpportunities(type: PathType, o: Opportunity[]) {
  write(`opportunities-${type}`, o);
}

function seedOpportunities(type: PathType): Opportunity[] {
  if (type === "professional") return [
    { id: uid(), title: "Senior Drilling Engineer", company: "Chevron Nigeria", location: "Lagos / Offshore", type: "Full-time", discipline: "Drilling", postedAt: "2d ago", description: "Lead drilling operations for deepwater assets. Requires IWCF certification and 8+ years experience.", saved: false },
    { id: uid(), title: "Reservoir Engineering Consultant", company: "Shell Nigeria", location: "Port Harcourt", type: "Contract", discipline: "Reservoir", postedAt: "4d ago", description: "6-month contract for reservoir modeling and field development planning.", saved: true },
    { id: uid(), title: "HSE Manager", company: "TotalEnergies", location: "Bonny", type: "Full-time", discipline: "HSE", postedAt: "1w ago", description: "Oversee health, safety and environment compliance for LNG operations.", saved: false },
    { id: uid(), title: "Offshore Pipeline Integrity Tender", company: "NNPC", location: "Warri", type: "Tender", discipline: "Pipeline & Facilities", postedAt: "3d ago", description: "Tender for pipeline integrity assessment and rehabilitation services.", saved: false },
  ];
  if (type === "student") return [
    { id: uid(), title: "SIWES Internship — Drilling", company: "Chevron Nigeria", location: "Lagos", type: "SIWES / IT", discipline: "Drilling", postedAt: "1d ago", description: "Industrial training placement for 300–400 level engineering students.", saved: false },
    { id: uid(), title: "Graduate Trainee — Petroleum Engineering", company: "Shell Nigeria", location: "Port Harcourt", type: "Graduate", discipline: "Production", postedAt: "3d ago", description: "12-month graduate trainee programme for fresh graduates.", saved: true },
    { id: uid(), title: "Internship — Geoscience", company: "TotalEnergies", location: "Lagos", type: "Internship", discipline: "Geoscience", postedAt: "5d ago", description: "Summer internship in the geoscience division.", saved: false },
    { id: uid(), title: "Intern — Process Engineering", company: "NLNG", location: "Bonny", type: "Internship", discipline: "Process Engineering", postedAt: "1w ago", description: "Support process optimization at the LNG plant.", saved: false, applied: "review" },
  ];
  return [];
}

/* ---------- job postings (organization) ---------- */

export function loadJobPostings(type: PathType): JobPosting[] {
  return read(`jobs-${type}`, seedJobs(type));
}
export function saveJobPostings(type: PathType, j: JobPosting[]) {
  write(`jobs-${type}`, j);
}

function seedJobs(type: PathType): JobPosting[] {
  if (type !== "organization") return [];
  return [
    { id: uid(), title: "Drilling Supervisor", location: "Offshore, Lagos", type: "Full-time · Rotation", discipline: "Drilling", status: "active", applicants: 12, postedAt: "2d ago", description: "Supervise drilling operations on offshore platform." },
    { id: uid(), title: "Pipeline Integrity Engineer", location: "Warri", type: "Contract", discipline: "Pipeline & Facilities", status: "active", applicants: 7, postedAt: "5d ago", description: "Lead pipeline integrity assessment project." },
    { id: uid(), title: "Graduate Trainee Programme", location: "Port Harcourt", type: "Graduate", discipline: "Production", status: "draft", applicants: 0, postedAt: "—", description: "12-month rotational programme for fresh graduates." },
  ];
}

/* ---------- applicants ---------- */

export function loadApplicants(type: PathType): Applicant[] {
  return read(`applicants-${type}`, type === "organization" ? [
    { id: uid(), name: "Emeka Nwosu", role: "Senior Drilling Engineer", discipline: "Drilling", yearsExperience: "12 years", status: "new", appliedAt: "1h ago", matchScore: 94 },
    { id: uid(), name: "Fatima Bello", role: "Drilling Supervisor", discipline: "Drilling", yearsExperience: "9 years", status: "shortlisted", appliedAt: "5h ago", matchScore: 88 },
    { id: uid(), name: "John Oyelaran", role: "Drilling Engineer", discipline: "Drilling", yearsExperience: "6 years", status: "interview", appliedAt: "1d ago", matchScore: 82 },
    { id: uid(), name: "Aisha Mohammed", role: "Well Engineer", discipline: "Drilling", yearsExperience: "7 years", status: "new", appliedAt: "2d ago", matchScore: 76 },
  ] : []);
}
export function saveApplicants(type: PathType, a: Applicant[]) {
  write(`applicants-${type}`, a);
}

/* ---------- services (professional) ---------- */

export function loadServices(type: PathType): Service[] {
  return read(`services-${type}`, type === "professional" ? [
    { id: uid(), title: "Well Integrity Audit", description: "Independent well integrity assessment and reporting for operators.", category: "Consulting", status: "active", requests: 3 },
    { id: uid(), title: "Drilling Program Review", description: "Technical review of drilling programs prior to execution.", category: "Technical Review", status: "active", requests: 1 },
  ] : []);
}
export function saveServices(type: PathType, s: Service[]) {
  write(`services-${type}`, s);
}

export function loadServiceRequests(type: PathType): ServiceRequest[] {
  return read(`service-requests-${type}`, type === "professional" ? [
    { id: uid(), serviceTitle: "Well Integrity Audit", from: "Aiteo E&P", fromType: "Organization", message: "We need a well integrity audit for 3 producing wells.", status: "pending", createdAt: "1d ago" },
    { id: uid(), serviceTitle: "Drilling Program Review", from: "Seplat Energy", fromType: "Organization", message: "Please review our upcoming drilling program for Well X-12.", status: "active", createdAt: "3d ago" },
  ] : []);
}
export function saveServiceRequests(type: PathType, r: ServiceRequest[]) {
  write(`service-requests-${type}`, r);
}

/* ---------- connections (professional) ---------- */

export function loadConnections(type: PathType): Connection[] {
  return read(`connections-${type}`, type === "professional" ? [
    { id: uid(), name: "Nnamdi Eze", role: "Senior Reservoir Engineer", company: "Shell", status: "connected", mutual: 8 },
    { id: uid(), name: "Bola Adeyemi", role: "Drilling Manager", company: "Chevron", status: "connected", mutual: 5 },
    { id: uid(), name: "Grace Obi", role: "HSE Lead", company: "TotalEnergies", status: "pending", mutual: 2 },
    { id: uid(), name: "Ibrahim Sani", role: "Pipeline Engineer", company: "NNPC", status: "requested", mutual: 0 },
  ] : []);
}
export function saveConnections(type: PathType, c: Connection[]) {
  write(`connections-${type}`, c);
}

/* ---------- mentors ---------- */

export function loadMentors(): Mentor[] {
  return read<Mentor[]>("mentors", [
    { id: uid(), name: "Engr. Bola Adeyemi", role: "Drilling Manager", company: "Chevron", disciplines: ["Drilling", "Well Completion"], rating: 4.9, mentees: 12, format: "Both" },
    { id: uid(), name: "Dr. Ngozi Eze", role: "Reservoir Engineering Lead", company: "Shell", disciplines: ["Reservoir", "Petrophysics"], rating: 5.0, mentees: 8, format: "Virtual" },
    { id: uid(), name: "Engr. Tunde Bakare", role: "Pipeline Integrity Specialist", company: "NNPC", disciplines: ["Pipeline & Facilities"], rating: 4.7, mentees: 6, format: "In person" },
    { id: uid(), name: "Mrs. Aisha Yusuf", role: "HSE Director", company: "TotalEnergies", disciplines: ["HSE"], rating: 4.8, mentees: 15, format: "Both" },
  ]);
}

/* ---------- mentorship requests ---------- */

export function loadMentorshipRequests(type: PathType): MentorshipRequest[] {
  return read(`mentorship-requests-${type}`, type === "professional" ? [
    { id: uid(), mentorName: "Ada Okafor", mentorRole: "Student · Petroleum Engineering", topic: "Drilling Engineering", status: "pending", createdAt: "30m ago" },
    { id: uid(), mentorName: "Chidi Nnamdi", mentorRole: "Student · Geology", topic: "Career guidance", status: "active", createdAt: "1w ago" },
  ] : type === "student" ? [
    { id: uid(), mentorName: "Engr. Bola Adeyemi", mentorRole: "Drilling Manager · Chevron", topic: "Drilling Engineering", status: "pending", createdAt: "2d ago" },
  ] : []);
}
export function saveMentorshipRequests(type: PathType, r: MentorshipRequest[]) {
  write(`mentorship-requests-${type}`, r);
}

/* ---------- courses ---------- */

export function loadCourses(type: PathType): Course[] {
  return read(`courses-${type}`, seedCourses(type));
}
export function saveCourses(type: PathType, c: Course[]) {
  write(`courses-${type}`, c);
}

function seedCourses(type: PathType): Course[] {
  if (type === "organization") return [
    { id: uid(), title: "Advanced Well Control", provider: "Your Company", category: "Drilling", duration: "40 hours", level: "Advanced", rating: 0, enrolled: 0, price: "₦150,000", description: "Comprehensive well control training certified by IWCF.", status: undefined },
    { id: uid(), title: "HSE Fundamentals", provider: "Your Company", category: "HSE", duration: "16 hours", level: "Beginner", rating: 4.5, enrolled: 42, price: "₦45,000", description: "Foundational health, safety and environment training.", status: undefined },
  ];
  return [
    { id: uid(), title: "Introduction to Drilling", provider: "Petroleum Training Institute", category: "Drilling", duration: "12 hours", level: "Beginner", rating: 4.6, enrolled: 320, price: "₦25,000", description: "Learn the fundamentals of drilling operations.", progress: 65, status: "enrolled" },
    { id: uid(), title: "Well Control Fundamentals", provider: "IWCF Nigeria", category: "Drilling", duration: "24 hours", level: "Intermediate", rating: 4.8, enrolled: 180, price: "₦60,000", description: "IWCF-certified well control training.", status: undefined },
    { id: uid(), title: "Reservoir Engineering Basics", provider: "SPE Nigeria", category: "Reservoir", duration: "20 hours", level: "Beginner", rating: 4.4, enrolled: 240, price: "₦35,000", description: "Introduction to reservoir characterization and modeling.", progress: 100, status: "completed" },
    { id: uid(), title: "Pipeline Integrity Management", provider: "Nigerian Gas Association", category: "Pipeline & Facilities", duration: "18 hours", level: "Intermediate", rating: 4.7, enrolled: 95, price: "₦50,000", description: "Pipeline inspection, maintenance and integrity.", status: undefined },
  ];
}

/* ---------- talent search (organization) ---------- */

export function loadTalentPool(): SavedProfessional[] {
  return read<SavedProfessional[]>("talent-pool", [
    { id: uid(), name: "Emeka Nwosu", role: "Senior Drilling Engineer", discipline: "Drilling", yearsExperience: "12 years", location: "Lagos", visibility: "members", shortlisted: false },
    { id: uid(), name: "Fatima Bello", role: "Reservoir Engineer", discipline: "Reservoir", yearsExperience: "9 years", location: "Port Harcourt", visibility: "members", shortlisted: true },
    { id: uid(), name: "John Oyelaran", role: "Pipeline Supervisor", discipline: "Pipeline & Facilities", yearsExperience: "6 years", location: "Warri", visibility: "public", shortlisted: false },
    { id: uid(), name: "Aisha Mohammed", role: "HSE Specialist", discipline: "HSE", yearsExperience: "7 years", location: "Abuja", visibility: "members", shortlisted: false },
    { id: uid(), name: "David Okafor", role: "Process Engineer", discipline: "Process Engineering", yearsExperience: "10 years", location: "Lagos", visibility: "public", shortlisted: false },
    { id: uid(), name: "Mary Ete", role: "Geoscientist", discipline: "Geoscience", yearsExperience: "5 years", location: "Calabar", visibility: "private", shortlisted: false },
  ]);
}
export function saveTalentPool(t: SavedProfessional[]) {
  write("talent-pool", t);
}

/* ---------- team members (organization) ---------- */

export function loadTeam(type: PathType): TeamMember[] {
  return read(`team-${type}`, type === "organization" ? [
    { id: uid(), name: "Your Name", email: "admin@yourcompany.com", role: "Account Admin", status: "active", permissions: "admin" },
    { id: uid(), name: "Jane Doe", email: "jane@yourcompany.com", role: "HR Manager", status: "pending", permissions: "editor" },
  ] : []);
}
export function saveTeam(type: PathType, t: TeamMember[]) {
  write(`team-${type}`, t);
}

/* ---------- billing (organization) ---------- */

export function loadBilling(type: PathType): BillingRecord[] {
  return read(`billing-${type}`, type === "organization" ? [
    { id: uid(), description: "Pro Plan — Monthly", amount: "₦45,000", date: "1 Nov 2026", status: "paid", type: "subscription" },
    { id: uid(), description: "Featured Job Posting ×3", amount: "₦30,000", date: "28 Oct 2026", status: "paid", type: "recruitment" },
    { id: uid(), description: "Pro Plan — Monthly", amount: "₦45,000", date: "1 Dec 2026", status: "pending", type: "subscription" },
  ] : []);
}
export function saveBilling(type: PathType, b: BillingRecord[]) {
  write(`billing-${type}`, b);
}

/* ---------- analytics (organization) ---------- */

export function loadAnalytics(type: PathType): Record<string, number> {
  return read(`analytics-${type}`, {
    profileViews: 248,
    jobViews: 1240,
    applications: 19,
    shortlisted: 4,
    interviews: 2,
    courseViews: type === "organization" ? 560 : 0,
    enrolments: type === "organization" ? 42 : 0,
    courseRevenue: type === "organization" ? 630000 : 0,
  });
}
