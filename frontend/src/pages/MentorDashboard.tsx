import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Course {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses/my');
      setCourses(response.data.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/courses', { title, description });
      setTitle('');
      setDescription('');
      setShowCreateForm(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Mentor Dashboard</h1>
          <p style={{ marginTop: '4px', color: '#666', fontSize: '14px' }}>Welcome, {user?.email}</p>
        </div>
        <button className="btn-secondary" onClick={logout}>Logout</button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button 
          className={showCreateForm ? "btn-secondary" : "btn-primary"}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create New Course'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h2>Create Course</h2>
          <form onSubmit={createCourse}>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <button type="submit" className="btn-primary">Create Course</button>
          </form>
        </div>
      )}

      {error && <div className="error">{error}</div>}

      <h2>My Courses</h2>
      {courses.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No courses created yet</p>
          <p style={{ fontSize: '14px' }}>Create your first course to get started.</p>
        </div>
      ) : (
        courses.map((course) => (
          <div key={course.id} className="card card-course">
            <div className="card-content">
              <h3>{course.title}</h3>
              {course.description && <p>{course.description}</p>}
            </div>
            <div className="card-actions">
              <button className="btn-primary" onClick={() => navigate(`/mentor/course/${course.id}`)}>
                Manage Course
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MentorDashboard;

