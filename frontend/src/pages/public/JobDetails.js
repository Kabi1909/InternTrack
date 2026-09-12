import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  Users,
  Wallet,
  GraduationCap,
  Bookmark,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CompanyLogo,
  EmptyState,
} from '../../components/common/UI';
import ApplicationModal from '../../components/applications/ApplicationModal';
import { jobService } from '../../services/jobService';
import { useAction } from '../../hooks/useAction';
import { formatDate, safeUrl } from '../../utils/helpers';
export default function JobDetails() {
  const { id } = useParams();
  const data = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [apply, setApply] = useState(false);
  const { run } = useAction();
  const job = data.jobs.find((j) => j.id === id);
  if (!job)
    return (
      <div className="container public-page">
        <EmptyState
          title="This opportunity is no longer here"
          description="It may have been removed. There are more possibilities waiting for you."
          action={<ButtonLink to="/jobs">Browse opportunities</ButtonLink>}
        />
      </div>
    );
  const company = data.companies.find((c) => c.id === job.companyId);
  const saved = (data.saved[user?.id] || []).includes(id);
  const existing = data.applications.find(
    (a) => a.userId === user?.id && a.jobId === id && a.status !== 'Withdrawn',
  );
  const closed =
    job.status !== 'Active' || job.deadline < new Date().toISOString().slice(0, 10);
  const save = () =>
    user
      ? run(
          () => jobService.toggleSaved(user.id, id),
          saved ? 'Removed from saved jobs' : 'Opportunity saved',
        )
      : navigate('/login', { state: { from: `/jobs/${id}` } });
  return (
    <div className="container public-page">
      <Link className="back-link" to="/jobs">
        <ArrowLeft size={14} />
        Back to opportunities
      </Link>
      <div className="detail-layout">
        <div>
          <div className="detail-heading">
            <div className="inline-row">
              <CompanyLogo company={company} size="large" />
              <div>
                <strong>{company?.name}</strong>
                <p className="muted" style={{ fontSize: 12 }}>
                  {company?.industry}
                </p>
              </div>
            </div>
            <h1>{job.title}</h1>
            <div className="job-location">
              <MapPin size={15} />
              {job.location || company?.location} · {job.mode}
            </div>
            <div className="job-tags">
              <Badge tone="green">{job.type}</Badge>
              <Badge>{job.experience}</Badge>
              <Badge>{job.mode}</Badge>
              {closed && <Badge tone="red">Applications closed</Badge>}
            </div>
          </div>
          <Card>
            <section className="detail-section">
              <h2>A little about the opportunity</h2>
              <p>{job.description}</p>
            </section>
            {[
              ['What you’ll do', job.responsibilities],
              ['What you’ll bring', job.qualifications],
            ].map(([title, text]) => (
              <section className="detail-section" key={title}>
                <h2>{title}</h2>
                <ul>
                  {text
                    ?.split('\n')
                    .filter(Boolean)
                    .map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                </ul>
              </section>
            ))}
            <section className="detail-section">
              <h2>Your toolkit</h2>
              <div className="job-tags">
                {job.skills.map((skill) => (
                  <Badge tone="green" key={skill}>
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          </Card>
          <Card style={{ marginTop: 22 }}>
            <section className="detail-section" style={{ margin: 0 }}>
              <h2>Meet {company?.name}</h2>
              <p>{company?.description}</p>
              {safeUrl(company?.website) && (
                <a
                  className="text-link"
                  style={{ marginTop: 15 }}
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit company website
                  <ArrowUpRight size={14} />
                </a>
              )}
            </section>
          </Card>
        </div>
        <Card className="detail-sidebar">
          <h3>Your next chapter, at a glance</h3>
          <div className="facts">
            {[
              [Wallet, 'Salary / allowance', job.salary || 'Not specified'],
              [BriefcaseBusiness, 'Employment', job.type],
              [MapPin, 'Work arrangement', job.mode],
              [Clock3, 'Apply by', formatDate(job.deadline)],
              [Users, 'Open positions', job.positions],
              [GraduationCap, 'Experience', job.experience],
            ].map(([Icon, label, value]) => (
              <div key={label}>
                <Icon size={19} color="#8b9e79" />
                <div>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </div>
              </div>
            ))}
          </div>
          {user?.role === 'provider' ? (
            <ButtonLink
              className="full-width"
              variant="secondary"
              to={
                user.companyId === job.companyId
                  ? `/provider/jobs/${id}/edit`
                  : '/provider/jobs'
              }
            >
              Manage your vacancies
            </ButtonLink>
          ) : (
            <>
              {existing ? (
                <ButtonLink
                  className="full-width"
                  to={`/student/applications/${existing.id}`}
                >
                  Track your application
                </ButtonLink>
              ) : (
                <Button
                  className="full-width"
                  disabled={closed}
                  onClick={() =>
                    user
                      ? setApply(true)
                      : navigate('/login', { state: { from: `/jobs/${id}` } })
                  }
                >
                  {closed ? 'Applications closed' : 'Apply now'}
                  <ArrowUpRight size={16} />
                </Button>
              )}
              <Button
                className="full-width"
                style={{ marginTop: 10 }}
                variant="secondary"
                onClick={save}
              >
                <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                {saved ? 'Saved opportunity' : 'Save for later'}
              </Button>
            </>
          )}
          <p className="banner-note">Illustrative opportunity · Frontend demo</p>
        </Card>
      </div>
      {user?.role === 'student' && (
        <ApplicationModal open={apply} onClose={() => setApply(false)} job={job} />
      )}
    </div>
  );
}
