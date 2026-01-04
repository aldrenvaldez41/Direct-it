export interface ScriptCategory {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Script {
  id: string;
  category_id: string;
  name: string;
  filename: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface ScriptExecution {
  id: string;
  script_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  output_log: string | null;
  created_at: string;
}

export interface CategoryWithScripts extends ScriptCategory {
  scripts: Script[];
}
