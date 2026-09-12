import { ArrowUpRight } from 'lucide-react';
import { Card } from '../common/UI.js';
export default function StatCard({ label, value, icon: Icon, description }) {
  return (
    <Card className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        {Icon && <Icon size={19} />}
      </div>
      <strong>{value}</strong>
      <small>
        {description || 'Across your workspace'}
        <ArrowUpRight size={13} />
      </small>
    </Card>
  );
}
