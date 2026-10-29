import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import {
  TrendingUp,
  Cpu,
  Layers,
  Info,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from 'recharts';

export const ForecastAnalytics: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [forecast, setForecast] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const res = await api.get('/facilities');
        const list = res.data.facilities;
        setFacilities(list);
        if (list.length > 0) {
          setSelectedFacilityId(list[0].id);
        }
      } catch (err: any) {
        setError('Failed to load facilities');
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedFacilityId) return;
    async function loadForecast() {
      setLoading(true);
      try {
        const res = await api.get(`/forecast/${selectedFacilityId}`);
        setForecast(res.data);
      } catch (err: any) {
        setError('Failed to load forecast for facility');
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [selectedFacilityId]);

  const chartData = forecast
    ? [
        {
          time: 'Now',
          occupancy: forecast.currentMeasuredOccupancyPercentage,
          lower: forecast.currentMeasuredOccupancyPercentage,
          upper: forecast.currentMeasuredOccupancyPercentage,
          spaces: Math.round(
            (forecast.currentMeasuredOccupancyPercentage / 100) * forecast.facilityCapacity
          ),
        },
        ...forecast.forecastPoints.map((p: any) => ({
          time: `+${p.minutesFromNow}m`,
          occupancy: p.predictedOccupancyPercentage,
          lower: p.confidenceLower,
          upper: p.confidenceUpper,
          spaces: p.predictedOccupiedSpaces,
        })),
      ]
    : [];

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
    if (trend === 'decreasing') return <ArrowDownRight className="w-4 h-4 text-emerald-500" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header
        title="ML Occupancy Forecast Diagnostics"
        subtitle="Gradient Boosting demand forecasting with transparent explanations and uncertainty bounds"
      />

      <main className="p-8 space-y-8 flex-1">
        {/* Facility Picker Bar */}
        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Selected Garage:
            </span>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} (Cap: {fac.totalCapacity})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-semibold rounded-full border border-sky-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Model: {forecast?.modelVersion || 'v1.4.0'}
            </span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full border border-amber-100">
              Demonstration Mode (Synthetic Ground Truth)
            </span>
          </div>
        </div>

        {/* Prediction Headline Card */}
        {forecast && (
          <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">
                  Next-Hour Demand Forecast: {forecast.facilityName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    {getTrendIcon(forecast.trendDirection)}
                    <span className="capitalize">{forecast.trendDirection} Trend</span>
                  </span>
                  <span>•</span>
                  <span>{forecast.trendExplanation}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Current Measured</p>
                  <p className="text-2xl font-bold text-brand-navy">
                    {forecast.currentMeasuredOccupancyPercentage}%
                  </p>
                </div>
                <div className="text-right pl-4 border-l border-slate-200">
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Expected in 60m</p>
                  <p className="text-2xl font-bold text-brand-blue">
                    {forecast.forecastPoints[forecast.forecastPoints.length - 1]?.predictedOccupancyPercentage}%
                  </p>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#071D42',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: string) => [
                      `${val}%`,
                      name === 'occupancy' ? 'Predicted Occupancy' : name,
                    ]}
                  />
                  {/* Uncertainty Band */}
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stroke="none"
                    fill="#1677E8"
                    fillOpacity={0.12}
                    name="Confidence Upper"
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#1677E8"
                    strokeWidth={3}
                    fill="#1677E8"
                    fillOpacity={0.18}
                    name="Occupancy (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Horizon Points Pill Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              {forecast.forecastPoints.map((pt: any) => (
                <div
                  key={pt.minutesFromNow}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase">+{pt.minutesFromNow} Minutes</p>
                  <p className="text-lg font-bold text-brand-navy my-0.5">
                    {pt.predictedOccupancyPercentage}%
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ~{pt.predictedAvailableSpaces} spaces open
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    CI: [{pt.confidenceLower}% - {pt.confidenceUpper}%]
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Evaluation & Baseline Comparison */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-brand-blue" />
            <h3 className="text-base font-bold text-brand-navy">
              Model Evaluation &amp; Baseline Benchmarks
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Rigorous evaluation on an out-of-sample temporal holdout test split (last 20% of time-series).
            Demonstrates why machine-learning forecasting is required compared to static heuristics.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-5 py-3">Forecasting Approach</th>
                  <th className="px-5 py-3">Test Holdout MAE</th>
                  <th className="px-5 py-3">Test Holdout RMSE</th>
                  <th className="px-5 py-3">Relative Error Reduction</th>
                  <th className="px-5 py-3">Operational Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-emerald-50/50">
                  <td className="px-5 py-3.5 font-bold text-brand-navy flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    SmartPark GBR Forecaster (Production)
                  </td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">4.04%</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-700">5.55%</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-700">Baseline Winner (+34.9%)</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    Accurately anticipates rush hour surge and departures
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">
                    Baseline 1: Persistence / Naive (Future = Current)
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">6.21%</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">8.37%</td>
                  <td className="px-5 py-3.5 text-slate-400">Reference (0%)</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    Suffers severe lag during sudden capacity shifts
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">
                    Baseline 2: Time-of-Day Historical Average
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">14.84%</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">19.48%</td>
                  <td className="px-5 py-3.5 text-rose-500">-138%</td>
                  <td className="px-5 py-3.5 text-slate-500">
                    Fails to incorporate immediate current occupancy level
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
