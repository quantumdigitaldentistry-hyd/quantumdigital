import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';

import { LogoMark } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

import { useStaffDocument } from './document';
import { backend, useSession } from './session';
import { Notice } from './ui';

/**
 * Staff sign-in. Deliberately plain: no hint of what's behind it, and the same message
 * for a wrong email or a wrong password. Sign-ups are off; accounts come from invites.
 */
export default function StaffLogin() {
  useStaffDocument('Sign in');
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'reset'>('sign-in');
  const [sent, setSent] = useState(false);

  if (session) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from?.startsWith('/staff') ? from : '/staff'} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return setError('The staff area is not connected.');
    setBusy(true);
    setError('');
    if (mode === 'reset') {
      await backend.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/staff/set-password`,
      });
      setBusy(false);
      // Same answer whether or not the email exists.
      return setSent(true);
    }
    const { error: signInError } = await backend.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(
        signInError.status === 429
          ? 'Too many attempts. Wait a few minutes and try again.'
          : 'That email and password don’t match.',
      );
      return;
    }
    navigate('/staff', { replace: true });
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-4 text-ink">
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-4xl border border-line bg-surface p-6 shadow-xl shadow-elevation/10 md:p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark className="h-12 w-auto" />
          <h1 className="font-display text-heading font-semibold">
            {mode === 'reset' ? 'Reset your password' : 'Team sign in'}
          </h1>
        </div>
        <Field
          label="Email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode === 'sign-in' ? (
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : null}
        {error ? <Notice tone="error">{error}</Notice> : null}
        {sent ? (
          <Notice tone="success">If that email is on the team, a reset link is on its way.</Notice>
        ) : null}
        <Button type="submit" loading={busy} className="w-full">
          {mode === 'reset' ? 'Send reset link' : 'Sign in'}
        </Button>
        <button
          type="button"
          className="text-small font-medium text-brand"
          onClick={() => {
            setMode(mode === 'reset' ? 'sign-in' : 'reset');
            setError('');
            setSent(false);
          }}
        >
          {mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}
        </button>
      </form>
    </div>
  );
}
