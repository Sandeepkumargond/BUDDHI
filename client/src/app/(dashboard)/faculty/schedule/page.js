"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';

export default function FacultySchedulePage(){
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);

  useEffect(()=>{
    const fetchSlots = async()=>{
      try { setLoading(true); setError('');
        const res = await apiService.request(`/schedule/faculty/${user?._id}`);
        setSlots(res?.data?.slots || []);
      } catch(e){ setError(e?.message || 'Failed to load schedule'); }
      finally { setLoading(false); }
    };
    if (user?._id) fetchSlots();
  },[user]);

  const seedDemo = async ()=>{
    try { setSeeding(true); setError('');
      await apiService.request('/schedule/seed/current-faculty', { method: 'POST' });
      // refetch
      const res = await apiService.request(`/schedule/faculty/${user?._id}`);
      setSlots(res?.data?.slots || []);
    } catch(e){ setError(e?.message || 'Failed to seed schedule'); }
    finally { setSeeding(false); }
  };

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Schedule</h2>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={seeding}
          onClick={seedDemo}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
        >{seeding ? 'Seeding…' : 'Seed Demo Schedule'}</button>
        <span className="text-xs text-gray-500">Adds two demo classes if none exist.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {days.map((d, di)=>{
          const daySlots = slots.filter(s=>s.dayOfWeek===di).sort((a,b)=>a.startMins-b.startMins);
          return (
            <div key={di} className="bg-white border rounded p-3">
              <div className="font-semibold mb-2">{d}</div>
              {daySlots.length===0 ? (
                <div className="text-sm text-gray-500">No classes</div>
              ) : daySlots.map(s=> (
                <div key={s._id} className="text-sm py-1 flex justify-between">
                  <span>{Math.floor(s.startMins/60).toString().padStart(2,'0')}:{(s.startMins%60).toString().padStart(2,'0')} - {Math.floor(s.endMins/60).toString().padStart(2,'0')}:{(s.endMins%60).toString().padStart(2,'0')}</span>
                  <span className="font-medium">{s.course?.name || s.room || 'Class'}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
