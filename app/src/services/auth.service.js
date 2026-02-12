import supabase from '../utils/supabase.js';

// Parent signup: creates auth user + profile + optional child
async function signUp({ name, email, password, childName, childAge, childPin }) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (authError) return { data: null, error: authError.message };

  const user = authData.user;

  // Auto-confirm email (skip email verification for better UX)
  // Uses service_role internally via Supabase admin API
  try {
    const svcKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
    if (svcKey) {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'apikey': svcKey, 'Authorization': `Bearer ${svcKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_confirm: true })
      });
    }
  } catch {}

  // Profile is auto-created by DB trigger (handle_new_user)
  // Wait briefly for trigger to execute, then update name if needed
  await new Promise(r => setTimeout(r, 500));
  
  // Update profile name (trigger sets it from metadata, but ensure it's correct)
  const { data: profile } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', user.id)
    .select()
    .single();

  let child = null;
  if (childName && childPin && childPin.length === 4) {
    const { data: childData, error: childError } = await supabase
      .from('children')
      .insert({ name: childName, age: childAge || 10, pin: childPin, parent_id: user.id })
      .select()
      .single();
    if (!childError) child = childData;
  }

  return { data: { user, profile, child }, error: null };
}

// Parent login
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { data: null, error: error.message };
  return { data: { user: data.user, session: data.session }, error: null };
}

// Child PIN login (no Supabase auth — just lookup)
async function childLogin(pin) {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('pin', pin)
    .single();

  if (error || !data) return { data: null, error: 'Invalid PIN. Try again.' };
  return { data: { child: data }, error: null };
}

// Logout
async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

// Get current session
async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return { data: null, error: error.message };
  return { data: data.session, error: null };
}

// Get current user's profile
async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

// Listen to auth changes
function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

// Check if user is admin
async function isAdmin(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return data?.role === 'admin';
}

export { signUp, signIn, childLogin, signOut, getSession, getProfile, onAuthStateChange, isAdmin };
