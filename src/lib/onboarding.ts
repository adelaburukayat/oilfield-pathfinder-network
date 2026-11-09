import { Briefcase, GraduationCap, Building2, type LucideIcon } from "lucide-react";
import professionalImg from "@/assets/path-professional.jpg";
import studentImg from "@/assets/path-student.jpg";
import organizationImg from "@/assets/path-organization.jpg";

export type PathType = "professional" | "student" | "organization";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "number" | "select" | "textarea" | "chips" | "streams" | "file" | "image" | "files";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  half?: boolean;
  hint?: string;
};

export type Step = { id: string; title: string; description: string; fields: Field[] };

export type PathConfig = {
  type: PathType;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  image: string;
  perks: string[];
  steps: Step[];
};

const disciplines = [
  "Drilling", "Reservoir", "Production", "Petroleum Engineering", "Geoscience",
  "HSE", "Pipeline & Facilities", "Process Engineering", "Instrumentation", "Supply Chain",
];
export const STREAMS: Record<string, string[]> = {
  Upstream: ["Drilling", "Reservoir Engineering", "Production Engineering", "Geology & Geophysics", "Well Completion", "Well Intervention", "Petrophysics", "Subsea Engineering", "Rig Operations"],
  Midstream: ["Pipeline Engineering", "Gas Processing", "Storage & Terminals", "LNG Operations", "Transportation & Logistics", "Pipeline Integrity", "Compression Stations", "Metering & Custody Transfer"],
  Downstream: ["Refining", "Process Engineering", "Petrochemicals", "Retail & Marketing", "Distribution", "Quality Control & Lab", "Product Trading", "Depot Operations"],
};
const countries = ["Nigeria", "Ghana", "Angola", "United Kingdom", "United States", "UAE", "Norway", "Other"];

export const PATHS: Record<PathType, PathConfig> = {
  professional: {
    type: "professional",
    label: "Professional",
    tagline: "For experienced industry talent",
    description: "Build a verified record of your experience, certifications and field competencies.",
    icon: Briefcase,
    image: professionalImg,
    perks: ["Verified work history", "Certification vault", "Visible to operators"],
    steps: [
      {
        id: "career", title: "Career profile", description: "Tell us where you work and what you do.",
        fields: [
          { name: "phone", label: "Phone number", type: "tel", placeholder: "+234 800 000 0000", required: true, half: true },
          { name: "country", label: "Country of residence", type: "select", options: countries, required: true, half: true },
          { name: "jobTitle", label: "Current job title", type: "text", placeholder: "e.g. Senior Drilling Engineer", required: true },
          { name: "employer", label: "Current employer", type: "text", half: true },
          { name: "years", label: "Years of experience", type: "select", options: ["0–2", "3–5", "6–10", "11–15", "15+"], required: true, half: true },
          { name: "disciplines", label: "Sector & roles", type: "streams", required: true, hint: "Pick a stream, then choose your roles" },
          { name: "environment", label: "Work environment", type: "chips", options: ["Onshore", "Offshore", "Deepwater", "Office-based"] },
        ],
      },
      {
        id: "credentials", title: "Credentials", description: "List the certifications and licences you hold.",
        fields: [
          { name: "certs", label: "Certifications", type: "chips", options: ["BOSIET", "HUET", "IWCF", "IADC WellSharp", "NEBOSH", "OPITO", "PMP", "COREN"] },
          { name: "license", label: "Professional licence number", type: "text", placeholder: "Optional", half: true },
          { name: "linkedin", label: "LinkedIn profile", type: "text", placeholder: "linkedin.com/in/…", half: true },
          { name: "cv", label: "Upload CV", type: "file", hint: "PDF or DOCX, up to 10MB" },
        ],
      },
      {
        id: "verification", title: "Verification", description: "Upload your photo, NIN and certificates so we can verify you.",
        fields: [
          { name: "avatar", label: "Profile photo", type: "image", required: true, hint: "A clear photo of your face" },
          { name: "nin", label: "NIN (National Identification Number)", type: "text", placeholder: "11-digit NIN", required: true, half: true },
          { name: "ninSlip", label: "NIN slip or card", type: "file", required: true, hint: "PDF, JPG or PNG" },
          { name: "certFiles", label: "Certificates", type: "files", required: true, hint: "Upload every certificate you hold" },
        ],
      },
      {
        id: "mentoring", title: "Mentoring", description: "Would you like to share your experience with others?",
        fields: [
          { name: "mentoring", label: "I'm open to", type: "chips", options: ["Mentoring students & interns", "Mentoring organization staff"], hint: "Optional" },
          { name: "mentorAreas", label: "Topics I can mentor on", type: "chips", options: disciplines },
          { name: "mentorTime", label: "Time I can give", type: "select", options: ["1 hour a month", "2–4 hours a month", "Weekly sessions"], half: true },
          { name: "mentorFormat", label: "Preferred format", type: "select", options: ["Virtual", "In person", "Both"], half: true },
        ],
      },
    ],
  },
  student: {
    type: "student",
    label: "Intern / Student",
    tagline: "For students and graduates",
    description: "Showcase your studies, skills and placements as you start your career in energy.",
    icon: GraduationCap,
    image: studentImg,
    perks: ["Internship matching", "Skills tracking", "Mentor access"],
    steps: [
      {
        id: "education", title: "Education", description: "Where are you studying, and what?",
        fields: [
          { name: "phone", label: "Phone number", type: "tel", placeholder: "+234 800 000 0000", required: true, half: true },
          { name: "country", label: "Country", type: "select", options: countries, required: true, half: true },
          { name: "institution", label: "Institution", type: "text", placeholder: "e.g. University of Port Harcourt", required: true },
          { name: "course", label: "Course of study", type: "text", placeholder: "e.g. Petroleum Engineering", required: true, half: true },
          { name: "level", label: "Current level", type: "select", options: ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "Graduate", "Postgraduate"], required: true, half: true },
          { name: "matric", label: "Matric / Student ID", type: "text", half: true },
          { name: "gradYear", label: "Expected graduation", type: "select", options: ["2026", "2027", "2028", "2029", "2030"], half: true },
        ],
      },
      {
        id: "goals", title: "Interests & goals", description: "Help us match you with the right opportunities.",
        fields: [
          { name: "interests", label: "Areas of interest", type: "streams", required: true, hint: "Pick a stream, then choose the roles you want to explore" },
          { name: "type", label: "Looking for", type: "chips", options: ["SIWES / IT", "Internship", "Graduate trainee", "Mentorship"] },
          { name: "availability", label: "Available from", type: "date", half: true },
          { name: "duration", label: "Preferred duration", type: "select", options: ["3 months", "6 months", "12 months"], half: true },
          { name: "avatar", label: "Profile photo", type: "image", required: true, hint: "A clear photo of your face" },
          { name: "letter", label: "Student ID or introduction letter", type: "file", hint: "PDF, JPG or PNG" },
        ],
      },
    ],
  },
  organization: {
    type: "organization",
    label: "Organization",
    tagline: "For operators and service companies",
    description: "Register your company to verify talent, manage teams and post opportunities.",
    icon: Building2,
    image: organizationImg,
    perks: ["Verify workforce", "Team profiles", "Talent pipeline"],
    steps: [
      {
        id: "company", title: "Company details", description: "Your legal entity information.",
        fields: [
          { name: "avatar", label: "Company logo", type: "image", required: true, hint: "Square PNG or JPG works best" },
          { name: "companyName", label: "Registered company name", type: "text", required: true },
          { name: "rc", label: "RC / Registration number", type: "text", placeholder: "RC 1234567", required: true, half: true },
          { name: "founded", label: "Year founded", type: "number", placeholder: "2010", half: true },
          { name: "category", label: "Company category", type: "select", options: ["IOC", "Indigenous operator", "Marginal field operator", "Oilfield services", "EPC contractor", "Regulator / Agency", "Training provider"], required: true, half: true },
          { name: "size", label: "Company size", type: "select", options: ["1–10", "11–50", "51–200", "201–1,000", "1,000+"], required: true, half: true },
        ],
      },
      {
        id: "operations", title: "Operations", description: "Where and how you operate.",
        fields: [
          { name: "segments", label: "Sectors & services", type: "streams", required: true, hint: "Pick each stream you operate in, then the services you offer" },
          { name: "permit", label: "NUPRC / NMDPRA permit number", type: "text", placeholder: "Optional", half: true },
          { name: "website", label: "Website", type: "text", placeholder: "company.com", half: true },
          { name: "address", label: "Head office address", type: "textarea", required: true },
        ],
      },
      {
        id: "contact", title: "Admin contact", description: "The person who will manage your organization account.",
        fields: [
          { name: "contactName", label: "Full name", type: "text", required: true, half: true },
          { name: "contactRole", label: "Role", type: "text", placeholder: "e.g. HR Manager", required: true, half: true },
          { name: "contactPhone", label: "Phone number", type: "tel", required: true, half: true },
          { name: "contactEmail", label: "Work email", type: "email", required: true, half: true },
          { name: "cac", label: "CAC certificate", type: "file", hint: "PDF, JPG or PNG" },
        ],
      },
    ],
  },
};

export const PATH_ORDER: PathType[] = ["professional", "student", "organization"];

export function isPathType(v: string): v is PathType {
  return v in PATHS;
}

export type Values = Record<string, string | string[]>;

export function missingRequired(step: Step, values: Values): string[] {
  return step.fields
    .filter((f) => f.required)
    .filter((f) => {
      const v = values[f.name];
      return Array.isArray(v) ? v.length === 0 : !v || !String(v).trim();
    })
    .map((f) => f.name);
}

const key = (t: PathType) => `ep-profile-${t}`;
export function saveProfile(t: PathType, v: Values) {
  try { localStorage.setItem(key(t), JSON.stringify(v)); } catch { /* ignore */ }
}
export function loadProfile(t: PathType): Values {
  try { return JSON.parse(localStorage.getItem(key(t)) ?? "{}") as Values; } catch { return {}; }
}

/** Shrinks an uploaded image so it fits in browser storage. */
export function readImage(file: File, max: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale; c.height = img.height * scale;
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
