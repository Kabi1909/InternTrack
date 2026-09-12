import { Bell, Check, Video, FileText, Clock3, Users } from "lucide-react";
import { formatDate } from "../../utils/helpers";
const icons = {
  "Interview scheduled": Video,
  "Application submitted": FileText,
  "Deadline approaching": Clock3,
  "Job closing soon": Clock3,
  "New applicant received": Users,
};
export default function NotificationItem({ notification, onRead }) {
  const Icon = icons[notification.type] || Bell;
  return (
    <article
      className={`notification-item ${notification.read ? "" : "unread"}`}
    >
      <span className="notification-icon">
        <Icon size={19} />
      </span>
      <div>
        <h3>{notification.title}</h3>
        <p>{notification.message}</p>
        <small>
          {notification.type} · {formatDate(notification.createdAt)}
        </small>
      </div>
      {!notification.read && (
        <button
          className="icon-btn"
          aria-label={`Mark as read: ${notification.title}`}
          title="Mark as read"
          onClick={() => onRead(notification.id)}
        >
          <Check size={16} />
        </button>
      )}
    </article>
  );
}
