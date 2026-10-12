import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';

import { LogoMark, Wordmark } from '@/components/brand/logo';
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
      // Emails a temporary password; signing in with it leads to "Choose your password".
      const { error: resetError } = await backend.functions.invoke('password-reset', {
        body: { email: email.trim() },
      });
      setBusy(false);
      if (resetError) {
        let message = 'Couldn’t send it. Try again in a minute.';
        try {
          const body = await (resetError as { context?: Response }).context?.json();
          if (body?.error) message = body.error;
        } catch {
          // keep the generic message
        }
        return setError(message);
      }
      // Same answer whether or not the email exists. Back to sign in, email kept, ready
      // for the temporary password.
      setPassword('');
      setMode('sign-in');
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
    <div className="relative grid min-h-dvh place-items-center bg-canvas p-4 pt-20 text-ink">
      <Link
        to="/"
        className="group absolute top-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/70 py-2 pr-4 pl-3 text-small font-semibold text-ink shadow-sm shadow-elevation/10 backdrop-blur-md transition-colors hover:bg-surface"
      >
        <ArrowLeftIcon
          size={18}
          aria-hidden
          className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
        />
        Back to website
      </Link>
      <form
        onSubmit={submit}
        className="flex w-full max-w-sm flex-col gap-5 rounded-4xl border border-line bg-surface p-6 shadow-xl shadow-elevation/10 md:p-8"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark className="h-12 w-auto" />
          <Wordmark className="h-10" />
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
          <Notice tone="success">
            If that email is on the team, a temporary password is on its way. Sign in with it and
            you’ll choose a new one.
          </Notice>
        ) : null}
        <Button type="submit" loading={busy} className="w-full">
          {mode === 'reset' ? 'Email me a temporary password' : 'Sign in'}
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
