import { Link } from 'react-router-dom';
import {
  FileText,
  Clock3,
  Video,
  Trophy,
  XCircle,
  Bookmark,
  ArrowUpRight,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Avatar,
  ButtonLink,
  Card,
  CompanyLogo,
  EmptyState,
  PageHeader,
  SectionHeader,
} from '../common/UI.js';
import StatCard from './StatCard.js';
import Analytics from './Analytics.js';
import JobCard from '../jobs/JobCard.js';
import ApplicationStatusBadge from '../applications/ApplicationStatusBadge.js';
import { formatDate } from '../../utils/helpers.js';
export default function DashboardOverview({ provider = false }) {
  const data = useData();
  const { user } = useAuth();
  const role = provider ? 'provider' : 'student';
  const jobs = provider
    ? data.jobs.filter((j) => j.companyId === user.companyId)
    : data.jobs;
  const applications = data.applications.filter((a) =>
    provider ? jobs.some((j) => j.id === a.jobId) : a.userId === user.id,
  );
  const interviews = data.interviews.filter(
    (i) =>
      (provider ? jobs.some((j) => j.id === i.jobId) : i.userId === user.id) &&
      i.status === 'Upcoming' &&
      new Date(i.date + 'T' + i.time) >= new Date(),
  );
  const analytics = data.analytics || {};
  const stats = provider
    ? [
        ['Total Vacancies', analytics.totalVacancies || 0, BriefcaseBusiness],
        ['Active Vacancies', analytics.activeVacancies || 0, CheckCircle2],
        ['Total Applicants', analytics.totalApplicants || 0, Users],
        ['Shortlisted', analytics.shortlistedCandidates || 0, FileText],
        ['Interviews Scheduled', analytics.interviewsScheduled || 0, Video],
        ['Offers Made', analytics.offersMade || 0, Trophy],
      ]
    : [
        ['Total Applications', analytics.totalApplications || 0, FileText],
        ['Under Review', analytics.underReview || 0, Clock3],
        ['Interviews', analytics.interviews || 0, Video],
        ['Offers', analytics.offers || 0, Trophy],
        ['Rejections', analytics.rejections || 0, XCircle],
        ['Saved Jobs', analytics.savedJobs || 0, Bookmark],
      ];
  const recommended = data.jobs
    .filter((j) => j.status === 'Active' && !applications.some((a) => a.jobId === j.id))
    .sort(
      (a, b) =>
        b.skills.filter((s) => user.skills?.includes(s)).length -
        a.skills.filter((s) => user.skills?.includes(s)).length,
    )
    .slice(0, 2);
  return (
    <>
      <PageHeader
        eyebrow={
          provider
            ? 'GREAT TEAMS START WITH POTENTIAL'
            : 'A NEW DAY. A LITTLE MORE POSSIBILITY.'
        }
        title={`Welcome back, ${user.name.split(' ')[0]} ${provider ? '' : '☀'}`}
        description={
          provider
            ? 'Here’s how your hiring journey is shaping up.'
            : 'Every small step is bringing you closer. Here’s where you stand.'
        }
        action={
          <ButtonLink to={provider ? '/provider/jobs/new' : '/jobs'}>
            {provider ? <Plus size={16} /> : <BriefcaseBusiness size={16} />}{' '}
            {provider ? 'Post an opportunity' : 'Explore opportunities'}
          </ButtonLink>
        }
      />
      <div className="stats-grid">
        {stats.map(([label, value, icon]) => (
          <StatCard
            key={label}
            label={label}
            value={value.toString().padStart(2, '0')}
            icon={icon}
            description={provider ? 'Your recruitment overview' : 'Your career journey'}
          />
        ))}
      </div>
      <Analytics
        applications={applications}
        jobs={jobs}
        provider={provider}
        analytics={analytics}
      />
      <div className="dashboard-grid">
        <div>
          <SectionHeader
            title={provider ? 'Your active opportunities' : 'Picked for your potential'}
            to={provider ? '/provider/jobs' : '/jobs'}
            link="View all"
          />
          {provider ? (
            <Card>
              {jobs
                .filter((j) => j.status === 'Active')
                .map((job) => (
                  <Link
                    className="list-item"
                    to={`/provider/jobs/${job.id}/applicants`}
                    key={job.id}
                  >
                    <CompanyLogo
                      company={data.companies.find((c) => c.id === job.companyId)}
                    />
                    <div>
                      <h3>{job.title}</h3>
                      <p>
                        {job.type} ·{' '}
                        {applications.filter((a) => a.jobId === job.id).length} applicants
                      </p>
                    </div>
                    <ArrowUpRight size={16} style={{ marginLeft: 'auto' }} />
                  </Link>
                ))}
              {!jobs.some((job) => job.status === 'Active') && (
                <EmptyState
                  title="Your team’s next chapter"
                  description="Post your first opportunity to start meeting talent."
                />
              )}
            </Card>
          ) : (
            <div className="job-grid">
              {recommended.map((job) => (
                <JobCard job={job} key={job.id} />
              ))}
              {!recommended.length && (
                <EmptyState
                  title="You’re all caught up"
                  description="New opportunities will appear here."
                />
              )}
            </div>
          )}
        </div>
        <div>
          <SectionHeader
            title="Your next conversations"
            to={`/${role}/interviews`}
            link="View all"
          />
          <Card>
            {interviews.slice(0, 3).map((i) => {
              const job = data.jobs.find((j) => j.id === i.jobId);
              return (
                <Link to={`/${role}/interviews`} className="list-item" key={i.id}>
                  <span className="date-tile">
                    <small>
                      {new Date(i.date).toLocaleDateString('en-US', {
                        month: 'short',
                      })}
                    </small>
                    {new Date(i.date).getDate()}
                  </span>
                  <div>
                    <h3>{job?.title || 'Archived opportunity'}</h3>
                    <p>
                      {i.time} · {i.type}
                    </p>
                  </div>
                </Link>
              );
            })}
            {!interviews.length && (
              <EmptyState
                title="A little room to prepare"
                description="Your upcoming interviews will appear here."
              />
            )}
          </Card>
        </div>
      </div>
      <div className="dashboard-grid">
        <Card>
          <SectionHeader
            title={provider ? 'People to get to know' : 'A little closer, every update'}
            to={provider ? '/provider/applicants' : '/student/applications'}
            link="View all"
          />
          {applications.slice(0, 4).map((a) => {
            const job = data.jobs.find((j) => j.id === a.jobId);
            const candidate = data.users.find((u) => u.id === a.userId);
            const company = data.companies.find((c) => c.id === job?.companyId);
            return (
              <Link
                to={
                  provider
                    ? `/provider/applicants/${a.id}`
                    : `/student/applications/${a.id}`
                }
                className="list-item"
                key={a.id}
              >
                {provider ? (
                  <Avatar name={candidate?.name} />
                ) : (
                  <CompanyLogo company={company} />
                )}
                <div>
                  <h3>
                    {provider ? candidate?.name : job?.title || 'Archived opportunity'}
                  </h3>
                  <p>
                    {provider ? job?.title : company?.name} · {formatDate(a.updatedAt)}
                  </p>
                </div>
                <ApplicationStatusBadge status={a.status} />
              </Link>
            );
          })}
          {!applications.length && (
            <EmptyState
              title="The first step is still ahead"
              description="Application activity will appear here."
            />
          )}
        </Card>
        <Card>
          <SectionHeader
            title={provider ? 'Your latest updates' : 'Before the window closes'}
            to={provider ? '/provider/notifications' : '/student/saved-jobs'}
            link="View all"
          />
          {provider
            ? data.notifications
                .filter((n) => n.userId === user.id)
                .slice(0, 3)
                .map((n) => (
                  <Link key={n.id} to="/provider/notifications" className="list-item">
                    <div>
                      <h3>{n.title}</h3>
                      <p>{n.message}</p>
                    </div>
                  </Link>
                ))
            : data.jobs
                .filter(
                  (j) =>
                    (data.saved[user.id] || []).includes(j.id) && j.status === 'Active',
                )
                .sort((a, b) => a.deadline.localeCompare(b.deadline))
                .slice(0, 3)
                .map((j) => (
                  <Link key={j.id} to={`/jobs/${j.id}`} className="list-item">
                    <Clock3 size={18} color="var(--color-accent)" />
                    <div>
                      <h3>{j.title}</h3>
                      <p>Apply by {formatDate(j.deadline)}</p>
                    </div>
                  </Link>
                ))}
          {(provider
            ? !data.notifications.some((n) => n.userId === user.id)
            : !(data.saved[user.id] || []).length) && (
            <EmptyState
              title="You’re up to date"
              description="Important updates will appear here."
            />
          )}
        </Card>
      </div>
    </>
  );
}
