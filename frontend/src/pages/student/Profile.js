import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  PageHeader,
  SkillTags,
} from '../../components/common/UI';
import FileUpload from '../../components/profile/FileUpload';
import { profileService } from '../../services/profileService';
import { useAction } from '../../hooks/useAction';
export default function StudentProfile() {
  const { user } = useAuth();
  const [values, setValues] = useState({ ...user });
  const { loading, run } = useAction();
  const change = (key) => (e) => setValues({ ...values, [key]: e.target.value });
  const completion = Math.round(
    ([
      'name',
      'email',
      'phone',
      'university',
      'degree',
      'graduation',
      'skills',
      'preferredRoles',
      'location',
      'linkedin',
      'github',
      'cv',
      'picture',
    ].filter((k) => values[k]?.length > 0).length /
      13) *
      100,
  );
  const save = (e) => {
    e.preventDefault();
    run(
      () => profileService.updateUser(user.id, values),
      'Your profile is looking good. Changes saved.',
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="LET YOUR POTENTIAL DO THE TALKING"
        title="Your story, in the making."
        description="A complete profile helps the right opportunity find you."
      />
      <div className="profile-layout">
        <Card className="profile-summary">
          <Avatar name={values.name} src={values.picture} size="large" />
          <h2>{values.name}</h2>
          <p>{values.degree || 'Your next chapter starts here'}</p>
          <p>{values.university}</p>
          <div style={{ marginTop: 25 }}>
            <Badge tone="green">
              <CheckCircle2 size={12} />
              {completion}% complete
            </Badge>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Profile completion"
            >
              <div style={{ width: `${completion}%` }} />
            </div>
            <p style={{ fontSize: 10 }}>A little more detail. A little more you.</p>
          </div>
          <div className="job-tags" style={{ justifyContent: 'center' }}>
            {values.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </Card>
        <Card>
          <form className="form-stack" onSubmit={save}>
            <h3>The essentials</h3>
            <FileUpload
              label="Profile picture"
              kind="image"
              value={values.picture ? 'Profile picture selected' : null}
              onChange={(file) => setValues({ ...values, picture: file.data })}
            />
            <div className="form-grid">
              <Input
                label="Full name"
                value={values.name}
                onChange={change('name')}
                required
              />
              <Input
                label="Email address"
                type="email"
                value={values.email}
                onChange={change('email')}
                required
              />
              <Input
                label="Phone number"
                type="tel"
                value={values.phone || ''}
                onChange={change('phone')}
              />
              <Input
                label="University"
                value={values.university || ''}
                onChange={change('university')}
                required
              />
              <Input
                label="Degree / program"
                value={values.degree || ''}
                onChange={change('degree')}
                required
              />
              <Input
                label="Graduation year"
                type="number"
                min="2000"
                max="2040"
                value={values.graduation || ''}
                onChange={change('graduation')}
              />
            </div>
            <h3>Your skills & ambitions</h3>
            <SkillTags
              value={values.skills}
              onChange={(skills) => setValues({ ...values, skills })}
            />
            <div className="form-grid">
              <Input
                label="Preferred job roles"
                placeholder="Frontend Developer, Product Designer"
                value={values.preferredRoles || ''}
                onChange={change('preferredRoles')}
              />
              <Input
                label="Preferred work location"
                value={values.location || ''}
                onChange={change('location')}
              />
              <Input
                label="LinkedIn URL"
                type="url"
                placeholder="https://linkedin.com/in/you"
                value={values.linkedin || ''}
                onChange={change('linkedin')}
              />
              <Input
                label="GitHub URL"
                type="url"
                placeholder="https://github.com/you"
                value={values.github || ''}
                onChange={change('github')}
              />
            </div>
            <h3>Put your experience on paper</h3>
            <FileUpload
              value={values.cv}
              onChange={(file) =>
                setValues({ ...values, cv: file.name, cvData: file.data })
              }
            />
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setValues({ ...user })}
              >
                Reset changes
              </Button>
              <Button type="submit" loading={loading}>
                <Save size={16} />
                Save profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
