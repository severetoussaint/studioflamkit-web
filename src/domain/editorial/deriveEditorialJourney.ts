import type {
  EditorialJourney,
  EditorialPhase,
  EditorialStepStatus,
  EvaluationResult,
  ProjectStatus,
  ProposalStatus,
  RequestStatus,
} from '@/types/domain.types';

/**
 * Inputs required to derive the six-phase editorial journey.
 * This is deliberately presentation-agnostic: labels, buttons and copy
 * belong to role-specific ViewModels, not to the domain layer.
 */
export interface EditorialJourneyContext {
  hasManuscript: boolean;
  requestStatus: RequestStatus | null;
  evaluationResult: EvaluationResult | null;
  proposalStatus: ProposalStatus | null;
  projectStatus: ProjectStatus | null;
  hasOpenReviews: boolean;
}

const PHASE_SEQUENCE: EditorialPhase[] = [
  'received',
  'analysis',
  'proposal',
  'production',
  'review',
  'completed',
];

function currentPhaseFromContext(context: EditorialJourneyContext): EditorialPhase | null {
  if (!context.hasManuscript) return null;

  if (context.projectStatus === 'completed') return 'completed';

  if (context.projectStatus === 'review' || context.hasOpenReviews) return 'review';

  if (context.projectStatus === 'production') return 'production';

  if (context.proposalStatus === 'pending' || context.proposalStatus === 'rejected' || context.proposalStatus === 'expired') {
    return 'proposal';
  }

  if (context.proposalStatus === 'accepted' || context.evaluationResult === 'approved' || context.evaluationResult === 'approved_with_notes') {
    return 'production';
  }

  if (context.requestStatus === 'evaluating' || context.evaluationResult === 'rejected') return 'analysis';

  return 'received';
}

function buildStepStatus(currentPhase: EditorialPhase, phase: EditorialPhase): EditorialStepStatus {
  const currentIndex = PHASE_SEQUENCE.indexOf(currentPhase);
  const phaseIndex = PHASE_SEQUENCE.indexOf(phase);

  if (phaseIndex < currentIndex) return 'completed';
  if (phaseIndex === currentIndex) return 'active';
  return 'pending';
}

export function deriveEditorialJourney(context: EditorialJourneyContext): EditorialJourney | null {
  const currentPhase = currentPhaseFromContext(context);

  if (!currentPhase) return null;

  return {
    currentPhase,
    steps: PHASE_SEQUENCE.map((phase) => ({
      id: phase,
      status: buildStepStatus(currentPhase, phase),
    })),
  };
}
