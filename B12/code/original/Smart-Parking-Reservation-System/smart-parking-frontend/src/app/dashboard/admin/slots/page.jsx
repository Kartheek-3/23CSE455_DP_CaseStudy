'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function ManageSlots() {
  const [locations, setLocations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [form, setForm] = useState({ areaId: '', section: '', slotNumber: '', type: 'standard', pricePerHour: '', floor: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [areasRes, slotsRes] = await Promise.all([
          api.get('/parking'),
          api.get('/slots'),
        ]);
        setLocations(areasRes.data.data);
        setSlots(slotsRes.data);
      } catch (error) {
        console.error('Failed to fetch', error);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => setForm({ areaId: '', section: '', slotNumber: '', type: 'standard', pricePerHour: '', floor: '' });

  const filteredSlots = selectedAreaId === 'all' ? slots : slots.filter((s) => s.parkingArea?.id === Number(selectedAreaId));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/slots', {
        parkingAreaId: Number(form.areaId),
        section: form.section,
        slotNumber: form.slotNumber,
        type: form.type,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
        floor: form.floor ? Number(form.floor) : undefined,
      });
      setShowCreate(false);
      resetForm();
      const res = await api.get('/slots');
      setSlots(res.data);
    } catch (error) {
      const message = error?.response?.data?.message;
      alert(Array.isArray(message) ? message.join(', ') : message || 'Failed to create slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setForm({
      areaId: slot.parkingArea?.id?.toString() || '',
      section: slot.section || '',
      slotNumber: slot.slotNumber || '',
      type: slot.type || 'standard',
      pricePerHour: slot.pricePerHour?.toString() || '',
      floor: slot.floor?.toString() || '',
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/slots/${editingSlot.id}`, {
        parkingAreaId: Number(form.areaId),
        section: form.section,
        slotNumber: form.slotNumber,
        type: form.type,
        pricePerHour: form.pricePerHour ? Number(form.pricePerHour) : undefined,
        floor: form.floor ? Number(form.floor) : undefined,
      });
      setShowEdit(false);
      setEditingSlot(null);
      resetForm();
      const res = await api.get('/slots');
      setSlots(res.data);
    } catch (error) {
      const message = error?.response?.data?.message;
      alert(Array.isArray(message) ? message.join(', ') : message || 'Failed to update slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await api.delete(`/slots/${id}`);
      setSlots(slots.filter((s) => s.id !== id));
    } catch (error) {
      alert('Failed to delete slot');
    }
  };

  const getStatusDot = (status) => {
    if (status === 'available') return 'bg-[var(--status-available)]';
    if (status === 'occupied') return 'bg-[var(--status-active)]';
    if (status === 'reserved') return 'bg-[var(--accent-yellow)]';
    if (status === 'maintenance') return 'bg-[var(--status-cancelled)]';
    return 'bg-slate-500';
  };

  const areaName = (slot) => slot.parkingArea?.name || `Area #${slot.parkingArea?.id}`;

  const renderFormFields = () => (
    <>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Parking Area</label>
        <select
          value={form.areaId}
          onChange={(e) => setForm({ ...form, areaId: e.target.value })}
          className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
          required
        >
          <option value="">Select area</option>
          {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Section</label>
        <input
          type="text"
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
          placeholder="e.g., A"
          className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Slot Number</label>
        <input
          type="text"
          value={form.slotNumber}
          onChange={(e) => setForm({ ...form, slotNumber: e.target.value })}
          placeholder="e.g., 1"
          className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
        >
          <option value="standard">Standard</option>
          <option value="ev">EV Charging</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Price/Hour ($)</label>
        <input
          type="number"
          step="0.01"
          value={form.pricePerHour}
          onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
          placeholder="Optional"
          className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Floor</label>
        <input
          type="number"
          value={form.floor}
          onChange={(e) => setForm({ ...form, floor: e.target.value })}
          placeholder="Optional"
          className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
        />
      </div>
    </>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Manage Slots</h1>
        <button onClick={() => { setShowCreate(true); resetForm(); }} className="btn-primary text-sm px-5 py-2.5">
          <Plus size={18} className="mr-1.5" /> Create Slot
        </button>
      </div>

      <div className="card-dark p-4 mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm text-[var(--text-secondary)]">Filter by area:</label>
        <select
          value={selectedAreaId}
          onChange={(e) => setSelectedAreaId(e.target.value)}
          className="px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm max-w-xs"
        >
          <option value="all">All Areas</option>
          {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
        </select>
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/30">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Slot #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Floor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Price/h</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredSlots.map((slot) => (
                <tr key={slot.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{slot.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{areaName(slot)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{slot.section || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)]">{slot.slotNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-[var(--text-secondary)]">{slot.type || 'standard'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{slot.floor ?? '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">${Number(slot.pricePerHour || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1.5 text-xs font-medium text-[var(--text-primary)]">
                      <span className={`w-2 h-2 rounded-full ${getStatusDot(slot.status)}`} />
                      <span className="capitalize">{slot.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleEdit(slot)} className="text-[var(--accent-yellow)] hover:opacity-80 transition" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(slot.id)} className="text-[var(--status-cancelled)] hover:opacity-80 transition" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSlots.length === 0 && (
                <tr><td colSpan="9" className="px-6 py-8 text-center text-[var(--text-secondary)]">No slots found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-dark p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Create Slot</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              {renderFormFields()}
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-full border border-slate-700/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary text-sm py-2">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-dark p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Edit Slot</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              {renderFormFields()}
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => { setShowEdit(false); setEditingSlot(null); }} className="flex-1 py-2 rounded-full border border-slate-700/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary text-sm py-2">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
