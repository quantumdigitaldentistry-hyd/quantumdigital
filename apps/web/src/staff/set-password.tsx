import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';

import { LogoMark } from '@/components/brand/logo';
import { PageLoader } from '@/components/ui/page-loader';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

import { passwordProblem, useStaffDocument } from './document';
import { backend, useSession } from './session';
import { Notice } from './ui';

/**
 * Choose a password: after an invite link, a reset link, or a first sign-in with a
 * temporary password (must_change_password).
 */
export default function SetPassword() {
  useStaffDocument('Set password');
  const session = useSession();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session === undefined) return <PageLoader label="Checking your link" />;
  if (!session) return <Navigate to="/staff/login" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const problem = passwordProblem(password);
    if (problem) return setError(problem);
    if (password !== confirm) return setError('The two passwords don’t match.');
    setBusy(true);
    const { error: updateError } = await backend!.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setBusy(false);
    if (updateError) return setError(updateError.message);
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
          <h1 className="font-display text-heading font-semibold">Choose your password</h1>
          <p className="text-small text-ink-muted">{session.user.email}</p>
        </div>
        <Field
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="10+ characters with upper and lower case, a number and a symbol."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Repeat it"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <Button type="submit" loading={busy} className="w-full">
          Save password
        </Button>
      </form>
    </div>
  );
}
