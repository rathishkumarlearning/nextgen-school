import { useState } from 'react';
import DB from '../../lib/db';

export default function AdminPayments() {
  const purchases = DB.getPurchases();
  const [filterTab, setFilterTab] = useState('all');

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 text-green-400 border border-green-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border border-red-500/50';
      case 'demo':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'success':
        return '✅ Success';
      case 'failed':
        return '❌ Failed';
      case 'demo':
        return '🎮 Demo';
      default:
        return status;
    }
  };

  const filteredPurchases =
    filterTab === 'all'
      ? purchases
      : purchases.filter((p) => p.status === filterTab);

  const failedPayments = purchases.filter((p) => p.status === 'failed');

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {failedPayments.length > 0 && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400 font-medium">
            ⚠️ {failedPayments.length} failed payment{failedPayments.length !== 1 ? 's' : ''} require attention
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'success', label: '✅ Success' },
          { id: 'failed', label: '❌ Failed' },
          { id: 'demo', label: '🎮 Demo' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterTab === tab.id
                ? 'bg-glass border border-cyan-400 text-cyan-400'
                : 'bg-glass border border-glass-border text-text2 hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="text-left py-3 px-4 text-text2 font-medium">ID</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Plan</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Amount</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Method</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-text2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.map((purchase) => (
              <tr
                key={purchase.id}
                className="border-b border-glass-border hover:bg-glass/30 transition"
              >
                <td className="py-3 px-4 text-text font-mono text-sm">
                  {purchase.id.substring(0, 8)}...
                </td>
                <td className="py-3 px-4 text-text">{purchase.plan}</td>
                <td className="py-3 px-4 text-text font-semibold">${purchase.amount}</td>
                <td className="py-3 px-4 text-text2">{purchase.method}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(purchase.status)}`}>
                    {getStatusLabel(purchase.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-text2">
                  {new Date(purchase.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPurchases.length === 0 && (
        <div className="text-center py-8 text-text2">No payments found</div>
      )}
    </div>
  );
}
