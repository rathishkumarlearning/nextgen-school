import supabase from '../utils/supabase.js';

// Parent signup: creates auth user + profile + optional child
async function signUp({ name, email, password, childName, childAge, childPin }) {
  const svcKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Use admin API to create user (bypasses email rate limits & auto-confirms)
  if (svcKey) {
    try {
      const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { 'apikey': svcKey, 'Authorization': `Bearer ${svcKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: { name }
        })
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        const msg = createData.msg || createData.message || createData.error || 'Signup failed';
        return { data: null, error: msg };
      }

      const user = createData;

      // Profile is auto-created by DB trigger (handle_new_user)
      await new Promise(r => setTimeout(r, 800));

      // Update profile name
      const { data: profile } = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: { 'apikey': svcKey, 'Authorization': `Bearer ${svcKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
        body: JSON.stringify({ name })
      }).then(r => r.json()).then(d => ({ data: Array.isArray(d) ? d[0] : d })).catch(() => ({ data: null }));

      // Create child if provided
      let child = null;
      if (childName && childPin && childPin.length === 4) {
        const childRes = await fetch(`${supabaseUrl}/rest/v1/children`, {
          method: 'POST',
          headers: { 'apikey': svcKey, 'Authorization': `Bearer ${svcKey}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify({ name: childName, age: childAge || 10, pin: childPin, parent_id: user.id })
        });
        if (childRes.ok) {
          const childArr = await childRes.json();
          child = Array.isArray(childArr) ? childArr[0] : childArr;
        }
      }

      // Now sign in the user (admin API doesn't create a client session)
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        // User was created but auto-login failed — still return success
        return { data: { user, profile, child }, error: null };
      }

      return { data: { user, profile, child }, error: null };
    } catch (err) {
      return { data: null, error: err.message || 'Signup failed' };
    }
  }

  // Fallback: standard signup (may hit email rate limits)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });

  if (authError) return { data: null, error: authError.message };
  const user = authData.user;

  await new Promise(r => setTimeout(r, 500));
  
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
