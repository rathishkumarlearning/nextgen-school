import supabase from '../utils/supabase';

// ---- Stats ----

export async function getCouponStats() {
  try {
    const { data: coupons, error } = await supabase.from('coupons').select('*');
    if (error) return { data: null, error };

    const now = new Date();
    const active = coupons.filter(c =>
      c.active &&
      (!c.expires_at || new Date(c.expires_at) > now) &&
      c.current_uses < c.max_uses
    ).length;
    const totalRedeemed = coupons.reduce((s, c) => s + (c.current_uses || 0), 0);
    const revenueImpact = coupons.reduce((s, c) => s + (c.current_uses || 0) * (Number(c.value) || 0), 0);

    return { data: { active, totalRedeemed, revenueImpact, totalCoupons: coupons.length }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Paginated List ----

export async function getCoupons({ page = 1, pageSize = 20, search = '', status = '' } = {}) {
  try {
    let query = supabase
      .from('coupons')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) query = query.ilike('code', `%${search}%`);
    if (status === 'active') query = query.eq('active', true);
    else if (status === 'inactive') query = query.eq('active', false);
    else if (status === 'expired') query = query.lt('expires_at', new Date().toISOString());
    else if (status === 'depleted') query = query.filter('current_uses', 'gte', 'max_uses');

    const { data, error, count } = await query;
    return { data, error, count };
  } catch (error) {
    return { data: null, error, count: 0 };
  }
}

// ---- Create Single ----

export async function createCoupon({ code, courseId, type, value, maxUses = 1, expiresAt }) {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('coupons').insert({
      code: code.toUpperCase(),
      course_id: courseId || null,
      type,
      value,
      max_uses: maxUses,
      current_uses: 0,
      active: true,
      expires_at: expiresAt || null,
      created_by: currentUser?.user?.id || null,
    }).select().single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Bulk Generate ----

export async function bulkGenerateCoupons({ prefix, count, courseId, type, value, maxUses = 1, expiresAt }) {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const coupons = Array.from({ length: count }, () => ({
      code: `${prefix.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      course_id: courseId || null,
      type,
      value,
      max_uses: maxUses,
      current_uses: 0,
      active: true,
      expires_at: expiresAt || null,
      created_by: currentUser?.user?.id || null,
    }));
    const { data, error } = await supabase.from('coupons').insert(coupons).select();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Alias
export { bulkGenerateCoupons as generateBulkCoupons };

// ---- Update ----

export async function updateCoupon(id, updates) {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Legacy alias
export async function deactivateCoupon(id) {
  return updateCoupon(id, { active: false });
}

// ---- Delete ----

export async function deleteCoupon(id) {
  try {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    return { data: !error, error };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Validate ----

export async function validateCoupon(code, courseId = null) {
  try {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !coupon) return { valid: false, coupon: null, discount: 0, error: 'Coupon not found' };
    if (!coupon.active) return { valid: false, coupon, discount: 0, error: 'Coupon is inactive' };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { valid: false, coupon, discount: 0, error: 'Coupon has expired' };
    if (coupon.current_uses >= coupon.max_uses) return { valid: false, coupon, discount: 0, error: 'Coupon usage limit reached' };
    if (coupon.course_id && courseId && coupon.course_id !== courseId) return { valid: false, coupon, discount: 0, error: 'Coupon not valid for this course' };

    return { valid: true, coupon, discount: coupon.value, error: null };
  } catch (error) {
    return { valid: false, coupon: null, discount: 0, error: error.message };
  }
}

// ---- Redeem ----

export async function redeemCoupon(code, userId, courseId) {
  try {
    // Validate first
    const validation = await validateCoupon(code, courseId);
    if (!validation.valid) return { data: null, error: validation.error };

    const coupon = validation.coupon;

    // Increment uses
    const { error: updateError } = await supabase
      .from('coupons')
      .update({ current_uses: (coupon.current_uses || 0) + 1 })
      .eq('id', coupon.id);

    if (updateError) return { data: null, error: updateError };

    // Record in purchase as coupon redemption event
    await supabase.from('admin_events').insert({
      event_type: 'coupon_redeemed',
      data: { couponId: coupon.id, code: coupon.code, userId, courseId, discount: coupon.value },
    });

    return { data: { coupon, discount: coupon.value }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Legacy alias
export async function applyCoupon(couponId) {
  try {
    const { data: coupon } = await supabase.from('coupons').select('current_uses').eq('id', couponId).single();
    const { data, error } = await supabase
      .from('coupons')
      .update({ current_uses: (coupon?.current_uses || 0) + 1 })
      .eq('id', couponId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
