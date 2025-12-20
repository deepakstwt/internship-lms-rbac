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

const MentorCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterDescription, setChapterDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [studentIds, setStudentIds] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, chaptersRes] = await Promise.all([
        api.get(`/api/courses/${courseId}`),
        api.get(`/api/courses/${courseId}/chapters`),
      ]);
      setCourse(courseRes.data.data.course);
      const sortedChapters = (chaptersRes.data.data.chapters || []).sort(
        (a: Chapter, b: Chapter) => a.sequence_order - b.sequence_order
      );
      setChapters(sortedChapters);
      setSequenceOrder((sortedChapters.length || 0) + 1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  const addChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/courses/${courseId}/chapters`, {
        title: chapterTitle,
        description: chapterDescription,
        image_url: imageUrl || null,
        video_url: videoUrl || null,
        sequence_order: sequenceOrder,
      });
      setChapterTitle('');
      setChapterDescription('');
      setImageUrl('');
      setVideoUrl('');
      setShowChapterForm(false);
      fetchCourseData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add chapter');
    }
  };

  const assignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ids = studentIds.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
      await api.post(`/api/courses/${courseId}/assign`, {
        studentIds: ids,
      });
      setStudentIds('');
      setShowAssignForm(false);
      alert('Course assigned successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign course');
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!course) return <div className="container">Course not found</div>;

  return (
    <div className="container">
      <button className="btn-secondary" onClick={() => navigate('/')} style={{ marginBottom: '24px' }}>
        ← Back to Dashboard
      </button>
      <div className="card card-info">
        <div className="card-content">
          <h1>{course.title}</h1>
          {course.description && <p style={{ marginBottom: '0' }}>{course.description}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          className={showChapterForm ? "btn-secondary" : "btn-primary"}
          onClick={() => setShowChapterForm(!showChapterForm)}
        >
          {showChapterForm ? 'Cancel' : 'Add Chapter'}
        </button>
        <button 
          className={showAssignForm ? "btn-secondary" : "btn-primary"}
          onClick={() => setShowAssignForm(!showAssignForm)}
        >
          {showAssignForm ? 'Cancel' : 'Assign to Students'}
        </button>
      </div>

      {showChapterForm && (
        <div className="card">
          <h2>Add Chapter</h2>
          <form onSubmit={addChapter}>
            <label>Title</label>
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              required
            />
            <label>Description</label>
            <textarea
              value={chapterDescription}
              onChange={(e) => setChapterDescription(e.target.value)}
              rows={4}
            />
            <label>Sequence Order</label>
            <input
              type="number"
              value={sequenceOrder}
              onChange={(e) => setSequenceOrder(parseInt(e.target.value))}
              min={1}
              required
            />
            <label>Image URL (optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <label>Video URL (optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button type="submit" className="btn-primary">Add Chapter</button>
          </form>
        </div>
      )}

      {showAssignForm && (
        <div className="card">
          <h2>Assign Course to Students</h2>
          <form onSubmit={assignCourse}>
            <label>Student IDs (comma-separated)</label>
            <input
              type="text"
              value={studentIds}
              onChange={(e) => setStudentIds(e.target.value)}
              placeholder="e.g., 1, 2, 3"
              required
            />
            <p style={{ fontSize: '14px', color: '#666', marginTop: '-8px', marginBottom: '16px' }}>
              Enter student IDs separated by commas. You can find student IDs in the database users table.
            </p>
            <button type="submit" className="btn-primary">Assign Course</button>
          </form>
        </div>
      )}

      <h2>Chapters ({chapters.length})</h2>
      {chapters.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>No chapters added yet</p>
          <p style={{ fontSize: '14px' }}>Add your first chapter to start building the course content.</p>
        </div>
      ) : (
        chapters.map((chapter) => (
          <div key={chapter.id} className="card card-chapter">
            <div className="card-content">
              <h3>Chapter {chapter.sequence_order}: {chapter.title}</h3>
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
                  Video Link →
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MentorCourse;

