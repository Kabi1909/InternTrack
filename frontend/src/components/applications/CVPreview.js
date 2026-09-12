import { useState } from 'react';
import { Button, Modal } from '../common/UI.js';
import { downloadText } from '../../utils/helpers.js';
export default function CVPreview({ application, candidate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        View submitted CV
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={application.cv || 'Candidate CV'}
      >
        {application.cvData ? (
          <>
            <p className="muted">This document was uploaded in your demo browser.</p>
            <a
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              href={application.cvData}
              download={application.cv}
            >
              Download CV
            </a>
          </>
        ) : (
          <>
            <p className="banner-note">
              Illustrative CV preview — no real PDF is attached to seeded demo records.
            </p>
            <div className="cv-preview" style={{ margin: '20px 0' }}>
              <h3>{candidate?.name}</h3>
              <p>
                {candidate?.degree} · {candidate?.university}
              </p>
              <p>Graduation: {candidate?.graduation}</p>
              <p>Skills: {candidate?.skills?.join(', ')}</p>
              <p>
                Projects: Collaborative web applications, accessible interfaces, and
                university coursework.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() =>
                downloadText(
                  'demo-resume.txt',
                  `${candidate?.name}\n${candidate?.degree}\n${candidate?.university}\nSkills: ${candidate?.skills?.join(', ')}\nIllustrative InternTrack demo resume`,
                )
              }
            >
              Download demo summary
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
