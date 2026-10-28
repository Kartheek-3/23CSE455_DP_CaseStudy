'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Trash2, Plus, Edit } from 'lucide-react';

export default function ManageLocations() {
  const [locations, setLocations] = useState([]);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationAddress, setNewLocationAddress] = useState('');
  const [editingLocation, setEditingLocation] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/parking');
        setLocations(response.data.data.sort((a, b) => a.id - b.id));
      } catch (error) {
        console.error('Failed to fetch locations', error);
      }
    };
    load();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/parking');
      setLocations(response.data.data.sort((a, b) => a.id - b.id));
    } catch (error) {
      console.error('Failed to fetch locations', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim() || !newLocationAddress.trim()) return;
    try {
      await api.post('/parking', { name: newLocationName, location: newLocationAddress });
      setNewLocationName('');
      setNewLocationAddress('');
      fetchLocations();
    } catch (error) {
      const message = error?.response?.data?.message;
      alert(Array.isArray(message) ? message.join(', ') : message || 'Failed to create location');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Warning: Deleting this location will also delete ALL slots and reservations inside it. Continue?')) return;
    try {
      await api.delete(`/parking/${id}`);
      setLocations(locations.filter((loc) => loc.id !== id));
    } catch (error) {
      alert('Failed to delete location');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editAddress.trim()) return;
    try {
      await api.patch(`/parking/${editingLocation.id}`, { name: editName, location: editAddress });
      setEditingLocation(null);
      fetchLocations();
    } catch (error) {
      const message = error?.response?.data?.message;
      alert(Array.isArray(message) ? message.join(', ') : message || 'Failed to update location');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-6">Manage Parking Locations</h1>

      <form onSubmit={handleCreate} className="card-dark p-5 mb-8 flex flex-wrap gap-4 items-end">
        <div className="grow min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Location Name</label>
          <input
            type="text"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
            placeholder="e.g., Faculty Garage"
            className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
            required
          />
        </div>
        <div className="grow min-w-[200px]">
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Address / Area</label>
          <input
            type="text"
            value={newLocationAddress}
            onChange={(e) => setNewLocationAddress(e.target.value)}
            placeholder="e.g., Suburban Campus"
            className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm placeholder-[var(--text-secondary)]"
            required
          />
        </div>

        <button type="submit" className="btn-primary text-sm px-6 py-2.5 h-[42px]">
          <Plus size={18} className="mr-1.5" /> Add Location
        </button>
      </form>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/30">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{loc.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">{loc.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{loc.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => { setEditingLocation(loc); setEditName(loc.name); setEditAddress(loc.location || ''); }}
                      className="text-[var(--accent-yellow)] hover:opacity-80 transition"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="text-[var(--status-cancelled)] hover:opacity-80 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-[var(--text-secondary)]">No locations found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="card-dark p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Edit Location</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Location Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Address / Area</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-4 py-2 rounded-full bg-[var(--bg-primary)] border border-slate-700/30 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-purple)] text-sm"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingLocation(null)} className="flex-1 py-2 rounded-full border border-slate-700/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary text-sm py-2">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
