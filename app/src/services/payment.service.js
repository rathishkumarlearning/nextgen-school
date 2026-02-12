import supabase from '../utils/supabase';

export async function recordPayment(data) {
  try {
    const { data: result, error } = await supabase
      .from('purchases')
      .insert({
        user_id: data.userId,
        plan: data.plan,
        course_id: data.courseId || null,
        amount: data.amount,
        currency: data.currency || 'USD',
        method: data.method,
        status: data.status || 'pending',
        coupon_id: data.couponId || null,
        coupon_discount: data.couponDiscount || 0,
        stripe_session_id: data.stripeSessionId || null,
        razorpay_payment_id: data.razorpayPaymentId || null,
      })
      .select()
      .single();
    return { data: result, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getPaymentsByUser(userId) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updatePaymentStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getPaymentById(id) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*, profiles(name, email)')
      .eq('id', id)
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
