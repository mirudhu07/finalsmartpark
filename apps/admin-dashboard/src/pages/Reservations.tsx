import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Calendar, Search, Filter, CheckCircle, Clock, XCircle } from 'lucide-react';

export const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadReservations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reservations');
      setReservations(res.data.reservations || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();

    function onResUpdate(data: any) {
      setReservations((prev) => {
        const idx = prev.findIndex((r) => r._id === data.reservation?._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = data.reservation;
          return updated;
        }
        return [data.reservation, ...prev];
      });
    }

    socket.on('reservation:update', onResUpdate);
    return () => {
      socket.off('reservation:update', onResUpdate);
    };
  }, []);

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.bookingReference?.toLowerCase().includes(search.toLowerCase()) ||
      r.vehiclePlate?.toLowerCase().includes(search.toLowerCase()) ||
      r.facilityName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Active
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Reservation Operations" subtitle="Active bookings, slot allocations, and status tracking" />

      <main className="p-8 space-y-6 flex-1">
        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reference, vehicle, garage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-blue"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-500">Status:</span>
            {['all', 'confirmed', 'active', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-brand-blue text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Booking Ref</th>
                  <th className="px-6 py-3.5">Facility &amp; Zone</th>
                  <th className="px-6 py-3.5">Vehicle Plate</th>
                  <th className="px-6 py-3.5">Start Time</th>
                  <th className="px-6 py-3.5">End Time</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      No reservations found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-navy">
                        {res.bookingReference}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{res.facilityName}</p>
                        <p className="text-[11px] text-slate-400">{res.zoneName || 'Standard'}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                        {res.vehiclePlate}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(res.startTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(res.endTime).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ${(res.totalPriceCents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(res.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
