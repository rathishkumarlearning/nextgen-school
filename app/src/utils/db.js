// ===== DATABASE LAYER (Supabase only) =====
import supabase from './supabase.js';

// ---- Users (profiles table) ----

export async function getUsers() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) { console.error('getUsers error:', error); return []; }
  return data || [];
}

export async function getUserByEmail(email) {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).single();
  if (error) return null;
  return data;
}

export async function getUserById(id) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

export async function addUser(userData) {
  const { data, error } = await supabase.from('profiles').insert({
    name: userData.name,
    email: userData.email,
    role: userData.role || 'parent',
    active: userData.active !== undefined ? userData.active : true,
  }).select().single();
  if (error) { console.error('addUser error:', error); return null; }
  return data;
}

export async function updateUser(id, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
  if (error) { console.error('updateUser error:', error); return null; }
  return data;
}

export async function deleteUser(id) {
  // Delete children first, then profile
  await supabase.from('children').delete().eq('parent_id', id);
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) { console.error('deleteUser error:', error); return false; }
  await logEvent('user_deleted', { userId: id });
  return true;
}

// ---- Children ----

export async function getChildren() {
  const { data, error } = await supabase.from('children').select('*');
  if (error) { console.error('getChildren error:', error); return []; }
  return data || [];
}

export async function getChildByPin(pin) {
  const { data, error } = await supabase.from('children').select('*').eq('pin', pin).single();
  if (error) return null;
  return data;
}

export async function getChildrenByParent(parentId) {
  const { data, error } = await supabase.from('children').select('*').eq('parent_id', parentId);
  if (error) { console.error('getChildrenByParent error:', error); return []; }
  return data || [];
}

export async function addChild(childData) {
  const { data, error } = await supabase.from('children').insert({
    name: childData.name,
    age: childData.age,
    pin: childData.pin,
    parent_id: childData.parentId || childData.parent_id,
  }).select().single();
  if (error) { console.error('addChild error:', error); return null; }
  return data;
}

export async function updateChild(id, updates) {
  const { data, error } = await supabase.from('children').update(updates).eq('id', id).select().single();
  if (error) { console.error('updateChild error:', error); return null; }
  return data;
}

export async function deleteChild(id) {
  await supabase.from('progress').delete().eq('child_id', id);
  const { error } = await supabase.from('children').delete().eq('id', id);
  if (error) { console.error('deleteChild error:', error); return false; }
  return true;
}

// ---- Purchases ----

export async function getPurchases() {
  const { data, error } = await supabase.from('purchases').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getPurchases error:', error); return []; }
  return data || [];
}

export async function addPurchase(purchaseData) {
  const { data, error } = await supabase.from('purchases').insert({
    user_id: purchaseData.userId || purchaseData.user_id,
    plan: purchaseData.plan,
    course_id: purchaseData.courseId || purchaseData.course_id || null,
    amount: purchaseData.amount,
    currency: purchaseData.currency || 'USD',
    status: purchaseData.status || 'pending',
    method: purchaseData.method,
    coupon_id: purchaseData.couponId || purchaseData.coupon_id || null,
    coupon_discount: purchaseData.couponDiscount || purchaseData.coupon_discount || 0,
  }).select().single();
  if (error) { console.error('addPurchase error:', error); return null; }
  await logEvent('purchase', purchaseData);
  return data;
}

export async function updatePurchase(id, updates) {
  const { data, error } = await supabase.from('purchases').update(updates).eq('id', id).select().single();
  if (error) { console.error('updatePurchase error:', error); return null; }
  return data;
}

// ---- Progress ----

export async function getProgress() {
  const { data, error } = await supabase.from('progress').select('*');
  if (error) { console.error('getProgress error:', error); return []; }
  return data || [];
}

export async function addProgress(progressData) {
  const { data, error } = await supabase.from('progress').upsert({
    child_id: progressData.childId || progressData.child_id,
    course_id: progressData.courseId || progressData.course_id,
    chapter_index: progressData.chapterIndex ?? progressData.chapter_index ?? progressData.chapterIdx,
    completed_at: progressData.completedAt || new Date().toISOString(),
  }, { onConflict: 'child_id,course_id,chapter_index' }).select().single();
  if (error) { console.error('addProgress error:', error); return null; }
  return data;
}

export async function getProgressByChild(childId) {
  const { data, error } = await supabase.from('progress').select('*').eq('child_id', childId);
  if (error) { console.error('getProgressByChild error:', error); return []; }
  return data || [];
}

// ---- Courses ----

export async function getCourses() {
  const { data, error } = await supabase.from('courses').select('*').order('created_at');
  if (error) { console.error('getCourses error:', error); return []; }
  return data || [];
}

export async function getCourseAccess(userId) {
  const { data, error } = await supabase.from('course_access').select('*').eq('user_id', userId).eq('active', true);
  if (error) { console.error('getCourseAccess error:', error); return []; }
  return data || [];
}

// ---- Settings (localStorage — UI preferences only) ----

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem('ngs_settings') || 'null') || {
      demoMode: false,
      pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 },
      stripeKey: '',
      razorpayKey: '',
    };
  } catch {
    return { demoMode: false, pricing: { singleCourse: 19, fullAccess: 39, familyPlan: 59 } };
  }
}

export function saveSettings(settings) {
  localStorage.setItem('ngs_settings', JSON.stringify(settings));
}

// ---- Admin Events ----

export async function logEvent(type, eventData) {
  const { error } = await supabase.from('admin_events').insert({
    event_type: type,
    data: eventData,
  });
  if (error) console.error('logEvent error:', error);
}

// ---- Stats (aggregate for dashboard) ----

export async function getStats() {
  try {
    const [families, children, purchases, progress] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
      supabase.from('children').select('id', { count: 'exact', head: true }),
      supabase.from('purchases').select('amount, status'),
      supabase.from('progress').select('id', { count: 'exact', head: true }),
    ]);

    const purchaseData = purchases.data || [];
    const totalRevenue = purchaseData
      .filter(p => p.status === 'completed' || p.status === 'success')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const failedPayments = purchaseData.filter(p => p.status === 'failed').length;

    return {
      totalFamilies: families.count || 0,
      totalChildren: children.count || 0,
      totalRevenue,
      totalPurchases: purchaseData.length,
      failedPayments,
      chaptersCompleted: progress.count || 0,
    };
  } catch (error) {
    console.error('getStats error:', error);
    return { totalFamilies: 0, totalChildren: 0, totalRevenue: 0, totalPurchases: 0, failedPayments: 0, chaptersCompleted: 0 };
  }
}

// ---- Default export for backward compatibility ----

const DB = {
  getUsers, getUserByEmail, getUserById, addUser, updateUser, deleteUser,
  getChildren, getChildByPin, getChildrenByParent, addChild, updateChild, deleteChild,
  getPurchases, addPurchase, updatePurchase,
  getProgress, addProgress, getProgressByChild,
  getCourses, getCourseAccess,
  getSettings, saveSettings,
  logEvent, getStats,
};

export default DB;
