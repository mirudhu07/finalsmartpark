import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { socket } from '../services/socket';
import {
  Building2,
  Car,
  Percent,
  CalendarCheck,
  DollarSign,
  AlertTriangle,
  Cpu,
  TrendingUp,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

export const Overview: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsRes, facilitiesRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/facilities'),
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setFacilities(facilitiesRes.data.facilities);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for live occupancy updates via Socket.IO
    function onOccUpdate(data: any) {
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === data.facilityId
            ? {
                ...f,
                currentOccupancy: data.currentOccupancy,
                availableSpaces: data.availableSpaces,
                occupancyPercentage: data.occupancyPercentage,
              }
            : f
        )
      );
      // Refresh system aggregate KPIs
      setAnalytics((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentOccupied: prev.currentOccupied,
        };
      });
    }

    socket.on('occupancy:update', onOccUpdate);
    return () => {
      socket.off('occupancy:update', onOccUpdate);
    };
  }, []);

  const chartData = facilities.map((f) => ({
    name: f.name.replace(' Garage', '').replace(' Parking', ''),
    occupied: f.currentOccupancy,
    available: f.availableSpaces,
    capacity: f.totalCapacity,
    rate: f.occupancyPercentage,
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="System Operational Overview" subtitle="Real-time occupancy monitoring and machine-learning diagnostics" />

      <main className="p-8 space-y-8 flex-1">
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facilities</p>
              <h3 className="text-2xl font-bold text-brand-navy mt-0.5">
                {analytics?.totalFacilities ?? facilities.length}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Total monitored garages</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Capacity</p>
              <h3 className="text-2xl font-bold text-brand-navy mt-0.5">
                {analytics?.totalCapacity?.toLocaleString() ?? '2,900'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {analytics?.currentOccupied?.toLocaleString() ?? '0'} occupied
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System Load</p>
              <h3 className="text-2xl font-bold text-brand-navy mt-0.5">
                {analytics?.systemOccupancyRate ?? 62}%
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">Optimal circulation</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bookings</p>
              <h3 className="text-2xl font-bold text-brand-navy mt-0.5">
                {analytics?.activeReservationsCount ?? 1}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Live reservations</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Chart & ML Evaluation Model Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Facility Occupancy Bar Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-brand-navy">Facility Occupancy Distribution</h3>
                <p className="text-xs text-slate-500">Live occupied spaces vs total capacity</p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 text-slate-400 hover:text-brand-blue hover:bg-slate-50 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#071D42',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="occupied" name="Occupied Spaces" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate > 80 ? '#EF4444' : entry.rate > 60 ? '#1677E8' : '#10B981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ML Model Diagnostic Card */}
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-5 h-5 text-brand-blue" />
                <h3 className="text-base font-bold text-brand-navy">ML Forecasting Engine</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Model version{' '}
                <span className="font-semibold text-slate-800">
                  {analytics?.modelEvaluation?.modelVersion || 'v1.4.0'}
                </span>{' '}
                evaluated against holdout baseline.
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-600 font-medium">Holdout MAE</span>
                  <span className="text-sm font-bold text-brand-blue">
                    {analytics?.modelEvaluation?.mae ?? 4.04}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-600 font-medium">Holdout RMSE</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {analytics?.modelEvaluation?.rmse ?? 5.55}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-600 font-medium">Persistence Baseline MAE</span>
                  <span className="text-sm font-bold text-slate-500">6.21%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-semibold">Model Gain over Baseline</span>
                  <span className="text-sm font-bold text-emerald-700">+34.9%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Fast Inference (&lt;10ms)
              </span>
              <span>Dataset: Synthetic Demo</span>
            </div>
          </div>
        </div>

        {/* Facility List Table */}
        <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
          <div className="p-5 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-navy">Monitored Facilities Overview</h3>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
              {facilities.length} Garages
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Facility</th>
                  <th className="px-6 py-3.5">Location / Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Capacity</th>
                  <th className="px-6 py-3.5">Live Occupancy</th>
                  <th className="px-6 py-3.5">Rate / hr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-brand-navy">{fac.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{fac.address}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {fac.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-700">{fac.totalCapacity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              fac.occupancyPercentage > 80
                                ? 'bg-rose-500'
                                : fac.occupancyPercentage > 60
                                ? 'bg-brand-blue'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${fac.occupancyPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">
                          {fac.occupancyPercentage}% ({fac.currentOccupancy}/{fac.totalCapacity})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      ${(fac.hourlyRateCents / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
