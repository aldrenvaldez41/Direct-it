import { useEffect, useState } from 'react';
import { Terminal, Zap, AlertCircle } from 'lucide-react';
import { CategoryWithScripts } from './types';
import { CategorySection } from './components/CategorySection';
import {
  fetchCategoriesWithScripts,
  createScriptExecution,
  simulateScriptExecution,
} from './utils/scriptService';

function App() {
  const [categories, setCategories] = useState<CategoryWithScripts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningScripts, setRunningScripts] = useState<Set<string>>(new Set());
  const [scriptStatuses, setScriptStatuses] = useState<Map<string, 'completed' | 'failed'>>(
    new Map()
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategoriesWithScripts();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScript = async (scriptId: string) => {
    try {
      setRunningScripts((prev) => new Set(prev).add(scriptId));
      setScriptStatuses((prev) => {
        const newMap = new Map(prev);
        newMap.delete(scriptId);
        return newMap;
      });

      const executionId = await createScriptExecution(scriptId);
      await simulateScriptExecution(scriptId, executionId);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading automation scripts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={loadData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg">
              <Zap className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                DirectIt Task Automation Suite
              </h1>
              <p className="text-slate-300 mt-2 text-lg">
                Streamlined automation for your workflow
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">No automation scripts available</p>
          </div>
        ) : (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              runningScripts={runningScripts}
              scriptStatuses={scriptStatuses}
              onRunScript={handleRunScript}
            />
          ))
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">
            {categories.reduce((acc, cat) => acc + cat.scripts.length, 0)} automation scripts
            across {categories.length} categories
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
