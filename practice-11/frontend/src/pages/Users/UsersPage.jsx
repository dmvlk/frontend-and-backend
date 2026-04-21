import React, { useState, useEffect } from 'react';
import { api } from '../../api';

export default function UsersPage({ userRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', role: 'user', isActive: true, password: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleBlock = async (id) => {
    if (window.confirm('Block this user?')) {
      await api.deleteUser(id);
      await loadUsers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.updateUser(editingUser.id, formData);
    setShowModal(false);
    setEditingUser(null);
    setFormData({ first_name: '', last_name: '', role: 'user', isActive: true, password: '' });
    await loadUsers();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      isActive: user.isActive,
      password: ''
    });
    setShowModal(true);
  };

  const styles = {
    container: { maxWidth: 1200, margin: '0 auto', padding: 20 },
    header: { background: '#fff9f2', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d9b382' },
    title: { color: '#8b5a2b', margin: 0 },
    logoutBtn: { padding: '8px 20px', background: '#d9b382', border: 'none', borderRadius: 40, cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff9f2', borderRadius: 24, overflow: 'hidden' },
    th: { padding: 12, textAlign: 'left', background: '#d9b382', color: '#4a3b2c' },
    td: { padding: 12, borderBottom: '1px solid #d9b382' },
    editBtn: { padding: '6px 12px', background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 20, cursor: 'pointer', marginRight: 10 },
    blockBtn: { padding: '6px 12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: 20, cursor: 'pointer' },
    active: { color: '#27ae60' },
    inactive: { color: '#c0392b' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#fff9f2', borderRadius: 24, padding: 30, width: 400, maxWidth: '90%' },
    input: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 12, border: '1px solid #d9b382', boxSizing: 'border-box' },
    select: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 12, border: '1px solid #d9b382', boxSizing: 'border-box' },
    checkbox: { marginRight: 10 },
    saveBtn: { padding: '12px 24px', background: '#8b5a2b', color: 'white', border: 'none', borderRadius: 40, cursor: 'pointer', marginRight: 10 },
    cancelBtn: { padding: '12px 24px', background: '#ccc', border: 'none', borderRadius: 40, cursor: 'pointer' }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50, color: '#8b5a2b' }}>Loading users...</div>;

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Coffee Shop - Users Management</h1>
        <button onClick={async () => { await api.logout(); window.location.reload(); }} style={styles.logoutBtn}>Logout</button>
      </div>
      <div style={styles.container}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>First Name</th>
              <th style={styles.th}>Last Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.first_name}</td>
                <td style={styles.td}>{user.last_name}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>{user.isActive ? <span style={styles.active}>Active</span> : <span style={styles.inactive}>Blocked</span>}</td>
                <td style={styles.td}>
                  <button onClick={() => openEditModal(user)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleBlock(user.id)} style={styles.blockBtn}>Block</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Edit User: {editingUser?.email}</h3>
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="First Name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} style={styles.input} required />
              <input type="text" placeholder="Last Name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} style={styles.input} required />
              <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} style={styles.select}>
                <option value="user">User</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
              <label><input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} style={styles.checkbox} /> Active</label>
              <input type="password" placeholder="New Password (leave empty to keep current)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} style={styles.input} />
              <button type="submit" style={styles.saveBtn}>Save</button>
              <button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} style={styles.cancelBtn}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}