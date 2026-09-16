import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Card } from '../common/UI.js';
const statusColors = {
  Applied: 'var(--color-text-secondary)',
  'Under Review': 'var(--color-accent)',
  Shortlisted: 'var(--color-primary)',
  'Interview Scheduled': 'var(--color-interview)',
  Offered: 'var(--color-success)',
  Rejected: 'var(--color-error)',
  Withdrawn: '#a1a1aa',
};
export default function Analytics({
  applications,
  jobs,
  provider = false,
  analytics = {},
}) {
  const statusData = (analytics.applicationsByStatus || []).map((row) => ({
    name: row.status,
    value: row.count,
  }));
  const activity = Array.from({ length: 6 }, (_, index) => {
    const start = new Date();
    start.setDate(start.getDate() - 35 + index * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
      name: start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      applications: applications.filter(
        (a) => new Date(a.appliedAt) >= start && new Date(a.appliedAt) < end,
      ).length,
    };
  });
  const vacancyData = (analytics.applicantsByJob || []).map((row) => ({
    name: row.title.slice(0, 18),
    applications: row.count,
  }));
  return (
    <div className="charts-grid">
      <Card className="chart-card">
        <h3>{provider ? 'Applicants by vacancy' : 'A little progress, every week'}</h3>
        <p>
          {provider
            ? 'See which opportunities are drawing interest.'
            : 'Your applications over the last six weeks.'}
        </p>
        <div
          className="chart-wrap"
          role="img"
          aria-label={
            provider
              ? 'Applicants per vacancy bar chart'
              : 'Weekly application count area chart'
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            {provider ? (
              <BarChart
                data={vacancyData}
                margin={{ left: -20, right: 12, top: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="applications"
                  fill="var(--color-primary)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            ) : (
              <AreaChart
                data={activity}
                margin={{ left: -20, right: 12, top: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--color-primary)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#activityFill)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="chart-card">
        <h3>{provider ? 'Your recruitment pipeline' : 'Where things stand'}</h3>
        <p>Every application has a story.</p>
        <div
          className="chart-wrap"
          style={{ height: 192 }}
          role="img"
          aria-label={`Application statuses: ${statusData.map((s) => `${s.name} ${s.value}`).join(', ')}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  statusData.length ? statusData : [{ name: 'No applications', value: 1 }]
                }
                dataKey="value"
                innerRadius={58}
                outerRadius={77}
                paddingAngle={4}
                stroke="none"
              >
                {(statusData.length ? statusData : [{}]).map((s) => (
                  <Cell
                    key={s.name || 'empty'}
                    fill={statusColors[s.name] || 'var(--color-secondary)'}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          {statusData.map((s) => (
            <span key={s.name}>
              <i
                style={{ background: statusColors[s.name] || 'var(--color-secondary)' }}
              />
              {s.name} ({s.value})
            </span>
          ))}
          {!statusData.length && <span>No applications yet</span>}
        </div>
      </Card>
    </div>
  );
}
