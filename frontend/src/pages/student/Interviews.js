import { useState } from "react";
import { CalendarDays, Clock3, Video, MapPin, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CompanyLogo,
  EmptyState,
  PageHeader,
} from "../../components/common/UI";
import ApplicationStatusBadge from "../../components/applications/ApplicationStatusBadge";
import { calendarDownload, formatDate, safeUrl } from "../../utils/helpers";
export default function Interviews() {
  const { user } = useAuth();
  const data = useData();
  const [tab, setTab] = useState("Upcoming");
  const provider = user.role === "provider";
  const interviews = data.interviews
    .filter((i) =>
      provider
        ? data.jobs.some(
            (j) => j.id === i.jobId && j.companyId === user.companyId,
          )
        : i.userId === user.id,
    )
    .map((i) => ({
      ...i,
      displayStatus:
        new Date(i.date + "T" + i.time) < new Date() ? "Completed" : i.status,
    }))
    .filter((i) => i.displayStatus === tab)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <>
      <PageHeader
        eyebrow="MAKE ROOM FOR WHAT’S NEXT"
        title="Good conversations. New possibilities."
        description="Everything you need to show up prepared and make a great connection."
        action={
          provider && (
            <ButtonLink to="/provider/applicants">
              Schedule with a candidate
            </ButtonLink>
          )
        }
      />
      <div className="segmented" style={{ marginBottom: 25 }}>
        {["Upcoming", "Completed"].map((t) => (
          <button
            key={t}
            className={tab === t ? "active" : ""}
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
          >
            {t === "Completed" ? "Past interviews" : "Upcoming interviews"}
          </button>
        ))}
      </div>
      {interviews.length ? (
        <div className="interview-grid">
          {interviews.map((i) => {
            const job = data.jobs.find((j) => j.id === i.jobId);
            const company = data.companies.find((c) => c.id === job?.companyId);
            const candidate = data.users.find((u) => u.id === i.userId);
            return (
              <Card className="interview-card" key={i.id}>
                <div className="inline-row">
                  <CompanyLogo company={company} />
                  <div>
                    <h3>{job?.title || "Archived opportunity"}</h3>
                    <p>{provider ? candidate?.name : company?.name}</p>
                  </div>
                </div>
                <ApplicationStatusBadge status={i.displayStatus} />
                <div className="interview-meta">
                  <span>
                    <CalendarDays size={15} />
                    {formatDate(i.date)}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {i.time} local time
                  </span>
                  <span>
                    <Video size={15} />
                    {i.type}
                  </span>
                </div>
                {i.location && (
                  <p>
                    <MapPin size={13} style={{ display: "inline" }} />{" "}
                    {i.location}
                  </p>
                )}
                <p>{i.notes}</p>
                {i.link && (
                  <p className="banner-note">
                    Demo meetings use a placeholder link. No live meeting is
                    created.
                  </p>
                )}
                <div className="form-actions">
                  {tab === "Upcoming" && safeUrl(i.link) && (
                    <a
                      className="btn btn-primary"
                      href={i.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Video size={15} />
                      Join meeting
                    </a>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() =>
                      calendarDownload(
                        i,
                        `${job?.title || "Interview"} — ${company?.name || "InternTrack"}`,
                      )
                    }
                  >
                    <Download size={14} />
                    Add to calendar
                  </Button>
                  {job && (
                    <ButtonLink variant="ghost" to={`/jobs/${job.id}`}>
                      View job
                    </ButtonLink>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={
            tab === "Upcoming"
              ? "A little space before your next conversation"
              : "Your interview story starts here"
          }
          description={
            tab === "Upcoming"
              ? "New interviews will appear here when they’re scheduled."
              : "Completed interviews will appear here."
          }
          action={
            <ButtonLink to={provider ? "/provider/applicants" : "/jobs"}>
              {provider ? "Review applicants" : "Explore opportunities"}
            </ButtonLink>
          }
        />
      )}
    </>
  );
}
