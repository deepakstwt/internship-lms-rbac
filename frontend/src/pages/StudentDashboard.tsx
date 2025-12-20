import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Course {
  id: number;
  title: string;
  description: string;
  mentor_id: number;
  assigned_at?: string;
}

interface CourseProgress {
  course: Course;
  totalChapters: number;
  completedChapters: number;
  completionPercentage: number;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
    fetchProgress();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/student/courses/my');
      setCourses(response.data.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await api.get('/api/progress/my');
      setProgress(response.data.data.progress || []);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Student Dashboard</h1>
          <p style={{ marginTop: '4px', color: '#666', fontSize: '14px' }}>Welcome, {user?.email}</p>
        </div>
        <button className="btn-secondary" onClick={logout}>Logout</button>
      </div>

      <h2>My Assigned Courses</h2>
      {courses.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No courses assigned yet</p>
          <p style={{ fontSize: '14px' }}>Your mentor will assign courses to you soon.</p>
        </div>
      ) : (
        courses.map((course) => {
          const courseProgress = progress.find((p) => p.course.id === course.id);
          return (
            <div key={course.id} className="card card-course">
              <div className="card-content">
                <h3>{course.title}</h3>
                {course.description && <p>{course.description}</p>}
                {courseProgress && (
                  <div style={{ marginTop: '20px' }}>
                    <div className="progress-info">
                      <span className="progress-percentage">Progress: {courseProgress.completionPercentage}%</span>
                      <span className="progress-count">
                        {courseProgress.completedChapters} of {courseProgress.totalChapters} chapters completed
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${courseProgress.completionPercentage === 100 ? 'complete' : ''}`}
                        style={{ width: `${courseProgress.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="card-actions">
                <button className="btn-primary" onClick={() => navigate(`/student/course/${course.id}`)}>
                  View Course
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default StudentDashboard;

