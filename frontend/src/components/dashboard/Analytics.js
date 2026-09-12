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
import { Card } from '../common/UI';
const colors = [
  '#7c9e60',
  '#bfd39d',
  '#dfca88',
  '#8faeab',
  '#b0a0c0',
  '#d8a394',
  '#c9d0c0',
];
export default function Analytics({ applications, jobs, provider = false }) {
  const statusData = [...new Set(applications.map((a) => a.status))].map((name) => ({
    name,
    value: applications.filter((a) => a.status === name).length,
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
  const vacancyData = jobs.map((j) => ({
    name: j.title.replace(' Intern', '').slice(0, 18),
    applications: applications.filter((a) => a.jobId === j.id).length,
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaf0e2" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#919d83' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#919d83' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar
                  dataKey="applications"
                  fill="#86a565"
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
                    <stop offset="0%" stopColor="#b5d293" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#b5d293" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaf0e2" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: '#919d83' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#919d83' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="#82a55e"
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
                {(statusData.length ? statusData : [{}]).map((s, i) => (
                  <Cell key={s.name || 'empty'} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          {statusData.map((s, i) => (
            <span key={s.name}>
              <i style={{ background: colors[i] }} />
              {s.name} ({s.value})
            </span>
          ))}
          {!statusData.length && <span>No applications yet</span>}
        </div>
      </Card>
    </div>
  );
}
