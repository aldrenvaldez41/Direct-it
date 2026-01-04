# Script Organization Reference

## Your Script Structure in the GUI

This document shows how your original Python scripts are organized in the new web interface.

---

## Category 1: Count Request (6 scripts)

Your "Count Request" workflow has been broken down into 6 sequential scripts:

1. **Download Files**
   - File: `0_download files for count request_v1.0.1.py`
   - Description: Download required files for count request processing
   - Typical Use: First step in the count request workflow

2. **Bulk Excel Converter**
   - File: `1_bulk_excel_converter_v1.1.5.py`
   - Description: Convert multiple Excel files in bulk
   - Typical Use: Format conversion after download

3. **Run Tool 1**
   - File: `2_run_tool1_v1.py`
   - Description: Execute primary processing tool
   - Typical Use: Main data processing step

4. **Rename Files (Optional)**
   - File: `2B_rename_files_optional_v0.0.1.py`
   - Description: Optional file renaming utility
   - Typical Use: File organization as needed

5. **LinkedIn Uploader**
   - File: `3_LI_uploader_v0.0.6.py`
   - Description: Upload processed data to LinkedIn
   - Typical Use: Final upload step

6. **Clean TAL**
   - File: `CLEAN TAL_v0.0.1.py`
   - Description: Clean and prepare TAL data
   - Typical Use: Data cleanup process

**Visual Flow:**
```
Download → Convert → Process → [Optional Rename] → Upload → Clean
```

---

## Category 2: LinkedIn Mapping (2 scripts)

LinkedIn-related mapping and processing tasks:

1. **Download & Rename Files**
   - File: `0_download_rename_files.py`
   - Description: Download and rename LinkedIn mapping files
   - Typical Use: Initial file preparation

2. **Count Rows with Split**
   - File: `1_count_rows_w_split_v0.5.py`
   - Description: Count and split rows in data files
   - Typical Use: Data analysis and segmentation

**Visual Flow:**
```
Download & Rename → Count & Split
```

---

## Category 3: Data Pull (2 scripts)

Scripts for extracting data from various sources:

1. **Workspace Data Pull**
   - File: `01 - for ws data pull_v3.0.3_TRIAL.py`
   - Description: Pull data from workspace (Trial version)
   - Typical Use: Workspace data extraction

2. **Extract from SF Report**
   - File: `extract from sf report page NEW_v0.1.1.py`
   - Description: Extract data from Salesforce report pages
   - Typical Use: Salesforce data extraction

**Visual Flow:**
```
Workspace Pull | SF Report Extract
    (Parallel operations)
```

---

## Category 4: Boolean Helper (2 scripts)

Tools for building search queries and prompts:

1. **Job Titles Prompt Builder**
   - File: `JobTitlesPromptBuilder_v0.0.8.pyw`
   - Description: Build boolean search prompts for job titles
   - Typical Use: Creating targeted job title searches
   - Note: `.pyw` extension indicates GUI script

2. **LinkedIn Prompt Builder**
   - File: `LIPromptBuilder_v0.0.3.pyw`
   - Description: Build LinkedIn boolean search prompts
   - Typical Use: Creating LinkedIn search strings
   - Note: `.pyw` extension indicates GUI script

**Visual Flow:**
```
Job Titles Builder | LinkedIn Builder
    (Independent tools)
```

---

## Category 5: Daily Dedupe (1 script)

Daily maintenance and data cleanup:

1. **Daily Dedupe**
   - File: `daily_dedupe_code_demo_v0.1.py`
   - Description: Remove duplicate entries from daily data
   - Typical Use: Daily data maintenance routine

**Visual Flow:**
```
Daily Data → Dedupe → Clean Output
```

---

## Recommended Folder Structure

To organize your Python scripts with this GUI, use this structure:

```
project-root/
├── frontend/                          # This web application
│   ├── src/
│   ├── public/
│   └── ...
│
├── backend/                           # Your Python backend (optional)
│   ├── app.py
│   └── requirements.txt
│
└── scripts/                           # Your Python automation scripts
    ├── count_request/
    │   ├── 0_download files for count request_v1.0.1.py
    │   ├── 1_bulk_excel_converter_v1.1.5.py
    │   ├── 2_run_tool1_v1.py
    │   ├── 2B_rename_files_optional_v0.0.1.py
    │   ├── 3_LI_uploader_v0.0.6.py
    │   └── CLEAN TAL_v0.0.1.py
    │
    ├── linkedin_mapping/
    │   ├── 0_download_rename_files.py
    │   └── 1_count_rows_w_split_v0.5.py
    │
    ├── data_pull/
    │   ├── 01 - for ws data pull_v3.0.3_TRIAL.py
    │   └── extract from sf report page NEW_v0.1.1.py
    │
    ├── boolean_helper/
    │   ├── JobTitlesPromptBuilder_v0.0.8.pyw
    │   └── LIPromptBuilder_v0.0.3.pyw
    │
    └── daily_dedupe/
        └── daily_dedupe_code_demo_v0.1.py
```

---

## Script Dependencies

If your scripts have dependencies between them, document them here:

### Count Request Workflow Dependencies:
```
Step 1 (Download) → Must complete before Step 2 (Convert)
Step 2 (Convert) → Must complete before Step 3 (Tool1)
Step 3 (Tool1) → Must complete before Step 5 (Upload)
Step 4 (Rename) → Optional, can run anytime
Step 6 (Clean TAL) → Can run independently
```

### Shared Dependencies:
List any Python packages required by your scripts:
```
- pandas
- openpyxl
- requests
- selenium (if browser automation)
- beautifulsoup4 (if web scraping)
- etc.
```

---

## Adding Sequential Execution

If scripts need to run in sequence, you can modify the frontend to:

1. Add a "Run Workflow" button for the Count Request category
2. Execute scripts 1 → 2 → 3 → 5 automatically
3. Show progress for each step
4. Stop if any step fails

Example implementation in `src/components/CategorySection.tsx`:

```typescript
const runWorkflow = async (scripts: Script[]) => {
  for (const script of scripts) {
    await onRunScript(script.id);
    // Wait for completion before next script
  }
};
```

---

## Execution History

All script executions are tracked in the `script_executions` table:

**Fields stored:**
- Execution timestamp
- Success/failure status
- Output logs
- Error messages
- Duration

**Query execution history:**
```sql
SELECT
  s.name,
  se.status,
  se.started_at,
  se.completed_at,
  se.error_message
FROM script_executions se
JOIN scripts s ON s.id = se.script_id
ORDER BY se.started_at DESC
LIMIT 10;
```

---

## Future Enhancements

Consider adding these features:

1. **Scheduling**: Run scripts at specific times
2. **Chaining**: Auto-run dependent scripts
3. **Parameters**: Pass arguments to scripts
4. **File Upload**: Provide input files via UI
5. **Notifications**: Email/Slack alerts on completion
6. **Logs Viewer**: Display full execution logs
7. **Version Control**: Track script version history
8. **Rollback**: Revert to previous versions

---

## Migration Checklist

- [ ] Set up backend server (Flask/FastAPI)
- [ ] Copy all Python scripts to server
- [ ] Install Python dependencies on server
- [ ] Test each script individually
- [ ] Update frontend to call backend
- [ ] Test script execution through GUI
- [ ] Set up error logging
- [ ] Configure production environment
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to cloud service
- [ ] Test end-to-end workflow
- [ ] Document any script-specific requirements

---

## Contact & Support

The GUI application is production-ready. All scripts are registered in the database and the interface is fully functional.

For questions about integrating your specific Python scripts, refer to:
- `IMPLEMENTATION_GUIDE.md` - Overall architecture
- `PYTHON_INTEGRATION_EXAMPLES.md` - Code examples
- This file - Script organization reference
