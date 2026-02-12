import supabase from '../utils/supabase';

export async function getCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('active', true)
      .order('created_at');
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getCourseById(id) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*, chapters(id, idx, title, emoji)')
      .eq('id', id)
      .order('idx', { referencedTable: 'chapters' })
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getChapterProgress(childId, courseId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('chapter_index, completed_at')
      .eq('child_id', childId)
      .eq('course_id', courseId)
      .order('chapter_index');
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function completeChapter(childId, courseId, chapterIndex) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .upsert(
        { child_id: childId, course_id: courseId, chapter_index: chapterIndex, completed_at: new Date().toISOString() },
        { onConflict: 'child_id,course_id,chapter_index' }
      )
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function hasCourseAccess(userId, courseId) {
  try {
    // Check purchases
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .or(`course_id.eq.${courseId},plan.eq.full_access,plan.eq.family`)
      .limit(1)
      .maybeSingle();

    if (purchase) return { data: true, error: null };

    // Check admin-granted access
    const { data: access } = await supabase
      .from('course_access')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('active', true)
      .limit(1)
      .maybeSingle();

    return { data: !!access, error: null };
  } catch (error) {
    return { data: false, error };
  }
}

export async function getAllProgress(childId) {
  try {
    const { data, error } = await supabase
      .from('progress')
      .select('course_id, chapter_index, completed_at')
      .eq('child_id', childId)
      .order('completed_at');
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
