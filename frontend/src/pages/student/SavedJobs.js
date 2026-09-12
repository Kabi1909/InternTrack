import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { ButtonLink, EmptyState, PageHeader } from '../../components/common/UI.js';
import JobCard from '../../components/jobs/JobCard.js';
export default function SavedJobs() {
  const data = useData();
  const { user } = useAuth();
  const jobs = data.jobs.filter((j) => (data.saved[user.id] || []).includes(j.id));
  return (
    <>
      <PageHeader
        eyebrow="KEEP YOUR POSSIBILITIES CLOSE"
        title="Worth a second look."
        description={`${jobs.length} saved opportunities. Come back when the moment feels right.`}
        action={<ButtonLink to="/jobs">Discover more</ButtonLink>}
      />
      {jobs.length ? (
        <div className="job-grid">
          {jobs.map((job) => (
            <div key={job.id}>
              <JobCard job={job} />
              <ButtonLink variant="ghost" className="full-width" to={`/jobs/${job.id}`}>
                Apply now
              </ButtonLink>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="A home for your maybes"
          description="Save an opportunity by tapping its bookmark. You’ll find it right here."
          action={<ButtonLink to="/jobs">Find your next possibility</ButtonLink>}
        />
      )}
    </>
  );
}
