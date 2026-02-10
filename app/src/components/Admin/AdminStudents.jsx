import DB from '../../lib/db';

export default function AdminStudents() {
  const children = DB.getChildren();
  const progress = DB.getProgress();
  const users = DB.getUsers();

  const getParentName = (parentId) => {
    const parent = users.find((u) => u.id === parentId);
    return parent ? parent.fullName : 'Unknown';
  };

  const getChildProgress = (childId) => {
    const childProgress = progress.filter((p) => p.childId === childId);
    return childProgress;
  };

  const getTotalChaptersDone = (childId) => {
    const childProgress = getChildProgress(childId);
    return childProgress.reduce((sum, p) => sum + p.completed.length, 0);
  };

  const getCourseProgress = (childId, courseName) => {
    const courseProgress = progress.find((p) => p.childId === childId && p.course === courseName);
    if (!courseProgress) return 0;
    return (courseProgress.completed.length / 8) * 100;
  };

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-text2">No students yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children.map((child) => (
        <div
          key={child.id}
          className="bg-glass backdrop-blur-[20px] border border-glass-border rounded-2xl p-6"
        >
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text">{child.name}</h3>
            <p className="text-text2 text-sm">Age {child.age}</p>
            <p className="text-text2 text-sm">
              Parent: {getParentName(child.parentId)}
            </p>
          </div>

          {/* Stats */}
          <div className="mb-6 p-3 bg-bg rounded-lg">
            <p className="text-text font-semibold">
              {getTotalChaptersDone(child.id)} chapters completed
            </p>
          </div>

          {/* Course Progress */}
          <div className="space-y-3">
            {['AI', 'Space', 'Robotics'].map((courseName) => {
              const progress = getCourseProgress(child.id, courseName);
              const emoji = courseName === 'AI' ? '🤖' : courseName === 'Space' ? '🚀' : '🛠️';
              return (
                <div key={courseName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text2">
                      {emoji} {courseName}
                    </span>
                    <span className="text-text font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
