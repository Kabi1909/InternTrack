import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useData } from '../../context/DataContext.js';
import { Button, Card, Input, Modal, PageHeader } from '../../components/common/UI.js';
import { mutate, uid } from '../../services/mockStore.js';
import { useAction } from '../../hooks/useAction.js';
export default function Calendar() {
  const { user } = useAuth();
  const data = useData();
  const [month, setMonth] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const { loading, run } = useAction();
  const dateKey = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const events = [
    ...data.interviews
      .filter((i) => i.userId === user.id)
      .map((i) => ({
        date: i.date,
        title: `${i.time} · ${data.jobs.find((j) => j.id === i.jobId)?.title || 'Interview'}`,
        type: 'interview',
        to: '/student/interviews',
      })),
    ...data.jobs
      .filter((j) => (data.saved[user.id] || []).includes(j.id) && j.status === 'Active')
      .map((j) => ({
        date: j.deadline,
        title: j.title,
        type: 'deadline',
        to: `/jobs/${j.id}`,
      })),
    ...data.followups
      .filter((f) => f.userId === user.id)
      .map((f) => ({ ...f, type: 'followup' })),
  ];
  const start = new Date(month);
  start.setDate(1 - start.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  return (
    <>
      <PageHeader
        eyebrow="A LITTLE PLANNING GOES A LONG WAY"
        title="Make space for your future."
        description="Interviews, saved-job deadlines, and follow-ups, at a glance."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add follow-up
          </Button>
        }
      />
      <Card className="calendar-card">
        <div className="calendar-toolbar">
          <h2>
            {month.toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </h2>
          <div className="inline-row">
            <button
              className="icon-btn"
              aria-label="Previous month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={18} />
            </button>
            <Button
              variant="secondary"
              onClick={() =>
                setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
              }
            >
              Today
            </Button>
            <button
              className="icon-btn"
              aria-label="Next month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div className="calendar-day-name" key={d}>
              {d}
            </div>
          ))}
          {days.map((d) => (
            <div
              className={`calendar-cell ${d.getMonth() !== month.getMonth() ? 'other-month' : ''} ${dateKey(d) === dateKey(new Date()) ? 'today' : ''}`}
              key={dateKey(d)}
            >
              <span>{d.getDate()}</span>
              {events
                .filter((e) => e.date === dateKey(d))
                .map((e, i) =>
                  e.to ? (
                    <Link
                      key={i}
                      title={e.title}
                      className={`calendar-event ${e.type}`}
                      to={e.to}
                    >
                      {e.title}
                    </Link>
                  ) : (
                    <button
                      key={i}
                      title={e.title}
                      className="calendar-event followup"
                      onClick={() => setSelected(e)}
                    >
                      {e.title}
                    </button>
                  ),
                )}
            </div>
          ))}
        </div>
        <div className="calendar-agenda">
          <h3>This month, at a glance</h3>
          {events
            .filter((event) => event.date.startsWith(dateKey(month).slice(0, 7)))
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((event, index) => (
              <div className="list-item" key={index}>
                <span className="date-tile">{Number(event.date.slice(-2))}</span>
                <div>
                  <h3>
                    {event.to ? (
                      <Link to={event.to}>{event.title}</Link>
                    ) : (
                      <button onClick={() => setSelected(event)}>{event.title}</button>
                    )}
                  </h3>
                  <p>{event.type}</p>
                </div>
              </div>
            ))}
        </div>
        <div className="calendar-legend">
          <span>
            <i />
            Interviews
          </span>
          <span>
            <i className="deadline" />
            Saved-job deadlines
          </span>
          <span>
            <i className="followup" />
            Follow-ups
          </span>
        </div>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="A reminder for future you">
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const values = Object.fromEntries(new FormData(e.currentTarget));
            const result = await run(
              () =>
                mutate((d) => {
                  d.followups.push({
                    ...values,
                    id: uid('f'),
                    userId: user.id,
                  });
                }),
              'Follow-up added to your calendar',
            );
            if (result.ok) setOpen(false);
          }}
        >
          <Input
            label="What would you like to follow up on?"
            name="title"
            required
            maxLength={100}
          />
          <Input label="Date" name="date" type="date" required />
          <Button loading={loading} type="submit">
            Save follow-up
          </Button>
        </form>
      </Modal>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Your follow-up">
        <p>{selected?.title}</p>
        <p className="muted">{selected?.date}</p>
        <Button
          variant="secondary"
          style={{ marginTop: 20 }}
          onClick={async () => {
            const result = await run(
              () =>
                mutate((d) => {
                  d.followups = d.followups.filter((f) => f.id !== selected.id);
                }),
              'Follow-up completed',
            );
            if (result.ok) setSelected(null);
          }}
        >
          Mark complete
        </Button>
      </Modal>
    </>
  );
}
