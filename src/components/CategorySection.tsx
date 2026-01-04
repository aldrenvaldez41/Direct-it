import { Folder } from 'lucide-react';
import { CategoryWithScripts } from '../types';
import { ScriptCard } from './ScriptCard';

interface CategorySectionProps {
  category: CategoryWithScripts;
  runningScripts: Set<string>;
  scriptStatuses: Map<string, 'completed' | 'failed'>;
  onRunScript: (scriptId: string) => void;
}

export function CategorySection({
  category,
  runningScripts,
  scriptStatuses,
  onRunScript,
}: CategorySectionProps) {
  const getCategoryIcon = () => {
    const iconClass = "w-6 h-6";
    return <Folder className={iconClass} />;
  };

  const getCategoryColor = () => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-amber-500',
      'from-pink-500 to-rose-500',
      'from-violet-500 to-purple-500',
    ];
    return colors[(category.display_order - 1) % colors.length];
  };

  return (
    <div className="mb-12">
      <div className={`bg-gradient-to-r ${getCategoryColor()} text-white rounded-xl shadow-lg p-6 mb-6`}>
        <div className="flex items-center gap-3">
          {getCategoryIcon()}
          <div>
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <p className="text-white/90 text-sm mt-1">
              {category.scripts.length} {category.scripts.length === 1 ? 'script' : 'scripts'} available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.scripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            onRun={onRunScript}
            isRunning={runningScripts.has(script.id)}
            lastStatus={scriptStatuses.get(script.id) || null}
          />
        ))}
      </div>
    </div>
  );
}
