import { Compass, HeartHandshake, Layers } from 'lucide-react';
import { ButtonLink, Card } from '../../components/common/UI.js';
export default function About() {
  return (
    <div className="container public-page">
      <div className="eyebrow" style={{ justifyContent: 'center' }}>
        A LITTLE DIRECTION GOES A LONG WAY
      </div>
      <h1 className="about-mission">
        Making the first step
        <br />
        feel a little more possible.
      </h1>
      <p className="about-lead">
        InternTrack brings early-career opportunities and application tracking together,
        so students can focus on growing and employers can focus on finding potential.
      </p>
      <div className="about-values">
        {[
          [
            Compass,
            'A clearer direction',
            'Find opportunities that match your interests, skills, and the future you’re working toward.',
          ],
          [
            Layers,
            'Everything, together',
            'Applications, saved roles, interview dates, and updates live in one thoughtful workspace.',
          ],
          [
            HeartHandshake,
            'People before processes',
            'A calmer experience for students and hiring teams, from the first application to the final offer.',
          ],
        ].map(([Icon, title, text]) => (
          <Card key={title}>
            <Icon size={28} color="#77945b" />
            <h3>{title}</h3>
            <p>{text}</p>
          </Card>
        ))}
      </div>
      <div className="cta-panel" style={{ marginTop: 45 }}>
        <div>
          <h2>
            Built for the beginning.
            <br />
            Ready for what’s next.
          </h2>
          <p>
            Explore this interactive frontend portfolio. All listings and profiles are
            demo data.
          </p>
        </div>
        <ButtonLink to="/login" variant="lime">
          Try the demo
        </ButtonLink>
      </div>
    </div>
  );
}
