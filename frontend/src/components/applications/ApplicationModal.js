import { useState } from 'react';
import { Modal, Button, Select, Textarea } from '../common/UI.js';
import FileUpload from '../profile/FileUpload.js';
import { useAuth } from '../../context/AuthContext.js';
import { applicationService } from '../../services/applicationService.js';
import { useAction } from '../../hooks/useAction.js';
export default function ApplicationModal({ open, onClose, job, onSuccess }) {
  const { user } = useAuth();
  const [cv, setCv] = useState(null);
  const [source, setSource] = useState(user?.cv ? 'profile' : 'upload');
  const [error, setError] = useState('');
  const { loading, run } = useAction();
  const submit = async (e) => {
    e.preventDefault();
    const selected = source === 'profile' ? { name: user.cv, data: user.cvData } : cv;
    if (!selected?.name) {
      setError('Please select or upload your CV.');
      return;
    }
    const form = new FormData(e.currentTarget);
    const result = await run(
      () =>
        applicationService.apply({
          userId: user.id,
          jobId: job.id,
          cv: selected.name,
          cvData: selected.data,
          cvUpload: source === 'profile' ? user.cvUpload : undefined,
          coverLetter: form.get('coverLetter'),
        }),
      'Application submitted. You’ve taken the first step!',
    );
    if (result.ok) {
      onClose();
      onSuccess?.(result.result);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Make your next move">
      <p className="muted" style={{ fontSize: 13, marginBottom: 22 }}>
        Apply for <strong>{job.title}</strong>. Show the team what makes you, you.
      </p>
      <form className="form-stack" onSubmit={submit}>
        <Select
          label="Choose your CV"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {user?.cv && <option value="profile">Profile CV — {user.cv}</option>}
          <option value="upload">Upload a different CV</option>
        </Select>
        {source === 'upload' && <FileUpload value={cv} onChange={setCv} />}
        <Textarea
          label="Cover letter"
          name="coverLetter"
          placeholder="Tell the team why this opportunity feels right for you…"
          required
          minLength={20}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <p className="banner-note">
          Your CV and cover letter will be shared with the provider for this opportunity.
        </p>
        <div className="form-actions">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Submit application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
