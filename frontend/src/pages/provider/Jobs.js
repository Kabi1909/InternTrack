import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';
import {
  Button,
  ButtonLink,
  Card,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  SearchBar,
  Select,
} from '../../components/common/UI';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import { jobService } from '../../services/jobService';
import { useAction } from '../../hooks/useAction';
import { formatDate } from '../../utils/helpers';
export default function JobManagement() {
  const { user } = useAuth();
  const data = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [confirm, setConfirm] = useState(null);
  const { loading, run } = useAction();
  const jobs = data.jobs
    .filter((j) => j.companyId === user.companyId)
    .map((j) => ({
      ...j,
      displayStatus:
        j.status === 'Active' && j.deadline < new Date().toISOString().slice(0, 10)
          ? 'Expired'
          : j.status,
    }))
    .filter(
      (j) =>
        (!status || j.displayStatus === status) &&
        j.title.toLowerCase().includes(query.toLowerCase()),
    );
  const execute = async () => {
    const result = await run(
      () =>
        confirm.action === 'delete'
          ? jobService.remove(confirm.job.id)
          : jobService.close(confirm.job.id),
      confirm.action === 'delete' ? 'Vacancy deleted' : 'Vacancy closed',
    );
    if (result.ok) setConfirm(null);
  };
  return (
    <>
      <PageHeader
        eyebrow="MAKE ROOM FOR GREAT TALENT"
        title="Your team’s next chapter."
        description="Manage opportunities, meet potential, and keep hiring moving."
        action={
          <ButtonLink to="/provider/jobs/new">
            <Plus size={16} />
            Post an opportunity
          </ButtonLink>
        }
      />
      <div className="filter-row">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search your vacancies"
        />
        <Select
          aria-label="Filter vacancy status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {['Active', 'Closed', 'Expired', 'Draft'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>
      <Card className="table-wrap" style={{ padding: 0 }}>
        {jobs.length ? (
          <table className="data-table">
            <thead>
              <tr>
                {[
                  'Opportunity',
                  'Created',
                  'Deadline',
                  'Applicants',
                  'Status',
                  'Actions',
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td data-label="Opportunity">
                    <div>
                      <strong>{j.title}</strong>
                      <small>
                        {j.type} · {j.mode}
                      </small>
                    </div>
                  </td>
                  <td data-label="Created">{formatDate(j.createdAt)}</td>
                  <td data-label="Deadline">{formatDate(j.deadline)}</td>
                  <td data-label="Applicants">
                    {data.applications.filter((a) => a.jobId === j.id).length}
                  </td>
                  <td data-label="Status">
                    <ApplicationStatusBadge status={j.displayStatus} />
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      <ButtonLink variant="secondary" to={`/jobs/${j.id}`}>
                        View
                      </ButtonLink>
                      <ButtonLink variant="secondary" to={`/provider/jobs/${j.id}/edit`}>
                        Edit
                      </ButtonLink>
                      <ButtonLink
                        variant="secondary"
                        to={`/provider/jobs/${j.id}/applicants`}
                      >
                        Applicants
                      </ButtonLink>
                      {j.displayStatus === 'Active' && (
                        <Button
                          variant="ghost"
                          onClick={() => setConfirm({ job: j, action: 'close' })}
                        >
                          Close
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        onClick={() => setConfirm({ job: j, action: 'delete' })}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="Make your next great hire possible"
            description="Post a new opportunity or adjust your filters."
            action={
              <ButtonLink to="/provider/jobs/new">Create an opportunity</ButtonLink>
            }
          />
        )}
      </Card>
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={
          confirm?.action === 'delete' ? 'Delete this vacancy?' : 'Close applications?'
        }
        description={
          confirm?.action === 'delete'
            ? `“${confirm?.job.title}” will be removed. Existing application records are kept as archived opportunities.`
            : `“${confirm?.job.title}” will stop accepting applications. Existing candidates stay in your pipeline.`
        }
        loading={loading}
        onConfirm={execute}
      />
    </>
  );
}
