import type { Database } from '@/types/database.types';
import type { Evaluation, EvaluationResult } from '@/types/domain.types';

type EvaluationRow = Database['public']['Tables']['evaluations']['Row'];

const EVALUATION_RESULTS: readonly EvaluationResult[] = [
  'approved',
  'approved_with_notes',
  'rejected',
];

function mapEvaluationResult(value: string | null): EvaluationResult {
  return EVALUATION_RESULTS.includes(value as EvaluationResult)
    ? (value as EvaluationResult)
    : 'approved';
}

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
    result: mapEvaluationResult(row.result),
    createdAt: row.created_at ?? '',
  };
}
