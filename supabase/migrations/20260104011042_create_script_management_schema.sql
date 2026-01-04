/*
  # Script Management System Schema

  1. New Tables
    - `script_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Category name (e.g., "Count Request")
      - `display_order` (integer) - Order for display
      - `created_at` (timestamptz)
    
    - `scripts`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to script_categories)
      - `name` (text) - Display name for the script
      - `filename` (text) - Actual Python filename
      - `description` (text, nullable) - Script description
      - `display_order` (integer) - Order within category
      - `created_at` (timestamptz)
    
    - `script_executions`
      - `id` (uuid, primary key)
      - `script_id` (uuid, foreign key to scripts)
      - `status` (text) - running, completed, failed
      - `started_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)
      - `error_message` (text, nullable)
      - `output_log` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and create execution records
    - Public read access for categories and scripts for demo purposes
*/

-- Create script_categories table
CREATE TABLE IF NOT EXISTS script_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES script_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  filename text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create script_executions table
CREATE TABLE IF NOT EXISTS script_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id uuid NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  error_message text,
  output_log text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE script_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE script_executions ENABLE ROW LEVEL SECURITY;

-- Policies for script_categories (public read for demo)
CREATE POLICY "Anyone can view categories"
  ON script_categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert categories"
  ON script_categories FOR INSERT
  WITH CHECK (true);

-- Policies for scripts (public read for demo)
CREATE POLICY "Anyone can view scripts"
  ON scripts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scripts"
  ON scripts FOR INSERT
  WITH CHECK (true);

-- Policies for script_executions (public for demo)
CREATE POLICY "Anyone can view executions"
  ON script_executions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert executions"
  ON script_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update executions"
  ON script_executions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Insert initial categories
INSERT INTO script_categories (name, display_order) VALUES
  ('Count Request', 1),
  ('LinkedIn Mapping', 2),
  ('Data Pull', 3),
  ('Boolean Helper', 4),
  ('Daily Dedupe', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert scripts for Count Request category
INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Count Request'),
  'Download Files',
  '0_download files for count request_v1.0.1.py',
  'Download required files for count request processing',
  1
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '0_download files for count request_v1.0.1.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Count Request'),
  'Bulk Excel Converter',
  '1_bulk_excel_converter_v1.1.5.py',
  'Convert multiple Excel files in bulk',
  2
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '1_bulk_excel_converter_v1.1.5.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Count Request'),
  'Run Tool 1',
  '2_run_tool1_v1.py',
  'Execute primary processing tool',
  3
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '2_run_tool1_v1.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Count Request'),
  'Rename Files (Optional)',
  '2B_rename_files_optional_v0.0.1.py',
  'Optional file renaming utility',
  4
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '2B_rename_files_optional_v0.0.1.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Count Request'),
  'LinkedIn Uploader',
  '3_LI_uploader_v0.0.6.py',
  'Upload processed data to LinkedIn',
  5
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '3_LI_uploader_v0.0.6.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Count Request'),
  'Clean TAL',
  'CLEAN TAL_v0.0.1.py',
  'Clean and prepare TAL data',
  6
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = 'CLEAN TAL_v0.0.1.py');

-- Insert scripts for LinkedIn Mapping category
INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'LinkedIn Mapping'),
  'Download & Rename Files',
  '0_download_rename_files.py',
  'Download and rename LinkedIn mapping files',
  1
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '0_download_rename_files.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'LinkedIn Mapping'),
  'Count Rows with Split',
  '1_count_rows_w_split_v0.5.py',
  'Count and split rows in data files',
  2
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '1_count_rows_w_split_v0.5.py');

-- Insert scripts for Data Pull category
INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Data Pull'),
  'Workspace Data Pull',
  '01 - for ws data pull_v3.0.3_TRIAL.py',
  'Pull data from workspace (Trial version)',
  1
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = '01 - for ws data pull_v3.0.3_TRIAL.py');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Data Pull'),
  'Extract from SF Report',
  'extract from sf report page NEW_v0.1.1.py',
  'Extract data from Salesforce report pages',
  2
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = 'extract from sf report page NEW_v0.1.1.py');

-- Insert scripts for Boolean Helper category
INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Boolean Helper'),
  'Job Titles Prompt Builder',
  'JobTitlesPromptBuilder_v0.0.8.pyw',
  'Build boolean search prompts for job titles',
  1
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = 'JobTitlesPromptBuilder_v0.0.8.pyw');

INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Boolean Helper'),
  'LinkedIn Prompt Builder',
  'LIPromptBuilder_v0.0.3.pyw',
  'Build LinkedIn boolean search prompts',
  2
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = 'LIPromptBuilder_v0.0.3.pyw');

-- Insert scripts for Daily Dedupe category
INSERT INTO scripts (category_id, name, filename, description, display_order)
SELECT 
  (SELECT id FROM script_categories WHERE name = 'Daily Dedupe'),
  'Daily Dedupe',
  'daily_dedupe_code_demo_v0.1.py',
  'Remove duplicate entries from daily data',
  1
WHERE NOT EXISTS (SELECT 1 FROM scripts WHERE filename = 'daily_dedupe_code_demo_v0.1.py');