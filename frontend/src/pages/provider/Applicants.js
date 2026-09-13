import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  Input,
  PageHeader,
  Select,
} from '../../components/common/UI.js';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge.js';
import InterviewModal from '../../components/applications/InterviewModal.js';
import { applicationService } from '../../services/applicationService.js';
import { useAction } from '../../hooks/useAction.js';
import { statuses } from '../../data/options.js';
import { formatDate } from '../../utils/helpers.js';
export default function Applicants() {
  const { id } = useParams();
  const { user } = useAuth();
  const data = useData();
  const [status, setStatus] = useState('');
  const [university, setUniversity] = useState('');
  const [skill, setSkill] = useState('');
  const [schedule, setSchedule] = useState(null);
  const [reject, setReject] = useState(null);
  const { loading, run } = useAction();
  const jobs = data.jobs.filter((j) => j.companyId === user.companyId);
  const job = jobs.find((j) => j.id === id);
  if (id && !job)
    return (
      <EmptyState
        title="Vacancy not found"
        description="This opportunity is not in your workspace."
        action={<ButtonLink to="/provider/jobs">Your vacancies</ButtonLink>}
      />
    );
  const candidates = data.applications
    .filter((a) => jobs.some((j) => j.id === a.jobId) && (!id || a.jobId === id))
    .filter((a) => {
      const candidate = data.users.find((u) => u.id === a.userId);
      return (
        (!status || a.status === status) &&
        (!university || candidate?.university === university) &&
        (!skill ||
          candidate?.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase())))
      );
    });
  return (
    <>
      <PageHeader
        eyebrow="LOOK BEYOND THE RESUME"
        title={
          job
            ? 'Meet the potential behind every application.'
            : 'Your next great teammate is out there.'
        }
        description={
          job
            ? `${job.title} · ${candidates.length} candidates`
            : 'Discover the people who could help write your team’s next chapter.'
        }
      />
      <div className="filter-row">
        <Select
          label="Application status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select
          label="University"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
        >
          <option value="">All universities</option>
          {[
            ...new Set(
              data.users.filter((u) => u.role === 'student').map((u) => u.university),
            ),
          ]
            .filter(Boolean)
            .map((u) => (
              <option key={u}>{u}</option>
            ))}
        </Select>
        <Input
          label="Skills"
          placeholder="e.g. React"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
      </div>
      {candidates.length ? (
        <div className="interview-grid">
          {candidates.map((a) => {
            const c = data.users.find((u) => u.id === a.userId);
            const job = data.jobs.find((j) => j.id === a.jobId);
            const terminal = ['Rejected', 'Withdrawn', 'Offered'].includes(a.status);
            return (
              <Card key={a.id}>
                <div className="inline-row">
                  <Avatar name={c.name} src={c.picture} />
                  <div>
                    <h3>{c.name}</h3>
                    <p className="muted" style={{ fontSize: 11 }}>
                      {c.university}
                    </p>
                  </div>
                </div>
                <p className="muted" style={{ fontSize: 12, marginTop: 15 }}>
                  {c.degree}
                </p>
                <p className="muted" style={{ fontSize: 11 }}>
                  {job.title} · Applied {formatDate(a.appliedAt)}
                </p>
                <div className="job-tags">
                  {c.skills.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>
                <div className="status-summary">
                  <ApplicationStatusBadge status={a.status} />
                </div>
                <div className="action-buttons">
                  <ButtonLink variant="secondary" to={`/provider/applicants/${a.id}`}>
                    View profile
                  </ButtonLink>
                  <Button
                    variant="secondary"
                    disabled={terminal || a.status === 'Shortlisted' || loading}
                    onClick={() =>
                      run(
                        () =>
                          applicationService.update(a.id, {
                            status: 'Shortlisted',
                          }),
                        'Candidate shortlisted',
                      )
                    }
                  >
                    Shortlist
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={terminal}
                    onClick={() => setSchedule(a)}
                  >
                    Schedule interview
                  </Button>
                  <Button
                    variant="danger"
                    disabled={terminal}
                    onClick={() => setReject(a)}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No candidates match just yet"
          description="Try adjusting the filters, or check back as new people discover your opportunity."
        />
      )}
      <InterviewModal
        open={!!schedule}
        onClose={() => setSchedule(null)}
        application={schedule}
      />
      <ConfirmDialog
        open={!!reject}
        onClose={() => setReject(null)}
        title="Reject this application?"
        description="The candidate’s application status will change to Rejected and they’ll receive a notification."
        loading={loading}
        onConfirm={async () => {
          const result = await run(
            () => applicationService.update(reject.id, { status: 'Rejected' }),
            'Application status updated',
          );
          if (result.ok) setReject(null);
        }}
      />
    </>
  );
}
