import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Select,
  Textarea,
} from "../../components/common/UI";
import ApplicationStatusBadge from "../../components/applications/ApplicationStatusBadge";
import CVPreview from "../../components/applications/CVPreview";
import InterviewModal from "../../components/applications/InterviewModal";
import { applicationService } from "../../services/applicationService";
import { useAction } from "../../hooks/useAction";
import { formatDate, safeUrl } from "../../utils/helpers";
export default function CandidateDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const data = useData();
  const app = data.applications.find(
    (a) =>
      a.id === id &&
      data.jobs.some((j) => j.id === a.jobId && j.companyId === user.companyId),
  );
  const [notes, setNotes] = useState(app?.privateNotes || "");
  const [status, setStatus] = useState(app?.status || "Applied");
  const [schedule, setSchedule] = useState(false);
  const [reject, setReject] = useState(false);
  const { loading, run } = useAction();
  if (!app)
    return (
      <EmptyState
        title="Candidate not found"
        description="This application is not available to your company."
        action={
          <ButtonLink to="/provider/applicants">All applicants</ButtonLink>
        }
      />
    );
  const c = data.users.find((u) => u.id === app.userId);
  const job = data.jobs.find((j) => j.id === app.jobId);
  const update = async (next) => {
    const result = await run(
      () => applicationService.update(id, { status: next }),
      "Application status updated",
    );
    if (result.ok) {
      setStatus(next);
      setReject(false);
    }
  };
  return (
    <>
      <Link className="back-link" to={`/provider/jobs/${job.id}/applicants`}>
        <ArrowLeft size={14} />
        Back to candidates
      </Link>
      <PageHeader
        eyebrow="GET TO KNOW YOUR NEXT TEAMMATE"
        title={c.name}
        description={`Applied for ${job.title} · ${formatDate(app.appliedAt)}`}
        action={<ApplicationStatusBadge status={app.status} />}
      />
      <div className="profile-layout">
        <Card className="profile-summary">
          <Avatar name={c.name} src={c.picture} size="large" />
          <h2>{c.name}</h2>
          <p>{c.university}</p>
          <p>{c.degree}</p>
          <p>Class of {c.graduation || "Not provided"}</p>
          <div className="job-tags" style={{ justifyContent: "center" }}>
            {c.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
          <div className="form-stack" style={{ marginTop: 23 }}>
            {[
              ["LinkedIn", c.linkedin],
              ["GitHub", c.github],
            ]
              .filter(([, url]) => safeUrl(url))
              .map(([label, url]) => (
                <a
                  key={label}
                  className="text-link"
                  style={{ justifyContent: "center" }}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {label}
                  <ArrowUpRight size={14} />
                </a>
              ))}
            <CVPreview application={app} candidate={c} />
          </div>
        </Card>
        <div className="form-stack">
          <Card>
            <h3 style={{ marginBottom: 16 }}>
              A note from {c.name.split(" ")[0]}
            </h3>
            <p
              className="muted"
              style={{ fontSize: 13, whiteSpace: "pre-wrap" }}
            >
              {app.coverLetter}
            </p>
          </Card>
          <Card>
            <h3 style={{ marginBottom: 20 }}>Move the conversation forward</h3>
            {app.status === "Withdrawn" ? (
              <p className="note-box">
                The candidate withdrew this application. Its history is kept for
                your records.
              </p>
            ) : (
              <>
                <div className="inline-row" style={{ alignItems: "end" }}>
                  <Select
                    label="Application status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {[
                      "Applied",
                      "Under Review",
                      "Shortlisted",
                      "Interview Scheduled",
                      "Offered",
                      "Rejected",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                  <Button
                    loading={loading}
                    onClick={() =>
                      status === "Rejected"
                        ? setReject(true)
                        : status === "Interview Scheduled"
                          ? setSchedule(true)
                          : update(status)
                    }
                  >
                    Update status
                  </Button>
                </div>
                <div className="action-buttons" style={{ marginTop: 18 }}>
                  <Button
                    variant="secondary"
                    loading={loading}
                    onClick={() => update("Shortlisted")}
                  >
                    Shortlist
                  </Button>
                  <Button variant="secondary" onClick={() => setSchedule(true)}>
                    Schedule interview
                  </Button>
                  <Button variant="danger" onClick={() => setReject(true)}>
                    Reject application
                  </Button>
                </div>
              </>
            )}
          </Card>
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () => applicationService.update(id, { privateNotes: notes }),
                  "Private notes saved",
                );
              }}
            >
              <Textarea
                label="Private hiring notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Strengths, questions, and feedback for your team…"
              />
              <p className="banner-note">
                Visible only in the provider workspace.
              </p>
              <div className="form-actions">
                <Button loading={loading} type="submit">
                  <Save size={15} />
                  Save notes
                </Button>
              </div>
            </form>
          </Card>
          <Card>
            <h3 style={{ marginBottom: 14 }}>Application history</h3>
            {app.history.map((h, i) => (
              <div className="history-row" key={i}>
                <span>{h.status}</span>
                <time>{formatDate(h.date)}</time>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <InterviewModal
        open={schedule}
        onClose={() => setSchedule(false)}
        application={app}
      />
      <ConfirmDialog
        open={reject}
        onClose={() => setReject(false)}
        title="Reject this application?"
        description="The candidate will see the updated status in their workspace."
        loading={loading}
        onConfirm={() => update("Rejected")}
      />
    </>
  );
}
