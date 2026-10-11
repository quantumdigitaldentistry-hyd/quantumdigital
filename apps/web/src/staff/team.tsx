import { CopyIcon, UserPlusIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Navigate, useOutletContext } from 'react-router';

import { Button } from '@/components/ui/button';
import { Field, SelectField } from '@/components/ui/field';
import { doctors as siteDoctors } from '@/content/clinic';

import { useStaffDocument } from './document';
import {
  backend,
  canManageTeam,
  errorMessage,
  roleLabel,
  type TeamMember,
  type TeamRole,
} from './session';
import { Notice, Panel, Pill, StaffPage } from './ui';

function InviteForm({ me, onDone }: { me: TeamMember; onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'doctor' | 'staff'>('staff');
  const [doctorSlug, setDoctorSlug] = useState('');
  const [mode, setMode] = useState<'invite' | 'password'>('invite');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ email: string; password?: string } | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!backend) return;
    setBusy(true);
    setError('');
    setResult(null);
    const { data, error: invokeError } = await backend.functions.invoke<{
      ok?: boolean;
      temporaryPassword?: string;
      error?: string;
    }>('team-invite', { body: { email, fullName, role, doctorSlug, mode } });
    setBusy(false);
    if (invokeError || !data?.ok) {
      let message = data?.error ?? 'Could not add them.';
      try {
        const body = await (invokeError as { context?: Response } | null)?.context?.json();
        if (body?.error) message = body.error;
      } catch {
        // keep message
      }
      return setError(message);
    }
    setResult({ email, password: data.temporaryPassword });
    setEmail('');
    setFullName('');
    onDone();
  };

  return (
    <Panel>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-display text-heading font-semibold">
          <UserPlusIcon size={22} className="text-brand" aria-hidden /> Add a team member
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Full name"
            value={fullName}
            maxLength={80}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <SelectField
            label="Role"
            options={[
              { value: 'staff', label: 'Staff (front desk)' },
              { value: 'doctor', label: 'Doctor' },
            ]}
            value={role}
            onChange={(e) => setRole(e.target.value as 'doctor' | 'staff')}
          />
          {role === 'doctor' ? (
            <SelectField
              label="Website profile (optional)"
              placeholder="None"
              options={siteDoctors.map((doctor) => ({ value: doctor.slug, label: doctor.name }))}
              value={doctorSlug}
              onChange={(e) => setDoctorSlug(e.target.value)}
            />
          ) : null}
          <SelectField
            label="How they get access"
            options={[
              { value: 'invite', label: 'Email them an invite link' },
              { value: 'password', label: 'Create a temporary password' },
            ]}
            value={mode}
            onChange={(e) => setMode(e.target.value as 'invite' | 'password')}
          />
        </div>
        <p className="text-caption text-ink-muted">
          {me.role === 'super_admin' ? 'You' : 'Doctors'} can add doctors and staff. Doctors and
          staff can manage appointments, content and the festival theme; only doctors and the clinic
          account can manage the team.
        </p>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {result ? (
          <Notice tone="success">
            {result.password ? (
              <>
                Account created for {result.email}. Give them this one-time password privately;
                they’ll choose their own at first sign-in:{' '}
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono font-semibold text-ink">
                  {result.password}
                </code>{' '}
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold underline"
                  onClick={() => void navigator.clipboard.writeText(result.password!)}
                >
                  <CopyIcon size={14} aria-hidden /> Copy
                </button>
              </>
            ) : (
              <>Invite sent to {result.email}.</>
            )}
          </Notice>
        ) : null}
        <Button type="submit" loading={busy} className="self-start">
          Add to team
        </Button>
      </form>
    </Panel>
  );
}

function MemberRow({
  member,
  me,
  onChange,
}: {
  member: TeamMember;
  me: TeamMember;
  onChange: () => void;
}) {
  const [error, setError] = useState('');
  const locked =
    member.id === me.id || (member.role === 'super_admin' && me.role !== 'super_admin');

  const update = async (role: TeamRole, active: boolean) => {
    if (!backend) return;
    setError('');
    const { error: rpcError } = await backend.rpc('set_team_member', {
      member: member.id,
      new_role: role,
      new_active: active,
      new_doctor_slug: member.doctor_slug ?? undefined,
    });
    if (rpcError) setError(errorMessage(rpcError));
    else onChange();
  };

  return (
    <li className="flex flex-col gap-2 rounded-3xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="size-3 rounded-full" style={{ background: member.colour }} aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">
            {member.full_name || member.email}{' '}
            {member.id === me.id ? <span className="text-ink-muted">(you)</span> : null}
          </span>
          <span className="truncate text-caption text-ink-muted">{member.email}</span>
        </div>
        <Pill
          className={
            member.active ? 'bg-brand-soft text-on-brand-soft' : 'bg-sunken text-ink-muted'
          }
        >
          {member.active ? roleLabel[member.role] : 'Switched off'}
        </Pill>
      </div>
      {!locked ? (
        <div className="flex flex-wrap gap-2">
          <select
            aria-label={`Role for ${member.email}`}
            value={member.role}
            onChange={(e) => void update(e.target.value as TeamRole, member.active)}
            className="min-h-9 rounded-control border border-line-strong bg-surface px-2 text-small"
          >
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
            {me.role === 'super_admin' ? <option value="super_admin">Clinic admin</option> : null}
          </select>
          <Button
            variant="secondary"
            className="min-h-9 px-3 text-small"
            onClick={() => void update(member.role, !member.active)}
          >
            {member.active ? 'Switch off access' : 'Restore access'}
          </Button>
        </div>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </li>
  );
}

export default function TeamPage() {
  useStaffDocument('Team');
  const me = useOutletContext<TeamMember>();
  const queryClient = useQueryClient();
  const team = useQuery({
    queryKey: ['team'],
    enabled: !!backend,
    queryFn: async () => {
      const { data, error } = await backend!
        .from('team_members')
        .select('*')
        .order('role')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });
  if (!canManageTeam(me.role)) return <Navigate to="/staff" replace />;
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['team'] });
    void queryClient.invalidateQueries({ queryKey: ['doctors'] });
  };

  return (
    <StaffPage
      title="Team"
      description="Who can sign in to the staff area. Switching someone off takes effect immediately."
    >
      <InviteForm me={me} onDone={refresh} />
      <ul className="flex flex-col gap-2">
        {team.data?.map((member) => (
          <MemberRow key={member.id} member={member} me={me} onChange={refresh} />
        ))}
      </ul>
    </StaffPage>
  );
}
