import { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useData } from '../../context/DataContext.js';
import { Button, Card, EmptyState, PageHeader } from '../../components/common/UI.js';
import NotificationItem from '../../components/notifications/NotificationItem.js';
import { notificationService } from '../../services/notificationService.js';
import { useAction } from '../../hooks/useAction.js';
export default function Notifications() {
  const { user } = useAuth();
  const data = useData();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { loading, run } = useAction();
  const all = data.notifications.filter((n) => n.userId === user.id);
  const unread = all.filter((n) => !n.read).length;
  const notifications = all.filter((n) => !unreadOnly || !n.read);
  return (
    <>
      <PageHeader
        eyebrow="STAY IN THE KNOW"
        title="A little update can mean a lot."
        description={`You have ${unread} unread ${unread === 1 ? 'update' : 'updates'}. Here’s what’s happening in your workspace.`}
        action={
          <Button
            variant="secondary"
            loading={loading}
            disabled={!unread}
            onClick={() =>
              run(
                () => notificationService.markAll(user.id),
                'All caught up. Notifications marked as read.',
              )
            }
          >
            <CheckCheck size={16} />
            Mark all as read
          </Button>
        }
      />
      <div className="segmented" style={{ marginBottom: 25 }}>
        <button
          className={!unreadOnly ? 'active' : ''}
          aria-pressed={!unreadOnly}
          onClick={() => setUnreadOnly(false)}
        >
          All updates ({all.length})
        </button>
        <button
          className={unreadOnly ? 'active' : ''}
          aria-pressed={unreadOnly}
          onClick={() => setUnreadOnly(true)}
        >
          Unread ({unread})
        </button>
      </div>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {notifications.length ? (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onRead={(id) => run(() => notificationService.markRead(id))}
            />
          ))
        ) : (
          <EmptyState
            title="You’re all caught up."
            description="Take a breath. We’ll keep your next important update right here."
          />
        )}
      </Card>
    </>
  );
}
