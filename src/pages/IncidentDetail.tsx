import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Incident, Comment, Attachment, Profile } from '../lib/supabase';
import { Layout } from '../components/Layout';

export function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    severity: '',
    assigned_to: '',
  });

  useEffect(() => {
    fetchIncidentData();
    fetchUsers();
  }, [id]);

  const fetchIncidentData = async () => {
    if (!id) return;

    const [incidentRes, commentsRes, attachmentsRes] = await Promise.all([
      supabase
        .from('incidents')
        .select('*, reporter:profiles!incidents_reporter_id_fkey(*), assignee:profiles!incidents_assigned_to_fkey(*)')
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('comments')
        .select('*, author:profiles(*)')
        .eq('incident_id', id)
        .order('created_at', { ascending: true }),
      supabase
        .from('attachments')
        .select('*, uploader:profiles(*)')
        .eq('incident_id', id)
        .order('created_at', { ascending: true }),
    ]);

    if (incidentRes.data) {
      setIncident(incidentRes.data as any);
      setEditData({
        status: incidentRes.data.status,
        severity: incidentRes.data.severity,
        assigned_to: incidentRes.data.assigned_to || '',
      });
    }

    if (commentsRes.data) setComments(commentsRes.data as any);
    if (attachmentsRes.data) setAttachments(attachmentsRes.data as any);

    setLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['responder', 'manager', 'admin']);

    if (data) setUsers(data);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !profile) return;

    const { error } = await supabase.from('comments').insert([
      {
        incident_id: id,
        author_id: profile.id,
        message: newComment,
      },
    ]);

    if (!error) {
      setNewComment('');
      fetchIncidentData();
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    const { error } = await supabase
      .from('incidents')
      .update({
        status: editData.status,
        severity: editData.severity,
        assigned_to: editData.assigned_to || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      setEditMode(false);
      fetchIncidentData();
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this incident?')) return;

    const { error } = await supabase.from('incidents').delete().eq('id', id);

    if (!error) {
      navigate('/incidents');
    }
  };

  const canEdit = profile?.role === 'admin' || profile?.role === 'manager' ||
    (profile?.role === 'responder' && incident?.assigned_to === profile.id);

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      triaged: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!incident) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-slate-600">Incident not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/incidents')}
            className="flex items-center text-slate-600 hover:text-slate-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Incidents
          </button>
          {profile?.role === 'admin' && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all"
            >
              Delete Incident
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">{incident.title}</h1>
            {canEdit && (
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-all"
              >
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <span className={`text-sm px-3 py-1 rounded-full font-medium border ${getSeverityColor(incident.severity)}`}>
              {incident.severity}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full font-medium border ${getStatusColor(incident.status)}`}>
              {incident.status.replace('_', ' ')}
            </span>
          </div>

          {editMode ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="new">New</option>
                  <option value="triaged">Triaged</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                <select
                  value={editData.severity}
                  onChange={(e) => setEditData({ ...editData, severity: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              {(profile?.role === 'admin' || profile?.role === 'manager') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assign To</label>
                  <select
                    value={editData.assigned_to}
                    onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={handleUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
              >
                Save Changes
              </button>
            </div>
          ) : null}

          <div className="prose max-w-none mb-6">
            <p className="text-slate-700">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-6">
            <div>
              <span className="text-slate-600">Reporter:</span>
              <span className="ml-2 font-medium text-slate-900">{incident.reporter?.username}</span>
            </div>
            <div>
              <span className="text-slate-600">Assigned To:</span>
              <span className="ml-2 font-medium text-slate-900">{incident.assignee?.username || 'Unassigned'}</span>
            </div>
            <div>
              <span className="text-slate-600">Category:</span>
              <span className="ml-2 font-medium text-slate-900">{incident.category}</span>
            </div>
            <div>
              <span className="text-slate-600">Created:</span>
              <span className="ml-2 font-medium text-slate-900">{new Date(incident.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Attachments</h2>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{attachment.filename}</p>
                      <p className="text-xs text-slate-500">
                        {(attachment.file_size / 1024).toFixed(1)} KB - Uploaded by {attachment.uploader?.username}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Comments</h2>

          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{comment.author?.username}</span>
                    <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
