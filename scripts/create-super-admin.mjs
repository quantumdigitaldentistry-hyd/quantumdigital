// One-time: create the clinic's super admin account in a Supabase project.
// The database trigger gives quantumdigitaldentistry@gmail.com the super_admin role.
//
// Run from your own computer (never in CI, never commit the values):
//   SUPABASE_URL=https://<project>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service role key from Dashboard > Settings > API> \
//   SUPER_ADMIN_PASSWORD='<a strong password>' \
//   node scripts/create-super-admin.mjs
//
// The service role key bypasses all security rules: keep it out of the website, git,
// chat and email. The password is only sent to Supabase Auth.

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.SUPER_ADMIN_PASSWORD;
const email = 'quantumdigitaldentistry@gmail.com';

if (!url || !key || !password) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPER_ADMIN_PASSWORD.');
  process.exit(1);
}
if (
  password.length < 10 ||
  !/[a-z]/.test(password) ||
  !/[A-Z]/.test(password) ||
  !/\d/.test(password) ||
  !/[^A-Za-z0-9]/.test(password)
) {
  console.error('Use 10+ characters with upper and lower case, a number and a symbol.');
  process.exit(1);
}

const response = await fetch(`${url}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, email_confirm: true }),
});
const body = await response.json();
if (!response.ok) {
  console.error(`Failed (${response.status}):`, body.msg ?? body.message ?? body);
  process.exit(1);
}
console.log(`Created ${email} (${body.id}). Sign in at /staff/login.`);
