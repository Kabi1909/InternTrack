import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  MapPin,
  Check,
  Sparkles,
  Code2,
  PenTool,
  ChartNoAxesCombined,
  ShieldCheck,
  Megaphone,
  BriefcaseBusiness,
  Settings2,
  Landmark,
  UserRound,
  Send,
  TrendingUp,
  Video,
  Building2,
  Users,
  CalendarDays,
  GraduationCap,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  CompanyLogo,
  SectionHeader,
} from "../../components/common/UI";
import JobCard from "../../components/jobs/JobCard";
import { categories } from "../../data/mockData";
const categoryIcons = [
  Code2,
  PenTool,
  ChartNoAxesCombined,
  ShieldCheck,
  Megaphone,
  BriefcaseBusiness,
  Settings2,
  Landmark,
];
const workflows = {
  student: [
    ["Create your profile", "Let your potential do the talking.", UserRound],
    ["Find your fit", "Discover work that feels like you.", Search],
    ["Make your move", "Apply with confidence.", Send],
    ["Track every step", "Stay in the loop, effortlessly.", TrendingUp],
    ["Meet your future", "Show up ready for what’s next.", Video],
  ],
  provider: [
    ["Introduce your team", "Build a company profile.", Building2],
    ["Share an opportunity", "Reach tomorrow’s talent.", BriefcaseBusiness],
    ["Discover potential", "Review promising candidates.", Users],
    ["Start a conversation", "Schedule interviews in one place.", CalendarDays],
    ["Welcome your next hire", "Build something great together.", Check],
  ],
};
function HeroArtwork() {
  const { companies } = useData();
  return (
    <div
      className="hero-art"
      aria-label="Preview: track applications, schedule interviews, and find matching roles"
    >
      <div className="orbit" />
      <div className="orbit inner" />
      <Sparkles className="hero-spark" size={32} strokeWidth={1.2} />
      <div className="floating-card application-preview">
        <div className="preview-header">
          <CompanyLogo company={companies[0]} />
          <div>
            <strong>Frontend Developer Intern</strong>
            <small>Linear · Colombo, Sri Lanka</small>
          </div>
        </div>
        <div className="preview-label">YOUR APPLICATION JOURNEY</div>
        <div className="preview-track">
          <span>
            <Check size={12} />
          </span>
          <i />
          <span>
            <Check size={12} />
          </span>
          <i />
          <span>
            <Video size={11} />
          </span>
          <i />
          <span>·</span>
        </div>
        <div className="preview-track-labels">
          <span>Applied</span>
          <span>Reviewed</span>
          <span>Interview</span>
          <span>Offer</span>
        </div>
        <div className="preview-footer">
          <span>You’re making moves ✨</span>
          <Badge tone="green">Interview scheduled</Badge>
        </div>
      </div>
      <div className="floating-logo">N</div>
      <div className="floating-card interview-preview">
        <div className="preview-header">
          <span className="date-tile">
            <small>Next</small>03
          </span>
          <div>
            <strong>Your next big conversation</strong>
            <small>Product Design Intern · Notion</small>
          </div>
        </div>
        <p>10:00 AM – 11:00 AM · Google Meet</p>
        <Badge tone="green">
          <Video size={10} /> You’re all set
        </Badge>
      </div>
      <div className="floating-card match-preview">
        <div className="match-ring">
          96<span style={{ fontSize: 11 }}>%</span>
        </div>
        <p>A little more you.</p>
        <small>Example skill match</small>
      </div>
      <div className="art-caption">A clear path to your next chapter ↗</div>
    </div>
  );
}
export default function Home() {
  const data = useData();
  const [workflow, setWorkflow] = useState("student");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();
  const active = data.jobs.filter((j) => j.status === "Active");
  const search = (e) => {
    e.preventDefault();
    navigate(`/jobs?${new URLSearchParams({ q: query, location })}`);
  };
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="hero-tag">
              <i />
              BIG AMBITIONS. BRIGHT BEGINNINGS.
            </span>
            <h1>
              Your next chapter
              <br />
              starts with the
              <br />
              <em>right opportunity.</em>
            </h1>
            <p>
              Discover internships and early-career jobs. Keep every
              application, interview, and possibility in one place.
            </p>
            <form className="hero-search" onSubmit={search}>
              <label>
                <Search size={16} />
                <input
                  aria-label="Job title or keyword"
                  placeholder="Job title, skill, or company"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <label>
                <MapPin size={16} />
                <input
                  aria-label="Location"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
              <Button type="submit">
                Find opportunities <ArrowUpRight size={14} />
              </Button>
            </form>
            <p className="hero-hint">
              Popular searches:<Link to="/jobs?q=Frontend">Frontend</Link>
              <Link to="/jobs?category=UI%2FUX+Design">UI/UX Design</Link>
              <Link to="/jobs?mode=Remote">Remote</Link>
            </p>
            <div className="hero-proof">
              <div className="avatar-stack">
                {[
                  "Alex Morgan",
                  "Sam Fernando",
                  "Priya Perera",
                  "Jamie Taylor",
                ].map((n) => (
                  <Avatar key={n} name={n} />
                ))}
              </div>
              <span>
                A fresh start for <strong>ambitious people.</strong>
                <br />
                Explore your next move with InternTrack.
              </span>
            </div>
            <div className="inline-row" style={{ marginTop: 20, gap: 20 }}>
              <Link className="text-link" to="/register?role=student">
                I’m finding my future <ArrowRight size={13} />
              </Link>
              <Link className="text-link" to="/register?role=provider">
                I’m hiring <ArrowRight size={13} />
              </Link>
            </div>
          </div>
          <HeroArtwork />
        </div>
      </section>
      <section className="trusted">
        <div className="container">
          <p>
            Explore demo opportunities inspired by teams that build what’s next
          </p>
          <div className="company-strip">
            <span>◒ Linear</span>
            <span>▣ Notion</span>
            <span>≋ Spotify</span>
            <span>F figma</span>
            <span>stripe</span>
            <span>WSO2</span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="A GOOD PLACE TO START"
            title="Small beginnings. Big possibilities."
            description="Handpicked internships for your first meaningful career move."
            to="/jobs"
            link="Explore all opportunities"
          />
          <div className="job-grid">
            {active
              .filter((j) => j.type === "Internship")
              .slice(0, 3)
              .map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container">
          <SectionHeader
            eyebrow="FIND YOUR DIRECTION"
            title="There’s a place for your potential."
            description="Explore opportunities in the fields that spark your curiosity."
            to="/jobs"
            link="All categories"
          />
          <div className="categories">
            {categories.map((category, i) => {
              const Icon = categoryIcons[i];
              const count = active.filter(
                (j) => j.category === category,
              ).length;
              return (
                <Link
                  className="category-card"
                  key={category}
                  to={`/jobs?category=${encodeURIComponent(category)}`}
                >
                  <span className="category-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3>{category}</h3>
                    <p>
                      {count} {count === 1 ? "opportunity" : "opportunities"}
                    </p>
                  </div>
                  <ArrowUpRight size={14} />
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="how-header">
            <div className="eyebrow">LESS OVERWHELM. MORE FORWARD.</div>
            <h2>Your journey, a little simpler.</h2>
            <p>From your first hello to your next big yes. We’re with you.</p>
            <div className="segmented" aria-label="Choose workflow">
              <button
                className={workflow === "student" ? "active" : ""}
                aria-pressed={workflow === "student"}
                onClick={() => setWorkflow("student")}
              >
                For students
              </button>
              <button
                className={workflow === "provider" ? "active" : ""}
                aria-pressed={workflow === "provider"}
                onClick={() => setWorkflow("provider")}
              >
                For employers
              </button>
            </div>
          </div>
          <div className="steps">
            {workflows[workflow].map(([title, description, Icon], i) => (
              <div key={title} className="step">
                <span className="step-icon">
                  <Icon size={21} />
                  <small>{i + 1}</small>
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container">
          <SectionHeader
            eyebrow="FRESH OFF THE PRESS"
            title="Your next move might be right here."
            description="The latest opportunities from teams looking for people like you."
            to="/jobs"
            link="See what’s new"
          />
          <div className="job-grid">
            {[...active]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(3, 6)
              .map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container benefits-grid">
          {[
            {
              role: "student",
              label: "FOR STUDENTS & GRADUATES",
              title: "Less juggling. More growing.",
              description:
                "Give your ambitions a home, and your job search a little breathing room.",
              items: [
                "Application tracking",
                "Personalized discovery",
                "Interview reminders",
                "Saved opportunities",
                "Career analytics",
              ],
              cta: "Start your journey",
              Icon: GraduationCap,
            },
            {
              role: "provider",
              label: "FOR FORWARD-THINKING TEAMS",
              title: "Great talent. A clearer path.",
              description:
                "Meet the next generation of talent and make every hiring moment count.",
              items: [
                "Vacancy management",
                "Candidate screening",
                "Application pipeline",
                "Interview scheduling",
                "Recruitment analytics",
              ],
              cta: "Find your next great hire",
              Icon: Building2,
            },
          ].map(({ role, label, title, description, items, cta, Icon }) => (
            <div className={`benefit-panel ${role}`} key={role}>
              <div className="eyebrow">
                <Icon size={17} />
                {label}
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
              <div className="benefit-list">
                {items.map((item) => (
                  <span key={item}>
                    <Check size={13} />
                    {item}
                  </span>
                ))}
              </div>
              <ButtonLink to={`/register?role=${role}`} variant="secondary">
                {cta}
                <ArrowUpRight size={15} />
              </ButtonLink>
            </div>
          ))}
        </div>
      </section>
      <section style={{ paddingBottom: 65 }}>
        <div className="container">
          <div className="cta-panel">
            <div>
              <div className="eyebrow" style={{ color: "#b4cf91" }}>
                THE NEXT CHAPTER IS YOURS
              </div>
              <h2>
                Good things start
                <br />
                with a first step.
              </h2>
              <p>
                Find your people. Find your purpose. Find your next opportunity.
              </p>
            </div>
            <div className="cta-actions">
              <ButtonLink variant="lime" to="/register">
                Get started for free <ArrowUpRight size={15} />
              </ButtonLink>
              <ButtonLink variant="secondary" to="/jobs">
                Explore opportunities
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
