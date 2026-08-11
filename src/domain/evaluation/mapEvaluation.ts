import type { Database } from '@/types/database.types';
import type { Evaluation } from '@/types/domain.types';

type EvaluationRow = Database['public']['Tables']['evaluations']['Row'];

/** Maps the persisted evaluation row into the shared domain model. */
export function mapEvaluationRowToDomain(row: EvaluationRow): Evaluation {
  return {
    id: row.id,
    requestId: row.request_id,
    feasibility: row.feasibility,
    narrativeQuality: row.narrative_quality,
    technicalDifficulty: row.technical_difficulty,
    estimatedTime: row.estimated_time,
    observations: row.observations,
    result: row.result,
    createdAt: row.created_at ?? '',
  };
}
