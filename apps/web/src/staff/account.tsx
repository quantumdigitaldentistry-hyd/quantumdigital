import { toIndianE164 } from '@quantam/shared';
import { useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useOutletContext } from 'react-router';

import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

import { passwordProblem, useStaffDocument } from './document';
import { backend, errorMessage, roleLabel, type TeamMember } from './session';
import { Notice, Panel, StaffPage } from './ui';

export default function AccountPage() {
  useStaffDocument('My account');
  const me = useOutletContext<TeamMember>();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(me.full_name);
  const [phone, setPhone] = useState(me.phone?.replace(/^\+91/, '') ?? '');
  const [colour, setColour] = useState(me.colour);
  const [profileMsg, setProfileMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [password, setPassword] = useState('');
  const [nonce, setNonce] = useState('');
  const [needsNonce, setNeedsNonce] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    tone: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return;
    const e164 = phone ? toIndianE164(phone) : null;
    if (phone && !e164)
      return setProfileMsg({ tone: 'error', text: 'Enter a 10-digit mobile number.' });
    const { error } = await backend
      .from('team_members')
      .update({ full_name: fullName.trim(), phone: e164, colour })
      .eq('id', me.id);
    if (error) return setProfileMsg({ tone: 'error', text: errorMessage(error) });
    setProfileMsg({ tone: 'success', text: 'Saved.' });
    void queryClient.invalidateQueries({ queryKey: ['me'] });
    void queryClient.invalidateQueries({ queryKey: ['doctors'] });
  };

  // Changing a password needs a recent sign-in or a one-time code (secure_password_change).
  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return;
    const problem = passwordProblem(password);
    if (problem) return setPasswordMsg({ tone: 'error', text: problem });
    setBusy(true);
    const { error } = await backend.auth.updateUser({ password, ...(nonce ? { nonce } : {}) });
    setBusy(false);
    if (error) {
      if (/reauth/i.test(error.message)) {
        await backend.auth.reauthenticate();
        setNeedsNonce(true);
        return setPasswordMsg({
          tone: 'info',
          text: 'For safety, enter the code we just emailed you, then save again.',
        });
      }
      return setPasswordMsg({ tone: 'error', text: errorMessage(error) });
    }
    setPassword('');
    setNonce('');
    setNeedsNonce(false);
    setPasswordMsg({ tone: 'success', text: 'Password changed.' });
  };

  return (
    <StaffPage title="My account" description={`${me.email} · ${roleLabel[me.role]}`}>
      <Panel>
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <h2 className="font-display text-heading font-semibold">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Name"
              value={fullName}
              maxLength={80}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Field
              label="Mobile"
              type="tel"
              prefix="+91"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-label font-medium">Calendar colour</span>
              <input
                type="color"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
                className="h-12 w-24 cursor-pointer rounded-control border border-line-strong bg-surface"
              />
            </label>
          </div>
          {profileMsg ? <Notice tone={profileMsg.tone}>{profileMsg.text}</Notice> : null}
          <Button type="submit" className="self-start">
            Save profile
          </Button>
        </form>
      </Panel>
      <Panel>
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <h2 className="font-display text-heading font-semibold">Change password</h2>
          <Field
            label="New password"
            type="password"
            autoComplete="new-password"
            hint="10+ characters with upper and lower case, a number and a symbol."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {needsNonce ? (
            <Field
              label="Code from your email"
              inputMode="numeric"
              value={nonce}
              onChange={(e) => setNonce(e.target.value)}
            />
          ) : null}
          {passwordMsg ? <Notice tone={passwordMsg.tone}>{passwordMsg.text}</Notice> : null}
          <Button type="submit" loading={busy} className="self-start">
            Change password
          </Button>
        </form>
      </Panel>
    </StaffPage>
  );
}
