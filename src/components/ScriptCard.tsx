import { Play, Loader2, CheckCircle, XCircle, FileCode } from 'lucide-react';
import { Script } from '../types';

interface ScriptCardProps {
  script: Script;
  onRun: (scriptId: string) => void;
  isRunning: boolean;
  lastStatus?: 'completed' | 'failed' | null;
}

export function ScriptCard({ script, onRun, isRunning, lastStatus }: ScriptCardProps) {
  const getStatusIcon = () => {
    if (isRunning) {
      return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (lastStatus === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (lastStatus === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const getButtonClass = () => {
    if (isRunning) {
      return 'bg-blue-500 cursor-not-allowed opacity-75';
    }
    return 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 transition-all duration-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-3 rounded-lg">
            <FileCode className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{script.name}</h3>
            {script.description && (
              <p className="text-sm text-gray-600 mb-2">{script.description}</p>
            )}
            <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
              {script.filename}
            </p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      <button
        onClick={() => onRun(script.id)}
        disabled={isRunning}
        className={`w-full ${getButtonClass()} text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg`}
      >
        {isRunning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Run Script
          </>
        )}
      </button>
    </div>
  );
}
