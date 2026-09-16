import { Badge } from '../common/UI.js';
export default function ApplicationStatusBadge({ status }) {
  const tone = {
    Applied: 'neutral',
    'Under Review': 'amber',
    Shortlisted: 'purple',
    'Interview Scheduled': 'orange',
    Offered: 'green',
    Rejected: 'red',
    Withdrawn: 'neutral',
    Active: 'green',
    Closed: 'neutral',
    Expired: 'red',
    Draft: 'amber',
    Upcoming: 'orange',
    Completed: 'green',
  };
  return <Badge tone={tone[status] || 'neutral'}>{status}</Badge>;
}
