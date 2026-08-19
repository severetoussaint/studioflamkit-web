import type { Database } from '@/types/database.types';
import type { Evaluation, EvaluationResult } from '@/types/domain.types';

type EvaluationRow = Database['public']['Tables']['evaluations']['Row'];

type EvaluationRowWithFollowUp = EvaluationRow & {
  author_message?: string | null;
  email_sent_at?: string | null;
  follow_up_note?: string | null;
};

const EVALUATION_RESULTS: ReadonlySet<string> = new Set([
  'approved',
  'approved_with_notes',
  'rejected',
]);

function mapEvaluationResult(value: string | null): EvaluationResult | null {
  if (value === null) return null;
  if (EVALUATION_RESULTS.has(value)) {
    return value as EvaluationResult;
  }
  return null;
}

export function mapEvaluationRowToDomain(row: EvaluationRow): Evaluation {
  const extended = row as EvaluationRowWithFollowUp;
  return {
    id: row.id,
    requestId: row.request_id,
    feasibility: row.feasibility,
    narrativeQuality: row.narrative_quality,
    technicalDifficulty: row.technical_difficulty,
    estimatedTime: row.estimated_time,
    observations: row.observations,
    result: mapEvaluationResult(row.result),
    authorMessage: extended.author_message ?? null,
    emailSentAt: extended.email_sent_at ?? null,
    followUpNote: extended.follow_up_note ?? null,
    createdAt: row.created_at ?? '',
  };
}
