import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  role: 'reporter' | 'responder' | 'manager' | 'admin';
  team: string | null;
  created_at: string;
  last_login: string | null;
};

export type Incident = {
  id: string;
  reporter_id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'triaged' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  assigned_to: string | null;
  team: string | null;
  created_at: string;
  updated_at: string;
  reporter?: Profile;
  assignee?: Profile;
};

export type Comment = {
  id: string;
  incident_id: string;
  author_id: string;
  message: string;
  created_at: string;
  author?: Profile;
};

export type Attachment = {
  id: string;
  incident_id: string;
  uploader_id: string;
  filename: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
  uploader?: Profile;
};

export type AuditLog = {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  changes: any;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
};
