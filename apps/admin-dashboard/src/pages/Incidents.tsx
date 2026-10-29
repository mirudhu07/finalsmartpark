import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { AlertTriangle, CheckCircle, Shield, Clock, FileText, X } from 'lucide-react';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'incidents' | 'audits'>('incidents');
  const [loading, setLoading] = useState(true);

  // Resolve modal state
  const [resolvingIncident, setResolvingIncident] = useState<any | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incRes, auditRes] = await Promise.all([
        api.get('/admin/incidents'),
        api.get('/admin/audit-logs'),
      ]);
      setIncidents(incRes.data.incidents || []);
      setAuditLogs(auditRes.data.logs || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async () => {
    if (!resolvingIncident) return;
    setSaving(true);
    try {
      await api.put(`/admin/incidents/${resolvingIncident._id}/resolve`, {
        resolutionNote,
      });
      setResolvingIncident(null);
      setResolutionNote('');
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resolve incident');
    } finally {
      setSaving(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">Low</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Operational Incidents &amp; Security Audits" subtitle="Track facility equipment maintenance, anomalies, and administrative actions" />

      <main className="p-8 space-y-6 flex-1">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-brand-border pb-3">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === 'incidents'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Incidents ({incidents.filter((i) => i.status !== 'resolved').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 ${
              activeTab === 'audits'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {activeTab === 'incidents' ? (
          <div className="space-y-4">
            {incidents.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-brand-border text-slate-400">
                No incidents reported. All facility hardware operational.
              </div>
            ) : (
              incidents.map((inc) => (
                <div
                  key={inc._id}
                  className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(inc.severity)}
                      <span className="font-semibold text-xs text-slate-400 uppercase tracking-wide">
                        {inc.facilityName}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-brand-navy">{inc.title}</h4>
                    <p className="text-xs text-slate-600">{inc.description}</p>
                    {inc.resolvedAt && (
                      <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md inline-block font-medium mt-2">
                        ✓ Resolved: {inc.resolutionNote}
                      </p>
                    )}
                  </div>

                  <div>
                    {inc.status !== 'resolved' ? (
                      <button
                        onClick={() => setResolvingIncident(inc)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Operator</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Resource</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      No administrative audit entries logged yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 text-slate-500 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-brand-navy">{log.userEmail}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-700">{log.action}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-600">{log.resource}</td>
                      <td className="px-6 py-3.5 text-slate-500 font-mono text-[11px]">
                        {JSON.stringify(log.details || {})}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Resolve Incident Modal */}
      {resolvingIncident && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-brand-navy">Resolve Operational Incident</h4>
              <button onClick={() => setResolvingIncident(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Marking <strong className="text-slate-900">{resolvingIncident.title}</strong> as resolved.
            </p>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Resolution Note</label>
              <textarea
                rows={3}
                required
                placeholder="Details of inspection, sensor reset, or technician repair..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setResolvingIncident(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
              >
                {saving ? 'Saving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
