import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/App.css';

const GlobalSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // Local state for the ones being created/edited
    const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '', group: 'General', isPublic: false });

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/settings');
            if (res.data.success) {
                setSettings(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            setError('');
            setMessage('');

            const payload = { settings };
            const res = await api.put('/api/settings', payload);

            if (res.data.success) {
                setMessage('Settings saved successfully');
                fetchSettings(); // Refresh
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSetting = () => {
        if (!newSetting.key || !newSetting.value) {
            setError('Key and Value are required for new settings.');
            return;
        }
        // Check for duplicates in local state
        if (settings.find(s => s.key === newSetting.key)) {
            setError('Setting with this key already exists. Edit it below instead.');
            return;
        }

        setSettings([newSetting, ...settings]);
        setNewSetting({ key: '', value: '', description: '', group: 'General', isPublic: false });
        setError('');
    };

    const handleSettingChange = (index, field, value) => {
        const updated = [...settings];
        updated[index] = { ...updated[index], [field]: value };
        setSettings(updated);
    };

    const handleDelete = async (key, index) => {
        if (window.confirm(`Are you sure you want to delete the setting '${key}'?`)) {
            try {
                await api.delete(`/api/settings/${key}`);
                const updated = [...settings];
                updated.splice(index, 1);
                setSettings(updated);
                setMessage(`Setting '${key}' deleted.`);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete setting.');
            }
        }
    };

    if (loading) return <p>Loading...</p>;

    // Group settings for display
    const groupedSettings = settings.reduce((acc, curr) => {
        const group = curr.group || 'General';
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {});

    return (
        <div className="reports">
            <h2>Global Company Settings</h2>
            {error && <div className="error">{error}</div>}
            {message && <div className="success-message">{message}</div>}

            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3>Add New Setting</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Key (e.g. ALLOW_REMOTE_WORK)"
                        value={newSetting.key}
                        onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Value"
                        value={newSetting.value}
                        onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newSetting.description}
                        onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                    />
                    <select value={newSetting.group} onChange={(e) => setNewSetting({ ...newSetting, group: e.target.value })}>
                        <option value="General">General</option>
                        <option value="Leave">Leave Policy</option>
                        <option value="Attendance">Attendance Handling</option>
                        <option value="Finance">Finance & Expenses</option>
                        <option value="Security">Security</option>
                    </select>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input
                            type="checkbox"
                            checked={newSetting.isPublic}
                            onChange={(e) => setNewSetting({ ...newSetting, isPublic: e.target.checked })}
                        />
                        Public?
                    </label>
                    <button className="btn btn-primary" onClick={handleAddSetting}>Add to List</button>
                </div>
            </div>

            <div className="settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(groupedSettings).map(([groupName, groupSettings]) => (
                    <div key={groupName} className="glass-card" style={{ padding: '20px' }}>
                        <h3>{groupName} Parameters</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                            {groupSettings.map((item, idx) => {
                                const globalIndex = settings.findIndex(s => s.key === item.key);
                                return (
                                    <div key={item.key} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                        <div style={{ flex: 1 }}>
                                            <strong>{item.key}</strong>
                                            {item.description && <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>{item.description}</p>}
                                        </div>
                                        <div style={{ flex: 2, display: 'flex', gap: '10px' }}>
                                            <input
                                                type="text"
                                                value={item.value}
                                                onChange={(e) => handleSettingChange(globalIndex, 'value', e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.isPublic}
                                                    onChange={(e) => handleSettingChange(globalIndex, 'isPublic', e.target.checked)}
                                                />
                                                Pub
                                            </label>
                                            <select value={item.group} onChange={(e) => handleSettingChange(globalIndex, 'group', e.target.value)} style={{ width: '120px' }}>
                                                <option value="General">General</option>
                                                <option value="Leave">Leave Policy</option>
                                                <option value="Attendance">Attendance Handling</option>
                                                <option value="Finance">Finance & Expenses</option>
                                                <option value="Security">Security</option>
                                            </select>
                                        </div>
                                        <div>
                                            <button className="action-btn delete-btn" onClick={() => handleDelete(item.key, globalIndex)}>Del</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleSaveAll} disabled={saving}>
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

        </div>
    );
};

export default GlobalSettings;
