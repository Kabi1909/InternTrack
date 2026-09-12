import { useState } from 'react';
import { Button, Input, Modal, Select, Textarea } from '../common/UI';
import { useData } from '../../context/DataContext';
import { interviewService } from '../../services/interviewService';
import { useAction } from '../../hooks/useAction';
export default function InterviewModal({ open, onClose, application }) {
  const data = useData();
  const [type, setType] = useState('Video call');
  const [error, setError] = useState('');
  const { loading, run } = useAction();
  if (!application) return null;
  const candidate = data.users.find((u) => u.id === application.userId);
  const job = data.jobs.find((j) => j.id === application.jobId);
  const submit = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (new Date(values.date + 'T' + values.time) <= new Date()) {
      setError('Choose a date and time in the future.');
      return;
    }
    const result = await run(
      () =>
        interviewService.save({
          ...values,
          type,
          applicationId: application.id,
        }),
      'Interview scheduled. The candidate has been notified.',
    );
    if (result.ok) onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Start a conversation">
      <p className="note-box" style={{ marginBottom: 20 }}>
        <strong>{candidate?.name}</strong>
        <br />
        {job?.title}
      </p>
      <form className="form-stack" onSubmit={submit}>
        <div className="form-grid">
          <Input
            label="Interview date"
            name="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            required
          />
          <Input label="Time (your local timezone)" name="time" type="time" required />
        </div>
        <Select
          label="Interview type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>Video call</option>
          <option>In person</option>
          <option>Phone call</option>
        </Select>
        {type === 'Video call' && (
          <Input
            label="Meeting link"
            name="link"
            type="url"
            placeholder="https://meet.google.com/…"
            required
          />
        )}
        {type === 'In person' && (
          <Input
            label="Physical location"
            name="location"
            placeholder="Office address, floor, and room"
            required
          />
        )}
        {type === 'Phone call' && (
          <Input
            label="Phone number"
            name="location"
            type="tel"
            placeholder="Include country code"
            required
          />
        )}
        <Textarea
          label="Notes for the candidate"
          name="notes"
          placeholder="Who they’ll meet, what to prepare, and anything else to know…"
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Schedule interview
          </Button>
        </div>
      </form>
    </Modal>
  );
}
