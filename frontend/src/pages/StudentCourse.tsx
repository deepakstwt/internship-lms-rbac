import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Chapter {
  id: number;
  title: string;
  description: string;
  sequence_order: number;
  image_url?: string;
  video_url?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
}

interface Progress {
  completedChapters: number;
  totalChapters: number;
  completionPercentage: number;
}

const StudentCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchProgress();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, chaptersRes] = await Promise.all([
        api.get(`/api/student/courses/${courseId}`),
        api.get(`/api/student/courses/${courseId}/chapters`),
      ]);
      setCourse(courseRes.data.data.course);
      const sortedChapters = (chaptersRes.data.data.chapters || []).sort(
        (a: Chapter, b: Chapter) => a.sequence_order - b.sequence_order
      );
      setChapters(sortedChapters);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const [progressRes, completedRes] = await Promise.all([
        api.get('/api/progress/my'),
        api.get(`/api/progress/course/${courseId}/chapters`),
      ]);
      
      const courseProgress = progressRes.data.data.progress.find(
        (p: any) => p.course.id === parseInt(courseId || '0')
      );
      if (courseProgress) {
        setProgress(courseProgress);
      }
      
      if (completedRes.data.data.completedChapterIds) {
        setCompletedChapters(completedRes.data.data.completedChapterIds);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const markChapterComplete = async (chapterId: number) => {
    try {
      await api.post(`/api/progress/${chapterId}/complete`);
      setCompletedChapters([...completedChapters, chapterId]);
      await fetchProgress();
      await fetchCourseData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to mark chapter as complete');
    }
  };

  const downloadCertificate = async () => {
    try {
      const response = await api.get(`/api/certificates/${courseId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${course?.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to download certificate');
    }
  };

  const isChapterLocked = (chapter: Chapter) => {
    if (chapter.sequence_order === 1) return false;
    const previousChapters = chapters.filter(
      (c) => c.sequence_order < chapter.sequence_order
    );
    return previousChapters.some(
      (c) => !completedChapters.includes(c.id)
    );
  };


  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container"><div className="error">{error}</div></div>;
  if (!course) return <div className="container">Course not found</div>;

  return (
    <div className="container">
      <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '24px' }}>
        ← Back to Dashboard
      </button>
      <div className="card card-info">
        <div className="card-content">
          <h1>{course.title}</h1>
          {course.description && <p style={{ marginBottom: '24px' }}>{course.description}</p>}
        </div>
        {progress && (
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
            <div className="progress-info">
              <span className="progress-percentage">Progress: {progress.completionPercentage}%</span>
              <span className="progress-count">
                {progress.completedChapters} of {progress.totalChapters} chapters completed
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${progress.completionPercentage === 100 ? 'complete' : ''}`}
                style={{ width: `${progress.completionPercentage}%` }}
              ></div>
            </div>
            {progress.completionPercentage === 100 && (
              <div className="card-actions" style={{ marginTop: '16px', paddingTop: '16px' }}>
                <button className="btn-success" onClick={downloadCertificate}>
                  🎓 Download Certificate
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <h2>Chapters</h2>
      {chapters.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No chapters yet</p>
          <p style={{ fontSize: '14px' }}>Ask your mentor to add content to this course.</p>
        </div>
      ) : (
        chapters.map((chapter) => {
          const isCompleted = completedChapters.includes(chapter.id);
          const isLocked = isChapterLocked(chapter);
          return (
            <div
              key={chapter.id}
              className="card card-chapter"
              style={isLocked ? { opacity: 0.6 } : {}}
            >
              <div className="card-content">
                <div className="card-header">
                  <h3 style={{ marginBottom: 0 }}>
                    Chapter {chapter.sequence_order}: {chapter.title}
                  </h3>
                  {isCompleted && <span className="card-badge completed">Completed</span>}
                  {isLocked && <span className="card-badge locked">Locked</span>}
                </div>
                {chapter.description && <p>{chapter.description}</p>}
                {chapter.video_url && (
                  <a 
                    href={chapter.video_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block', 
                      marginTop: '8px',
                      color: '#007bff',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Watch Video →
                  </a>
                )}
              </div>
              {!isLocked && !isCompleted && (
                <div className="card-actions">
                  <button className="btn-primary" onClick={() => markChapterComplete(chapter.id)}>
                    Mark as Complete
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default StudentCourse;

