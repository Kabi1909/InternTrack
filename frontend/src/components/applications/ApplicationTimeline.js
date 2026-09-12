import { Check } from "lucide-react";
const stages = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview Scheduled",
  "Offered",
];
export default function ApplicationTimeline({ application }) {
  const index = stages.indexOf(application.status);
  return (
    <div className="timeline" aria-label="Application progress">
      {stages.map((stage, i) => {
        const complete =
          index >= 0
            ? i < index
            : application.history.some((h) => h.status === stage);
        return (
          <div
            key={stage}
            className={`timeline-step ${complete ? "done" : ""} ${i === index ? "current" : ""}`}
            aria-current={i === index ? "step" : undefined}
          >
            <span>{complete ? <Check size={15} /> : i + 1}</span>
            {stage}
          </div>
        );
      })}
    </div>
  );
}
