import { useState } from 'react';
import { Save, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useData } from '../../context/DataContext.js';
import {
  Avatar,
  Button,
  Card,
  CompanyLogo,
  Input,
  PageHeader,
  Textarea,
} from '../../components/common/UI.js';
import FileUpload from '../../components/profile/FileUpload.js';
import { profileService } from '../../services/profileService.js';
import { useAction } from '../../hooks/useAction.js';
export default function CompanyProfile() {
  const { user } = useAuth();
  const data = useData();
  const company = data.companies.find((c) => c.id === user.companyId);
  const [values, setValues] = useState({
    ...company,
    contactEmail: company.contactEmail || user.email,
  });
  const { loading, run } = useAction();
  const change = (key) => (e) => setValues({ ...values, [key]: e.target.value });
  return (
    <>
      <PageHeader
        eyebrow="INTRODUCE YOUR TEAM"
        title="Great talent wants to know you."
        description="Share who you are, what you believe in, and what you’re building."
      />
      <div className="profile-layout">
        <Card className="profile-summary">
          {values.picture ? (
            <Avatar name={values.name} src={values.picture} size="large" />
          ) : (
            <CompanyLogo company={values} size="large" />
          )}
          <h2>{values.name}</h2>
          <p>{values.industry}</p>
          <p>{values.location}</p>
          <div className="note-box" style={{ marginTop: 25 }}>
            Your company profile appears alongside every opportunity you post.
          </div>
        </Card>
        <Card>
          <form
            className="form-stack"
            onSubmit={(e) => {
              e.preventDefault();
              run(
                () => profileService.updateCompany(company.id, values),
                'Company profile saved',
              );
            }}
          >
            <h3>Your company, at a glance</h3>
            <FileUpload
              kind="image"
              label="Company logo"
              value={values.picture ? 'Company logo selected' : null}
              onChange={(file) => setValues({ ...values, picture: file.data })}
            />
            <div className="form-grid">
              <Input
                label="Company name"
                value={values.name}
                onChange={change('name')}
                required
              />
              <Input
                label="Industry"
                value={values.industry}
                onChange={change('industry')}
                required
              />
              <Input
                label="Website"
                type="url"
                value={values.website}
                onChange={change('website')}
                placeholder="https://yourcompany.com"
              />
              <Input
                label="Location"
                value={values.location}
                onChange={change('location')}
                required
              />
              <Input
                label="Contact email"
                type="email"
                value={values.contactEmail}
                onChange={change('contactEmail')}
                required
              />
            </div>
            <Textarea
              label="Company description"
              value={values.description}
              onChange={change('description')}
              required
              rows={6}
            />
            <div className="form-actions">
              <Button loading={loading} type="submit">
                <Save size={16} />
                Save company profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
