import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  role: string;
  is_approved: boolean;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const approveMentor = async (userId: number) => {
    try {
      await api.put(`/api/users/${userId}/approve-mentor`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve mentor');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  const mentors = users.filter((u) => u.role === 'mentor');
  const students = users.filter((u) => u.role === 'student');
  const admins = users.filter((u) => u.role === 'admin');

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <div>
          <span style={{ marginRight: '20px' }}>Welcome, {user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <h2>All Users ({users.length})</h2>

      <h3>Mentors ({mentors.length})</h3>
      {mentors.map((mentor) => (
        <div key={mentor.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{mentor.email}</strong>
              <p>Status: {mentor.is_approved ? 'Approved' : 'Pending Approval'}</p>
              <p>Created: {new Date(mentor.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              {!mentor.is_approved && (
                <button onClick={() => approveMentor(mentor.id)} style={{ marginRight: '10px' }}>
                  Approve
                </button>
              )}
              <button onClick={() => deleteUser(mentor.id)} style={{ background: '#dc3545' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      <h3>Students ({students.length})</h3>
      {students.map((student) => (
        <div key={student.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{student.email}</strong>
              <p>Created: {new Date(student.created_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => deleteUser(student.id)} style={{ background: '#dc3545' }}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <h3>Admins ({admins.length})</h3>
      {admins.map((admin) => (
        <div key={admin.id} className="card">
          <div>
            <strong>{admin.email}</strong>
            <p>Created: {new Date(admin.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;

