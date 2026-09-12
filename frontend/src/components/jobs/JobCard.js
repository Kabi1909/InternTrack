import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bookmark, MapPin, Clock3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { jobService } from '../../services/jobService';
import { useAction } from '../../hooks/useAction';
import { Badge, CompanyLogo } from '../common/UI';
import { formatDate } from '../../utils/helpers';
export default function JobCard({ job, compact = false }) {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const { run } = useAction();
  const company = data.companies.find((c) => c.id === job.companyId);
  const saved = (data.saved[user?.id] || []).includes(job.id);
  const save = () => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return;
    run(
      () => jobService.toggleSaved(user.id, job.id),
      saved ? 'Removed from saved jobs' : 'Opportunity saved',
    );
  };
  return (
    <article className={`job-card ${compact ? 'compact' : ''}`}>
      <div className="job-card-top">
        <CompanyLogo company={company} />
        <span className="company-name">{company?.name}</span>
        {user?.role !== 'provider' && (
          <button
            className={`icon-btn save-btn ${saved ? 'is-saved' : ''}`}
            aria-label={`${saved ? 'Unsave' : 'Save'} ${job.title}`}
            aria-pressed={saved}
            onClick={save}
          >
            <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <Link className="job-title" to={`/jobs/${job.id}`}>
        {job.title}
      </Link>
      <div className="job-location">
        <MapPin size={14} />
        {company?.location === 'Remote' ? 'Worldwide' : job.location || company?.location}
        <span>·</span>
        {job.mode}
      </div>
      <div className="job-tags">
        <Badge tone="green">{job.type}</Badge>
        {job.skills.slice(0, 2).map((skill) => (
          <Badge key={skill}>{skill}</Badge>
        ))}
      </div>
      {!compact && (
        <div className="job-bottom">
          <span>
            <Clock3 size={13} /> Apply by{' '}
            {formatDate(job.deadline).replace(', ' + new Date().getFullYear(), '')}
          </span>
          <Link to={`/jobs/${job.id}`} aria-label={`View ${job.title}`}>
            <ArrowUpRight size={20} />
          </Link>
        </div>
      )}
    </article>
  );
}
