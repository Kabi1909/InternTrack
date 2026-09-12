import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Textarea,
} from '../../components/common/UI';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import ApplicationTimeline from '../../components/applications/ApplicationTimeline';
import CVPreview from '../../components/applications/CVPreview';
import { applicationService } from '../../services/applicationService';
import { useAction } from '../../hooks/useAction';
import { formatDate } from '../../utils/helpers';
export default function ApplicationDetails() {
  const { id } = useParams();
  const data = useData();
  const { user } = useAuth();
  const app = data.applications.find((a) => a.id === id && a.userId === user.id);
  const [notes, setNotes] = useState(app?.notes || '');
  const [confirm, setConfirm] = useState(false);
  const { loading, run } = useAction();
  if (!app)
    return (
      <EmptyState
        title="Application not found"
        description="This application is not available in your workspace."
        action={<ButtonLink to="/student/applications">My applications</ButtonLink>}
      />
    );
  const job = data.jobs.find((j) => j.id === app.jobId);
  const interview = data.interviews.find(
    (i) => i.applicationId === id && i.status === 'Upcoming',
  );
  return (
    <>
      <Link className="back-link" to="/student/applications">
        <ArrowLeft size={14} />
        All applications
      </Link>
      <PageHeader
        eyebrow="ONE STEP CLOSER"
        title={job?.title || 'Archived opportunity'}
        description={`Applied ${formatDate(app.appliedAt)} · ${data.companies.find((c) => c.id === job?.companyId)?.name || 'Company unavailable'}`}
        action={<ApplicationStatusBadge status={app.status} />}
      />
      <Card style={{ marginBottom: 24 }}>
        <h3>Your application journey</h3>
        <ApplicationTimeline application={app} />
        {['Rejected', 'Withdrawn'].includes(app.status) && (
          <p className="note-box">
            This application is {app.status.toLowerCase()}. Your next opportunity is still
            ahead.
          </p>
        )}
      </Card>
      <div className="dashboard-grid">
        <div className="form-stack">
          <Card>
            <h3>What you shared</h3>
            <div style={{ margin: '20px 0' }}>
              <CVPreview application={app} candidate={user} />
            </div>
            <h3 style={{ fontSize: 14, marginBottom: 12 }}>Your cover letter</h3>
            <p className="muted" style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
              {app.coverLetter}
            </p>
          </Card>
          <Card>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () => applicationService.update(id, { notes }),
                  'Personal notes saved',
                );
              }}
            >
              <Textarea
                label="Your personal notes"
                placeholder="Questions to ask, things to remember, a little encouragement…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
              />
              <p className="banner-note">Only visible in your student workspace.</p>
              <div className="form-actions">
                <Button loading={loading} type="submit">
                  <Save size={15} />
                  Save notes
                </Button>
              </div>
            </form>
          </Card>
        </div>
        <div className="form-stack">
          <Card>
            <h3 style={{ marginBottom: 15 }}>Every update</h3>
            {app.history.map((h, i) => (
              <div className="history-row" key={i}>
                <span>{h.status}</span>
                <time>{formatDate(h.date)}</time>
              </div>
            ))}
          </Card>
          {interview && (
            <Card>
              <h3>Your next conversation</h3>
              <p className="muted" style={{ fontSize: 13, margin: '15px 0' }}>
                {formatDate(interview.date)} at {interview.time}
                <br />
                {interview.type}
              </p>
              <ButtonLink to="/student/interviews" variant="secondary">
                Interview details
              </ButtonLink>
            </Card>
          )}
          <Card>
            {job && (
              <ButtonLink
                variant="secondary"
                className="full-width"
                to={`/jobs/${job.id}`}
              >
                View opportunity
              </ButtonLink>
            )}
            {!['Withdrawn', 'Rejected'].includes(app.status) && (
              <Button
                variant="danger"
                className="full-width"
                style={{ marginTop: 12 }}
                onClick={() => setConfirm(true)}
              >
                Withdraw application
              </Button>
            )}
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Withdraw this application?"
        description="This will mark your application as withdrawn. You can apply again while the opportunity is open."
        loading={loading}
        onConfirm={async () => {
          const result = await run(
            () => applicationService.update(id, { status: 'Withdrawn' }),
            'Application withdrawn',
          );
          if (result.ok) setConfirm(false);
        }}
      />
    </>
  );
}
