# Python Script Integration Examples

## Overview

This document provides concrete examples for integrating your Python automation scripts with the web GUI.

---

## Example 1: Simple Flask Backend

Create a Flask API that executes Python scripts:

**backend/app.py**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json

app = Flask(__name__)
CORS(app)

SCRIPT_DIR = "/path/to/Directit-Task-Automation"

@app.route('/api/execute-script', methods=['POST'])
def execute_script():
    data = request.json
    script_filename = data.get('filename')

    script_path = os.path.join(SCRIPT_DIR, script_filename)

    if not os.path.exists(script_path):
        return jsonify({
            'success': False,
            'error': f'Script not found: {script_filename}'
        }), 404

    try:
        result = subprocess.run(
            ['python', script_path],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        return jsonify({
            'success': result.returncode == 0,
            'output': result.stdout,
            'error': result.stderr if result.returncode != 0 else None
        })

    except subprocess.TimeoutExpired:
        return jsonify({
            'success': False,
            'error': 'Script execution timed out'
        }), 408

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

**Install requirements:**
```bash
pip install flask flask-cors
```

**Run the backend:**
```bash
python backend/app.py
```

---

## Example 2: FastAPI Backend (Modern Alternative)

**backend/main.py**
```python
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCRIPT_DIR = "/path/to/Directit-Task-Automation"

class ExecuteRequest(BaseModel):
    filename: str
    execution_id: str

class ExecuteResponse(BaseModel):
    success: bool
    output: str = None
    error: str = None

@app.post("/api/execute-script", response_model=ExecuteResponse)
async def execute_script(request: ExecuteRequest):
    script_path = os.path.join(SCRIPT_DIR, request.filename)

    if not os.path.exists(script_path):
        raise HTTPException(status_code=404, detail="Script not found")

    try:
        process = await asyncio.create_subprocess_exec(
            'python', script_path,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        stdout, stderr = await process.communicate()

        return ExecuteResponse(
            success=process.returncode == 0,
            output=stdout.decode(),
            error=stderr.decode() if process.returncode != 0 else None
        )

    except Exception as e:
        return ExecuteResponse(
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
```

**Install requirements:**
```bash
pip install fastapi uvicorn
```

**Run the backend:**
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

---

## Example 3: Supabase Edge Function Integration

**supabase/functions/execute-script/index.ts**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { filename, executionId } = await req.json();

    // Call your Python execution service
    const response = await fetch("YOUR_PYTHON_SERVICE_URL/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename })
    });

    const result = await response.json();

    // Update execution in Supabase
    // ... update script_executions table ...

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

---

## Example 4: Electron Desktop App Integration

**electron/main.js**
```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadURL('http://localhost:5173'); // Your Vite dev server
}

ipcMain.handle('execute-script', async (event, scriptPath) => {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python', [scriptPath]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      event.sender.send('script-output', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout,
        error: code !== 0 ? stderr : null
      });
    });
  });
});

app.whenReady().then(createWindow);
```

**Frontend integration (preload.js):**
```javascript
const { ipcRenderer } = require('electron');

window.electronAPI = {
  executeScript: (scriptPath) => ipcRenderer.invoke('execute-script', scriptPath),
  onScriptOutput: (callback) => ipcRenderer.on('script-output', callback)
};
```

---

## Example 5: Modifying Frontend to Call Backend

Update `src/utils/scriptService.ts`:

```typescript
import { supabase } from '../lib/supabase';
import { ScriptExecution } from '../types';

const BACKEND_URL = 'http://localhost:5000'; // Your backend URL

export async function executeScript(
  scriptId: string,
  scriptFilename: string,
  executionId: string
): Promise<void> {
  try {
    // Call your backend
    const response = await fetch(`${BACKEND_URL}/api/execute-script`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: scriptFilename,
        executionId: executionId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Update execution in Supabase
    await supabase
      .from('script_executions')
      .update({
        status: result.success ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        output_log: result.output,
        error_message: result.error
      })
      .eq('id', executionId);

  } catch (error) {
    await supabase
      .from('script_executions')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', executionId);

    throw error;
  }
}
```

Then update `src/App.tsx` to use the new function:

```typescript
const handleRunScript = async (scriptId: string) => {
  try {
    // Find the script to get its filename
    const script = categories
      .flatMap(cat => cat.scripts)
      .find(s => s.id === scriptId);

    if (!script) {
      throw new Error('Script not found');
    }

    setRunningScripts((prev) => new Set(prev).add(scriptId));
    setScriptStatuses((prev) => {
      const newMap = new Map(prev);
      newMap.delete(scriptId);
      return newMap;
    });

    const executionId = await createScriptExecution(scriptId);

    // Use the new executeScript function
    await executeScript(scriptId, script.filename, executionId);

    setScriptStatuses((prev) => new Map(prev).set(scriptId, 'completed'));
  } catch (err) {
    setScriptStatuses((prev) => new Map(prev).set(scriptId, 'failed'));
    console.error('Script execution failed:', err);
  } finally {
    setRunningScripts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(scriptId);
      return newSet;
    });
  }
};
```

---

## Quick Start Guide

1. **Choose your backend approach** (Flask, FastAPI, or Edge Functions)
2. **Set up the backend server** using one of the examples above
3. **Update the frontend** to call your backend instead of simulating
4. **Test with one script** first before deploying all
5. **Add error handling** and logging as needed
6. **Deploy** your backend to a cloud service

---

## Environment Variables

Add to your `.env` file:

```bash
VITE_BACKEND_URL=http://localhost:5000
# or for production:
VITE_BACKEND_URL=https://your-backend.com
```

Then use in your code:
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
```

---

## Security Considerations

1. **Authentication**: Add API keys or JWT tokens to secure your backend
2. **Input Validation**: Validate script filenames to prevent path traversal
3. **Rate Limiting**: Prevent abuse by limiting execution frequency
4. **Timeouts**: Set reasonable timeouts for script execution
5. **Logging**: Log all execution attempts for audit purposes

---

## Testing Your Integration

1. Start your backend server
2. Start the frontend dev server
3. Open browser console to see network requests
4. Click "Run Script" and verify:
   - Network request is sent to backend
   - Backend executes the Python script
   - Response updates the database
   - UI reflects the status change

---

## Production Deployment

**Backend Options:**
- AWS EC2 or Lambda
- Google Cloud Run
- Heroku
- DigitalOcean Droplets
- Railway.app

**Frontend:**
- Vercel (recommended for Vite apps)
- Netlify
- Cloudflare Pages
- GitHub Pages

**Database:**
- Supabase (already set up)

---

## Troubleshooting

**Script not found:**
- Check `SCRIPT_DIR` path is correct
- Verify file permissions
- Use absolute paths

**Timeout errors:**
- Increase timeout value
- Optimize long-running scripts
- Consider background job queue

**CORS errors:**
- Ensure CORS headers are set correctly
- Check backend allows your frontend origin
- Verify preflight OPTIONS request handling

**Permission errors:**
- Ensure Python is in PATH
- Check script execution permissions
- Verify required dependencies installed
