import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { ProductionStage, ProjectProgress } from '@/types/domain.types';

export type ProductionStageRow = Database['public']['Tables']['production_stages']['Row'];

function mapProductionStage(row: ProductionStageRow): ProductionStage {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    orderIndex: row.order_index,
    progressPercentage: row.progress_percentage ?? 0,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    assignedTo: row.assigned_to,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function listProductionStages(projectId: string): Promise<ProductionStage[]> {
  const { data, error } = await supabaseClient
    .from('production_stages')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapProductionStage);
}

export function deriveProjectProgress(stages: ProductionStage[]): ProjectProgress {
  if (stages.length === 0) {
    return {
      percentage: 0,
      completedStages: 0,
      totalStages: 0,
      currentStageId: null,
    };
  }

  const total = stages.reduce((sum, stage) => sum + stage.progressPercentage, 0);
  const percentage = Math.round(total / stages.length);
  const completedStages = stages.filter((stage) => stage.status === 'completed').length;
  const currentStage = stages.find((stage) => stage.status !== 'completed');

  return {
    percentage,
    completedStages,
    totalStages: stages.length,
    currentStageId: currentStage?.id ?? stages[stages.length - 1]?.id ?? null,
  };
}

export async function getProjectProgress(projectId: string): Promise<ProjectProgress> {
  const stages = await listProductionStages(projectId);
  return deriveProjectProgress(stages);
}
