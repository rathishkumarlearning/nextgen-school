import supabase from '../utils/supabase';

// ---- Dashboard Stats ----

export async function getAdminStats() {
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
      data: {
        totalFamilies: families.count || 0,
        totalChildren: children.count || 0,
        totalRevenue,
        totalPurchases: purchaseData.length,
        failedPayments,
        chaptersCompleted: progress.count || 0,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

// Keep old name as alias
export { getAdminStats as getStats };

// ---- Charts ----

export async function getRevenueChart(days = 7) {
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabase
      .from('purchases')
      .select('amount, created_at')
      .in('status', ['completed', 'success'])
      .gte('created_at', since);
    if (error) return { data: null, error };

    const byDay = {};
    (data || []).forEach(p => {
      const day = p.created_at.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + (Number(p.amount) || 0);
    });
    return { data: byDay, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Alias
export { getRevenueChart as getRevenueByDay };

export async function getEnrollmentChart(days = 7) {
  try {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabase
      .from('purchases')
      .select('created_at')
      .in('status', ['completed', 'success'])
      .gte('created_at', since);
    if (error) return { data: null, error };

    const byDay = {};
    (data || []).forEach(p => {
      const day = p.created_at.slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
    });
    return { data: byDay, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export { getEnrollmentChart as getEnrollmentsByDay };

// ---- Course Completion ----

export async function getCourseCompletion() {
  try {
    const [courses, progress] = await Promise.all([
      supabase.from('courses').select('id, title, chapter_count'),
      supabase.from('progress').select('course_id, child_id, chapter_index'),
    ]);
    if (courses.error) return { data: null, error: courses.error };

    const childrenPerCourse = {};
    const chaptersPerCourse = {};
    (progress.data || []).forEach(p => {
      if (!childrenPerCourse[p.course_id]) childrenPerCourse[p.course_id] = new Set();
      childrenPerCourse[p.course_id].add(p.child_id);
      chaptersPerCourse[p.course_id] = (chaptersPerCourse[p.course_id] || 0) + 1;
    });

    const result = (courses.data || []).map(c => {
      const students = childrenPerCourse[c.id]?.size || 0;
      const done = chaptersPerCourse[c.id] || 0;
      const possible = students * (c.chapter_count || 8);
      return {
        courseId: c.id,
        title: c.title,
        students,
        completionPct: possible > 0 ? Math.round((done / possible) * 100) : 0,
      };
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Paginated Lists ----

export async function getEnrollments({ page = 1, pageSize = 20, search = '', status = '' } = {}) {
  try {
    let query = supabase
      .from('profiles')
      .select('id, name, email, created_at, active, children(id, name, age)', { count: 'exact' })
      .eq('role', 'parent')
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    if (status === 'active') query = query.eq('active', true);
    else if (status === 'inactive') query = query.eq('active', false);

    const { data, error, count } = await query;
    return { data, error, count };
  } catch (error) {
    return { data: null, error, count: 0 };
  }
}

export async function getPayments({ page = 1, pageSize = 20, search = '', status = '' } = {}) {
  try {
    let query = supabase
      .from('purchases')
      .select('*, profiles!purchases_user_id_fkey(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (status) query = query.eq('status', status);
    if (search) {
      // Search by joining profile name/email — use profile filter
      query = query.or(`profiles.name.ilike.%${search}%,profiles.email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;
    return { data, error, count };
  } catch (error) {
    return { data: null, error, count: 0 };
  }
}

export async function getStudents({ page = 1, pageSize = 20, search = '' } = {}) {
  try {
    let query = supabase
      .from('children')
      .select('*, profiles!children_parent_id_fkey(name, email), progress(course_id, chapter_index, completed_at)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error, count } = await query;
    return { data, error, count };
  } catch (error) {
    return { data: null, error, count: 0 };
  }
}

export async function getUsers({ page = 1, pageSize = 20, search = '', role = '' } = {}) {
  try {
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    if (role) query = query.eq('role', role);

    const { data, error, count } = await query;
    return { data, error, count };
  } catch (error) {
    return { data: null, error, count: 0 };
  }
}

// ---- Courses (with enrollment counts) ----

export async function getCourses() {
  try {
    const [courses, purchases, progress] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('purchases').select('course_id, amount, status'),
      supabase.from('progress').select('course_id, child_id, chapter_index'),
    ]);

    const result = (courses.data || []).map(c => {
      const coursePurchases = (purchases.data || []).filter(p => p.course_id === c.id && (p.status === 'completed' || p.status === 'success'));
      const courseProgress = (progress.data || []).filter(p => p.course_id === c.id);
      const studentSet = new Set(courseProgress.map(p => p.child_id));
      const totalChapters = studentSet.size * (c.chapter_count || 8);

      return {
        ...c,
        students: studentSet.size,
        revenue: coursePurchases.reduce((s, p) => s + (Number(p.amount) || 0), 0),
        chaptersDone: courseProgress.length,
        completionPct: totalChapters > 0 ? Math.round((courseProgress.length / totalChapters) * 100) : 0,
      };
    });
    return { data: result, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Alias
export { getCourses as getCourseOverview };

// ---- Access Management ----

export async function grantAccess(userId, courseId, reason = '') {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('course_access').insert({
      user_id: userId,
      course_id: courseId,
      granted_by: currentUser?.user?.id || null,
      reason,
      active: true,
    }).select().single();
    if (!error) {
      await supabase.from('admin_events').insert({ event_type: 'course_access_granted', data: { userId, courseId, reason } });
    }
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

// Alias
export { grantAccess as grantCourseAccess };

export async function revokeAccess(accessId) {
  try {
    const { data, error } = await supabase
      .from('course_access')
      .update({ active: false, revoked_at: new Date().toISOString() })
      .eq('id', accessId)
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export { revokeAccess as revokeCourseAccess };

export async function getAccessLog(courseId) {
  try {
    let query = supabase
      .from('course_access')
      .select('*, profiles!course_access_user_id_fkey(name, email)')
      .order('granted_at', { ascending: false });

    if (courseId) query = query.eq('course_id', courseId);

    const { data, error } = await query;
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export { getAccessLog as getCourseAccessLog };

// ---- CSV Export ----

export async function exportCSV(table) {
  try {
    const allowed = ['profiles', 'children', 'purchases', 'progress', 'course_access', 'coupons'];
    if (!allowed.includes(table)) return { data: null, error: new Error('Invalid table') };
    const { data, error } = await supabase.from(table).select('*');
    if (error) return { data: null, error };

    // Convert to CSV string
    if (!data || data.length === 0) return { data: '', error: null };
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => {
      const val = row[h];
      const str = val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(','));
    return { data: [headers.join(','), ...rows].join('\n'), error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- User CRUD (admin) ----

export async function createUser(userData) {
  try {
    const { data, error } = await supabase.from('profiles').insert({
      name: userData.name,
      email: userData.email,
      role: userData.role || 'parent',
      active: true,
    }).select().single();
    if (!error) {
      await supabase.from('admin_events').insert({ event_type: 'user_created', data: { userId: data.id, email: userData.email } });
    }
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateUser(id, updates) {
  try {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteUser(id) {
  try {
    await supabase.from('children').delete().eq('parent_id', id);
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      await supabase.from('admin_events').insert({ event_type: 'user_deleted', data: { userId: id } });
    }
    return { data: !error, error };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Analytics ----

export async function getAnalytics() {
  try {
    const [progress, purchases, courses] = await Promise.all([
      supabase.from('progress').select('course_id, child_id, chapter_index'),
      supabase.from('purchases').select('course_id, status, created_at'),
      supabase.from('courses').select('id, title, chapter_count'),
    ]);

    const courseMap = Object.fromEntries((courses.data || []).map(c => [c.id, c]));
    const progressData = progress.data || [];

    const studentsByCourse = {};
    progressData.forEach(p => {
      if (!studentsByCourse[p.course_id]) studentsByCourse[p.course_id] = new Set();
      studentsByCourse[p.course_id].add(p.child_id);
    });
    const popularCourses = Object.entries(studentsByCourse)
      .map(([id, s]) => ({ courseId: id, title: courseMap[id]?.title, students: s.size }))
      .sort((a, b) => b.students - a.students);

    const funnel = (courses.data || []).map(c => {
      const cp = progressData.filter(p => p.course_id === c.id);
      const students = new Set(cp.map(p => p.child_id)).size;
      const maxChapter = {};
      cp.forEach(p => {
        maxChapter[p.child_id] = Math.max(maxChapter[p.child_id] || 0, p.chapter_index);
      });
      const completed = Object.values(maxChapter).filter(v => v >= (c.chapter_count || 8) - 1).length;
      return { courseId: c.id, title: c.title, started: students, completed };
    });

    return { data: { popularCourses, completionFunnel: funnel }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Event Logging ----

export async function logEvent(type, data = {}) {
  try {
    const { data: result, error } = await supabase
      .from('admin_events')
      .insert({ event_type: type, data })
      .select()
      .single();
    return { data: result, error };
  } catch (error) {
    return { data: null, error };
  }
}

// ---- Student Progress (legacy alias) ----

export async function getStudentProgress() {
  try {
    const { data, error } = await supabase
      .from('children')
      .select('*, profiles!children_parent_id_fkey(name, email), progress(course_id, chapter_index, completed_at)')
      .order('created_at', { ascending: false });
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}
