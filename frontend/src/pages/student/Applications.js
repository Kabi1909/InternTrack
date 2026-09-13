import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useData } from '../../context/DataContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  ButtonLink,
  Card,
  CompanyLogo,
  EmptyState,
  Input,
  PageHeader,
  SearchBar,
  Select,
} from '../../components/common/UI.js';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge.js';
import { statuses } from '../../data/options.js';
import { formatDate } from '../../utils/helpers.js';
export default function Applications() {
  const data = useData();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [company, setCompany] = useState('');
  const [date, setDate] = useState('');
  const applications = data.applications.filter((a) => {
    const job = data.jobs.find((j) => j.id === a.jobId);
    return (
      a.userId === user.id &&
      (!status || a.status === status) &&
      (!company || job?.companyId === company) &&
      (!date || a.appliedAt.slice(0, 10) >= date) &&
      (!query || job?.title.toLowerCase().includes(query.toLowerCase()))
    );
  });
  return (
    <>
      <PageHeader
        eyebrow="EVERY STEP COUNTS"
        title="Your journey, all in one place."
        description="Keep track of every possibility, from first hello to final offer."
        action={<ButtonLink to="/jobs">Find your next opportunity</ButtonLink>}
      />
      <div className="filter-row">
        <SearchBar value={query} onChange={setQuery} placeholder="Search applications" />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select
          aria-label="Filter by company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option value="">All companies</option>
          {data.companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Applied on or after"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <Card className="table-wrap" style={{ padding: 0 }}>
        {applications.length ? (
          <table className="data-table">
            <thead>
              <tr>
                {['Opportunity', 'Date applied', 'Status', 'Last updated', 'Actions'].map(
                  (h) => (
                    <th key={h}>{h}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => {
                const job = data.jobs.find((j) => j.id === a.jobId);
                const c = data.companies.find((c) => c.id === job?.companyId);
                return (
                  <tr key={a.id}>
                    <td data-label="Opportunity">
                      <div className="inline-row">
                        <CompanyLogo company={c} />
                        <div>
                          <Link to={`/student/applications/${a.id}`}>
                            <strong>{job?.title || 'Archived opportunity'}</strong>
                          </Link>
                          <small>{c?.name || 'Company unavailable'}</small>
                        </div>
                      </div>
                    </td>
                    <td data-label="Applied">{formatDate(a.appliedAt)}</td>
                    <td data-label="Status">
                      <ApplicationStatusBadge status={a.status} />
                    </td>
                    <td data-label="Updated">{formatDate(a.updatedAt)}</td>
                    <td data-label="Actions">
                      <Link className="text-link" to={`/student/applications/${a.id}`}>
                        View details <ArrowUpRight size={15} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title="No applications to show"
            description="Try adjusting your filters, or take the first step toward your next opportunity."
            action={<ButtonLink to="/jobs">Browse opportunities</ButtonLink>}
          />
        )}
      </Card>
    </>
  );
}
