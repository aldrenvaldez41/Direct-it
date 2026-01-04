import { supabase } from '../lib/supabase';
import { CategoryWithScripts, ScriptExecution } from '../types';

export async function fetchCategoriesWithScripts(): Promise<CategoryWithScripts[]> {
  const { data: categories, error: categoriesError } = await supabase
    .from('script_categories')
    .select('*')
    .order('display_order');

  if (categoriesError) {
    throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
  }

  const { data: scripts, error: scriptsError } = await supabase
    .from('scripts')
    .select('*')
    .order('display_order');

  if (scriptsError) {
    throw new Error(`Failed to fetch scripts: ${scriptsError.message}`);
  }

  const categoriesWithScripts: CategoryWithScripts[] = categories.map((category) => ({
    ...category,
    scripts: scripts.filter((script) => script.category_id === category.id),
  }));

  return categoriesWithScripts;
}

export async function createScriptExecution(scriptId: string): Promise<string> {
  const { data, error } = await supabase
    .from('script_executions')
    .insert({
      script_id: scriptId,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create execution record: ${error.message}`);
  }

  return data.id;
}

export async function updateScriptExecution(
  executionId: string,
  updates: Partial<ScriptExecution>
): Promise<void> {
  const { error } = await supabase
    .from('script_executions')
    .update(updates)
    .eq('id', executionId);

  if (error) {
    throw new Error(`Failed to update execution: ${error.message}`);
  }
}

export async function simulateScriptExecution(scriptId: string, executionId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));

  const success = Math.random() > 0.2;

  if (success) {
    await updateScriptExecution(executionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      output_log: 'Script executed successfully',
    });
  } else {
    await updateScriptExecution(executionId, {
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: 'Simulated error: Script execution failed',
    });
  }
}
