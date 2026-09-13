import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Button, Input, Modal } from '../../components/common/UI.js';
import { useAction } from '../../hooks/useAction.js';
export default function AuthPage({ register = false }) {
  const [params] = useSearchParams();
  const [role, setRole] = useState(
    params.get('role') === 'provider' ? 'provider' : 'student',
  );
  const [show, setShow] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const { loading, run } = useAction();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (user) => {
    const from = location.state?.from;
    return from &&
      ((!from.startsWith('/student') && !from.startsWith('/provider')) ||
        from.startsWith('/' + user.role))
      ? from
      : `/${user.role}/dashboard`;
  };
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget));
    if (register && values.password !== values.confirmPassword) {
      setError('Passwords don’t match. Please try again.');
      return;
    }
    if (
      register &&
      (!/[A-Z]/.test(values.password) ||
        !/[0-9]/.test(values.password) ||
        values.password.length < 8)
    ) {
      setError('Use at least 8 characters, one uppercase letter, and one number.');
      return;
    }
    const result = await run(
      () =>
        register
          ? auth.register({ ...values, role })
          : auth.login({ ...values, remember: values.remember === 'on' }),
      register ? 'Welcome to your next chapter!' : 'Welcome back!',
    );
    if (result.ok) navigate(destination(result.result), { replace: true });
  };
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  return (
    <div className="auth-page">
      <aside className="auth-story">
        <div className="eyebrow">
          <Sparkles size={16} />
          YOUR POTENTIAL. YOUR POSSIBILITIES.
        </div>
        <h2>
          Every great story
          <br />
          starts with
          <br />
          <em>a first step.</em>
        </h2>
        <p>
          A thoughtful space to discover opportunities, keep moving forward, and build a
          future that feels like you.
        </p>
        <div className="auth-quote">
          “A little clarity can turn a world of possibilities into your next big
          opportunity.”<small>THE INTERNTRACK PHILOSOPHY</small>
        </div>
      </aside>
      <div className="auth-form-wrap">
        <div className="eyebrow">
          {register ? 'LET’S GET YOU STARTED' : 'GOOD TO SEE YOU AGAIN'}
        </div>
        <h1>{register ? 'Your next chapter awaits.' : 'Welcome back.'}</h1>
        <p>
          {register
            ? 'Create your free account and take the first step.'
            : 'Pick up where you left off. Your future is waiting.'}
        </p>
        {register && (
          <div className="role-picker">
            <button
              className={role === 'student' ? 'active' : ''}
              aria-pressed={role === 'student'}
              onClick={() => setRole('student')}
            >
              <GraduationCap size={20} />
              Student / Graduate
            </button>
            <button
              className={role === 'provider' ? 'active' : ''}
              aria-pressed={role === 'provider'}
              onClick={() => setRole('provider')}
            >
              <Building2 size={20} />
              Job Provider
            </button>
          </div>
        )}
        <form className="form-stack" onSubmit={submit}>
          {register && (
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Your full name"
              required
            />
          )}
          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
          <div className="password-wrap">
            <Input
              label="Password"
              name="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              type={show ? 'text' : 'password'}
              placeholder={register ? 'At least 8 characters' : 'Enter your password'}
              minLength={register ? 8 : 1}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              aria-label={show ? 'Hide password' : 'Show password'}
              onClick={() => setShow(!show)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {register && (
            <>
              <div style={{ marginTop: -12 }}>
                <div className="strength">
                  <div style={{ width: `${strength * 25}%` }} />
                </div>
                <p className="strength-label">
                  {
                    [
                      'Use 8+ characters, uppercase, and a number.',
                      'Getting started',
                      'Getting stronger',
                      'Good password',
                      'Strong password',
                    ][strength]
                  }
                </p>
              </div>
              <Input
                label="Confirm password"
                name="confirmPassword"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                required
              />
              {role === 'student' ? (
                <div className="form-grid">
                  <Input label="University" name="university" required />
                  <Input label="Degree / program" name="degree" required />
                </div>
              ) : (
                <div className="form-grid">
                  <Input label="Company name" name="companyName" required />
                  <Input label="Industry" name="industry" required />
                </div>
              )}
            </>
          )}
          {!register && (
            <div className="auth-options">
              <label>
                <input type="checkbox" name="remember" defaultChecked />
                Remember me
              </label>
              <button type="button" className="text-link" onClick={() => setForgot(true)}>
                Forgot password?
              </button>
            </div>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button loading={loading} type="submit" className="full-width">
            {register ? 'Create account' : 'Log in'}
            <ArrowRight size={16} />
          </Button>
        </form>
        <p className="auth-bottom">
          {register ? 'Already have an account?' : 'New to InternTrack?'}{' '}
          <Link to={register ? '/login' : '/register'}>
            {register ? 'Log in' : 'Create an account'}
          </Link>
        </p>
      </div>
      <Modal open={forgot} onClose={() => setForgot(false)} title="Let’s get you back in">
        <p className="muted">
          Self-service password reset is not available yet. Contact your InternTrack
          administrator for account assistance.
        </p>
        <Button
          className="full-width"
          style={{ marginTop: 22 }}
          onClick={() => setForgot(false)}
        >
          Got it
        </Button>
      </Modal>
    </div>
  );
}
