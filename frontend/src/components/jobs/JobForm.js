import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, SkillTags, Textarea } from '../common/UI.js';
import { categories } from '../../data/mockData.js';
import { jobService } from '../../services/jobService.js';
import { useAction } from '../../hooks/useAction.js';
export default function JobForm({ job, company }) {
  const navigate = useNavigate();
  const [skills, setSkills] = useState(job?.skills || []);
  const [error, setError] = useState('');
  const { loading, run } = useAction();
  const submit = async (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(e.currentTarget));
    const status = e.nativeEvent.submitter?.value || 'Active';
    if (!skills.length) {
      setError('Add at least one required skill.');
      return;
    }
    const result = await run(
      () =>
        jobService.save({
          ...job,
          ...values,
          skills,
          companyId: company.id,
          positions: Number(values.positions),
          status,
        }),
      status === 'Draft' ? 'Draft saved' : 'Opportunity saved and published',
    );
    if (result.ok) navigate('/provider/jobs');
  };
  return (
    <form className="form-stack" onSubmit={submit}>
      <h3>The opportunity</h3>
      <div className="form-grid">
        <Input
          label="Job title"
          name="title"
          defaultValue={job?.title}
          placeholder="e.g. Frontend Developer Intern"
          required
        />
        <Input label="Company" value={company.name} readOnly />
        <Select
          label="Category"
          name="category"
          defaultValue={job?.category || categories[0]}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Select
          label="Employment type"
          name="type"
          defaultValue={job?.type || 'Internship'}
        >
          <option>Internship</option>
          <option>Full-time</option>
          <option>Part-time</option>
        </Select>
      </div>
      <Textarea
        label="Job description"
        name="description"
        defaultValue={job?.description}
        placeholder="Introduce the role and what makes it special…"
        required
        minLength={30}
      />
      <Textarea
        label="Responsibilities (one per line)"
        name="responsibilities"
        defaultValue={job?.responsibilities}
        required
      />
      <Textarea
        label="Qualifications (one per line)"
        name="qualifications"
        defaultValue={job?.qualifications}
        required
      />
      <SkillTags value={skills} onChange={setSkills} />
      <h3>The practical details</h3>
      <div className="form-grid">
        <Select label="Work arrangement" name="mode" defaultValue={job?.mode || 'Hybrid'}>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>Onsite</option>
        </Select>
        <Input
          label="Location"
          name="location"
          defaultValue={job?.location || company.location}
          required
        />
        <Input
          label="Salary / allowance"
          name="salary"
          defaultValue={job?.salary}
          placeholder="e.g. LKR 50,000 – 70,000 / month"
          required
        />
        <Input
          label="Application deadline"
          name="deadline"
          type="date"
          defaultValue={job?.deadline}
          min={new Date().toISOString().slice(0, 10)}
          required
        />
        <Input
          label="Number of positions"
          name="positions"
          type="number"
          min="1"
          max="100"
          defaultValue={job?.positions || 1}
          required
        />
        <Select
          label="Experience requirements"
          name="experience"
          defaultValue={job?.experience || 'No experience'}
        >
          <option>No experience</option>
          <option>Entry level</option>
          <option>1–2 years</option>
        </Select>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={() => navigate('/provider/jobs')}>
          Cancel
        </Button>
        <Button type="submit" variant="secondary" value="Draft" loading={loading}>
          Save as draft
        </Button>
        <Button type="submit" value="Active" loading={loading}>
          {job ? 'Save & publish changes' : 'Publish opportunity'}
        </Button>
      </div>
    </form>
  );
}
