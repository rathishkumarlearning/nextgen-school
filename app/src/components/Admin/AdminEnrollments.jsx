import { useState } from 'react';
import DB from '../../lib/db';

export default function AdminEnrollments() {
  const users = DB.getUsers();
  const children = DB.getChildren();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter families by search query
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by parent name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-bg border border-glass-border text-text placeholder-text2 focus:outline-none focus:border-cyan-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left py-3 px-4 text-text2 font-medium">Parent Name</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Children</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const userChildren = children.filter((c) => c.parentId === user.id);
              return (
                <tr
                  key={user.id}
                  className="border-b border-glass-border hover:bg-glass/30 transition"
                >
                  <td className="py-3 px-4 text-text">{user.fullName}</td>
                  <td className="py-3 px-4 text-text2">{user.email}</td>
                  <td className="py-3 px-4 text-text">
                    {userChildren.map((c) => c.name).join(', ') || 'No children'}
                  </td>
                  <td className="py-3 px-4 text-text2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-text2">No families found</div>
      )}
    </div>
  );
}
