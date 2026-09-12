import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, MapPin } from 'lucide-react';
import { useData } from '../../context/DataContext.js';
import { jobService } from '../../services/jobService.js';
import {
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Pagination,
  SearchBar,
  Skeleton,
} from '../../components/common/UI.js';
import FilterPanel from '../../components/jobs/FilterPanel.js';
import JobCard from '../../components/jobs/JobCard.js';
const empty = { type: [], mode: [], experience: '', category: '', skills: '' };
export default function BrowseJobs() {
  const data = useData();
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobile, setMobile] = useState(false);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const filters = {
    ...empty,
    type: params.getAll('type'),
    mode: params.getAll('mode'),
    category: params.get('category') || '',
    experience: params.get('experience') || '',
    skills: params.get('skills') || '',
  };
  const query = params.get('q') || '';
  const location = params.get('location') || '';
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      next.delete(key);
      (Array.isArray(value) ? value : [value])
        .filter(Boolean)
        .forEach((v) => next.append(key, v));
    });
    setParams(next, { replace: true });
    setPage(1);
  };
  const load = () => {
    setLoading(true);
    setError('');
    jobService
      .list()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const results = data.jobs
    .filter((job) => {
      const company = data.companies.find((c) => c.id === job.companyId);
      return (
        job.status === 'Active' &&
        job.deadline >= new Date().toISOString().slice(0, 10) &&
        `${job.title} ${company?.name} ${job.skills.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        `${job.location || company?.location} ${job.mode}`
          .toLowerCase()
          .includes(location.toLowerCase()) &&
        (!filters.type.length || filters.type.includes(job.type)) &&
        (!filters.mode.length || filters.mode.includes(job.mode)) &&
        (!filters.category || job.category === filters.category) &&
        (!filters.experience || job.experience === filters.experience) &&
        (!filters.skills ||
          job.skills.some((s) => s.toLowerCase().includes(filters.skills.toLowerCase())))
      );
    })
    .sort((a, b) =>
      sort === 'deadline'
        ? a.deadline.localeCompare(b.deadline)
        : sort === 'title'
          ? a.title.localeCompare(b.title)
          : b.createdAt.localeCompare(a.createdAt),
    );
  const filterProps = {
    filters,
    onChange: update,
    onClear: () => update(empty),
  };
  return (
    <div className="container public-page">
      <PageHeader
        eyebrow="YOUR POSSIBILITIES START HERE"
        title="Find work that feels like you."
        description="A first step, a fresh direction, or your next big opportunity."
      />
      <div className="search-toolbar">
        <SearchBar
          value={query}
          onChange={(q) => update({ q })}
          placeholder="Search job titles, skills, or companies"
        />
        <Input
          aria-label="Filter by location"
          placeholder="City, country, or remote"
          value={location}
          onChange={(e) => update({ location: e.target.value })}
        />
        <Button
          variant="secondary"
          className="mobile-filter"
          onClick={() => setMobile(true)}
        >
          <SlidersHorizontal size={17} />
          Filters
        </Button>
      </div>
      <div className="browse-layout">
        <FilterPanel {...filterProps} />
        <section className="browse-results">
          <div className="results-bar">
            <span>
              <strong>{results.length}</strong> opportunities for your next chapter
            </span>
            <select
              aria-label="Sort opportunities"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest first</option>
              <option value="deadline">Closing soon</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
          {loading ? (
            <Skeleton count={4} />
          ) : error ? (
            <EmptyState
              title="Couldn’t load opportunities"
              description={error}
              action={<Button onClick={load}>Try again</Button>}
            />
          ) : results.length ? (
            <>
              <div className="job-grid">
                {results.slice((page - 1) * 6, page * 6).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <Pagination
                page={page}
                total={Math.ceil(results.length / 6)}
                onChange={setPage}
              />
            </>
          ) : (
            <EmptyState
              title="No matches just yet"
              description="Try a broader search or clear your filters to discover more possibilities."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setParams({});
                    setPage(1);
                  }}
                >
                  Clear all filters
                </Button>
              }
            />
          )}
        </section>
      </div>
      <Modal open={mobile} onClose={() => setMobile(false)} title="Find your fit">
        <FilterPanel {...filterProps} />
        <Button
          className="full-width"
          style={{ marginTop: 20 }}
          onClick={() => setMobile(false)}
        >
          Show {results.length} opportunities
        </Button>
      </Modal>
    </div>
  );
}
