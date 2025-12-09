"use client";

import { useEffect, useState } from "react";
import { apiService } from "@/lib/api";

const Announcements = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch active notices and keep only those created by admin/subadmin/superadmin (exclude faculty)
        const res = await apiService.request('/notices/public?limit=10&sort=latest', { method: 'GET', silent: true });
        const all = res?.data?.notices || [];
        const adminNotices = all.filter(n => (n.createdByModel && n.createdByModel !== 'Faculty'))
          .slice(0, 5);
        setItems(adminNotices);
      } catch (e) {
        setError(e?.message || 'Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <span className="text-xs text-gray-400">Latest</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3 mt-4">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-md" />
          ))}
        </div>
      ) : error ? (
        <div className="text-sm text-red-600 mt-3">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500 mt-3">No announcements</div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {items.map((n) => (
            <div key={n._id} className="rounded-md p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-medium truncate pr-2">{n.title}</h2>
                <span className="text-xs text-gray-500 bg-gray-50 rounded-md px-2 py-0.5">
                  {formatDate(n.publishDate || n.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {n.content}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                By {n.createdByName || 'Admin'}{n.category ? ` • ${n.category}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Announcements;
