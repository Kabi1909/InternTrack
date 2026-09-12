import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ButtonLink, Card, EmptyState, PageHeader } from '../../components/common/UI.js';
import JobForm from '../../components/jobs/JobForm.js';
export default function JobEditor() {
  const { id } = useParams();
  const { user } = useAuth();
  const data = useData();
  const company = data.companies.find((c) => c.id === user.companyId);
  const job = data.jobs.find(
    (j) => j.id === id && j.companyId === user.companyId && j.status !== 'Deleted',
  );
  if (id && !job)
    return (
      <EmptyState
        title="Vacancy not found"
        description="You can edit opportunities owned by your company."
        action={<ButtonLink to="/provider/jobs">Your vacancies</ButtonLink>}
      />
    );
  return (
    <>
      <Link className="back-link" to="/provider/jobs">
        <ArrowLeft size={14} />
        All vacancies
      </Link>
      <PageHeader
        eyebrow="GREAT TEAMS START HERE"
        title={id ? 'Give your opportunity a refresh.' : 'Open a door for someone great.'}
        description="Be clear, be thoughtful, and help the right people picture their future with you."
      />
      <Card>
        <JobForm key={id || 'new'} job={job} company={company} />
      </Card>
    </>
  );
}
