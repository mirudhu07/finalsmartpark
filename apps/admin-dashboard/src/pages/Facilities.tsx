import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { socket } from '../services/socket';
import {
  Building2,
  Sliders,
  Plus,
  Check,
  X,
  AlertCircle,
  Zap,
  MapPin,
  Shield,
  Layers,
} from 'lucide-react';

export const Facilities: React.FC = () => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Override Modal state
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [newOccupancy, setNewOccupancy] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  // Create Facility Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFacData, setNewFacData] = useState({
    name: '',
    address: '',
    campusOrBuilding: '',
    latitude: 37.785,
    longitude: -122.405,
    totalCapacity: 400,
    hourlyRateCents: 400,
    amenities: 'ev_charging,covered,cctv_security',
  });

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/facilities');
      setFacilities(res.data.facilities);
    } catch (err: any) {
      setError(err.message || 'Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();

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
    }

    socket.on('occupancy:update', onOccUpdate);
    return () => {
      socket.off('occupancy:update', onOccUpdate);
    };
  }, []);

  const openOverrideModal = (fac: any) => {
    setSelectedFacility(fac);
    setNewOccupancy(fac.currentOccupancy);
  };

  const handleSaveOccupancy = async () => {
    if (!selectedFacility) return;
    setSaving(true);
    try {
      await api.post(`/admin/facilities/${selectedFacility.id}/occupancy`, {
        currentOccupancy: Number(newOccupancy),
      });
      setSelectedFacility(null);
      await loadFacilities();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update occupancy');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const amenitiesArr = newFacData.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.post('/admin/facilities', {
        name: newFacData.name,
        address: newFacData.address,
        campusOrBuilding: newFacData.campusOrBuilding || undefined,
        coordinates: {
          latitude: Number(newFacData.latitude),
          longitude: Number(newFacData.longitude),
        },
        entranceCoordinates: {
          latitude: Number(newFacData.latitude),
          longitude: Number(newFacData.longitude),
        },
        totalCapacity: Number(newFacData.totalCapacity),
        hourlyRateCents: Number(newFacData.hourlyRateCents),
        currency: 'USD',
        amenities: amenitiesArr,
      });

      setShowAddModal(false);
      await loadFacilities();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create facility');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Facility &amp; Zone Operations" subtitle="Manage parking capacity, zones, rates, and live occupancy" />

      <main className="p-8 space-y-6 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-brand-navy">All Monitored Facilities</h3>
            <p className="text-xs text-slate-500">Live operational garages with entrance coordinates</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blueDark text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Facility</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="bg-white rounded-2xl border border-brand-border shadow-xs p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-base font-bold text-brand-navy leading-snug">{fac.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{fac.address}</span>
                    </p>
                  </div>
                  <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    {fac.status}
                  </span>
                </div>

                {/* Capacity & Progress */}
                <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span>Occupancy Load</span>
                    <span className="font-mono">
                      {fac.currentOccupancy} / {fac.totalCapacity} ({fac.occupancyPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        fac.occupancyPercentage > 80
                          ? 'bg-rose-500'
                          : fac.occupancyPercentage > 60
                          ? 'bg-brand-blue'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${fac.occupancyPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Available: <strong className="text-emerald-600">{fac.availableSpaces} spaces</strong></span>
                    <span>Rate: <strong className="text-slate-800">${(fac.hourlyRateCents / 100).toFixed(2)}/hr</strong></span>
                  </div>
                </div>

                {/* Zones Badge List */}
                {fac.zones && fac.zones.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Configured Zones ({fac.zones.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {fac.zones.map((z: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700"
                        >
                          {z.floor} - {z.name} ({z.totalSpaces} bays)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  GPS: {fac.entranceCoordinates?.latitude?.toFixed(4)}, {fac.entranceCoordinates?.longitude?.toFixed(4)}
                </span>
                <button
                  onClick={() => openOverrideModal(fac)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Override Occupancy</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Override Live Occupancy Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-brand-navy">Override Live Occupancy</h4>
              <button
                onClick={() => setSelectedFacility(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Adjust measured occupied spaces for{' '}
              <strong className="text-slate-800">{selectedFacility.name}</strong>. This updates
              the database and broadcasts real-time WebSocket events to drivers and mobile apps.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Occupied Spaces (Max: {selectedFacility.totalCapacity})
                </label>
                <input
                  type="range"
                  min="0"
                  max={selectedFacility.totalCapacity}
                  value={newOccupancy}
                  onChange={(e) => setNewOccupancy(Number(e.target.value))}
                  className="w-full accent-brand-blue"
                />
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mt-1">
                  <span>0</span>
                  <span className="text-base font-bold text-brand-blue">{newOccupancy}</span>
                  <span>{selectedFacility.totalCapacity}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                Calculated occupancy will be:{' '}
                <strong>
                  {Math.round((newOccupancy / selectedFacility.totalCapacity) * 100)}%
                </strong>{' '}
                ({selectedFacility.totalCapacity - newOccupancy} spaces available)
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedFacility(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOccupancy}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold bg-brand-blue hover:bg-brand-blueDark text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                {saving ? 'Broadcasting...' : 'Apply Live Override'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-brand-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-brand-navy">Add Parking Facility</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFacility} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOMA Gateway Garage"
                  value={newFacData.name}
                  onChange={(e) => setNewFacData({ ...newFacData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 888 Folsom St, San Francisco, CA"
                  value={newFacData.address}
                  onChange={(e) => setNewFacData({ ...newFacData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-brand-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newFacData.latitude}
                    onChange={(e) => setNewFacData({ ...newFacData, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newFacData.longitude}
                    onChange={(e) => setNewFacData({ ...newFacData, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={newFacData.totalCapacity}
                    onChange={(e) => setNewFacData({ ...newFacData, totalCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hourly Rate (Cents)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newFacData.hourlyRateCents}
                    onChange={(e) => setNewFacData({ ...newFacData, hourlyRateCents: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  placeholder="ev_charging, covered, cctv_security, wheelchair_accessible"
                  value={newFacData.amenities}
                  onChange={(e) => setNewFacData({ ...newFacData, amenities: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 font-semibold bg-brand-blue text-white rounded-lg hover:bg-brand-blueDark shadow-sm"
                >
                  {saving ? 'Creating...' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
