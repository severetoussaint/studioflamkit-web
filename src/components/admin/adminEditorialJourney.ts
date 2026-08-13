/**
 * Derive Admin Editorial Journey — Studio Flamkit
 * Adaptación administrativa de la ruta editorial de 6 fases.
 * Consume datos reales del workspace y legacy para determinar fase actual.
 *
 * NO inventa estados. NO crea datos ficticios.
 * Fuente de verdad: project_requests, projects (domain), proposals (domain), production_stages, reviews.
 */

import type { Project, ProjectStatus, ProjectProgress } from '@/types/domain.types';

export type AdminEditorialPhase =
  | 'recibido'
  | 'analisis'
  | 'propuesta'
  | 'produccion'
  | 'revision'
  | 'entrega';

export type AdminEditorialStepStatus = 'completado' | 'activo' | 'pendiente' | 'bloqueado';

export interface AdminEditorialStep {
  id: AdminEditorialPhase;
  title: string;
  description: string;
  status: AdminEditorialStepStatus;
  adminHint: string; // qué debe hacer el admin en esta etapa
}

export interface AdminEditorialJourney {
  currentPhase: AdminEditorialPhase;
  steps: AdminEditorialStep[];
  nextActionTitle: string;
  nextActionDescription: string;
  isBlocked: boolean;
}

const PHASE_META: Record<AdminEditorialPhase, { title: string; description: string; adminHint: string }> = {
  recibido: {
    title: 'Recibido',
    description: 'Manuscrito registrado en el sistema.',
    adminHint: 'Confirmar recepción y asignar a cola de lectura.',
  },
  analisis: {
    title: 'Análisis',
    description: 'Evaluación editorial en curso.',
    adminHint: 'Completar evaluación técnica y narrativa.',
  },
  propuesta: {
    title: 'Propuesta',
    description: 'Propuesta comercial y de servicios.',
    adminHint: 'Preparar o gestionar propuesta pendiente.',
  },
  produccion: {
    title: 'Producción',
    description: 'Grabación, edición y mezcla de capítulos.',
    adminHint: 'Supervisar avance de capítulos y entregables.',
  },
  revision: {
    title: 'Revisión',
    description: 'Feedback del autor y correcciones.',
    adminHint: 'Revisar observaciones abiertas y coordinar cambios.',
  },
  entrega: {
    title: 'Entrega Final',
    description: 'Master final y cierre de obra.',
    adminHint: 'Validar entregables finales y cerrar proyecto.',
  },
};

const PHASE_ORDER: AdminEditorialPhase[] = [
  'recibido',
  'analisis',
  'propuesta',
  'produccion',
  'revision',
  'entrega',
];

interface DeriveContext {
  project: Project | null;
  progress: ProjectProgress | null;
  hasOpenReviews: boolean;
  // Legacy bridge — si no hay dominio nuevo, usamos estos para no romper la experiencia
  legacyStatus: 'analisis' | 'produccion' | 'revisiones' | 'completado' | null;
  hasRequest: boolean;
  hasProposal: boolean; // si existe proposalId en el project domain
}

function resolvePhase(ctx: DeriveContext): AdminEditorialPhase {
  // 1. Si hay proyecto de dominio real, usamos su status
  if (ctx.project) {
    const status = ctx.project.status;

    if (status === 'completed' || status === 'archived') return 'entrega';
    if (status === 'review') return 'revision';
    if (status === 'production') {
      // Si hay reviews abiertas, podríamos estar en revisión aunque el status sea production
      // Pero por regla de dominio: status production = producción activa
      return 'produccion';
    }
    if (status === 'planning') {
      // En planning: podemos estar en análisis o propuesta según proposal
      if (ctx.hasProposal || ctx.project.proposalId) return 'propuesta';
      if (ctx.hasRequest) return 'analisis';
      return 'recibido';
    }
  }

  // 2. Fallback a legacy status mapping
  if (ctx.legacyStatus) {
    const map: Record<string, AdminEditorialPhase> = {
      analisis: 'analisis',
      produccion: 'produccion',
      revisiones: 'revision',
      completado: 'entrega',
    };
    return map[ctx.legacyStatus] ?? 'recibido';
  }

  // 3. Si solo hay request, estamos en recibido/análisis
  if (ctx.hasRequest) return 'recibido';

  return 'recibido';
}

function buildSteps(phase: AdminEditorialPhase, ctx: DeriveContext): AdminEditorialStep[] {
  const activeIndex = PHASE_ORDER.indexOf(phase);

  return PHASE_ORDER.map((id, index) => {
    let status: AdminEditorialStepStatus;

    if (index < activeIndex) {
      status = 'completado';
    } else if (index === activeIndex) {
      // Bloqueado solo si hay reviews abiertas y estamos en produccion (inconsistencia que admin debe resolver)
      if (id === 'produccion' && ctx.hasOpenReviews) {
        status = 'bloqueado';
      } else {
        status = 'activo';
      }
    } else {
      status = 'pendiente';
    }

    const meta = PHASE_META[id];
    return {
      id,
      title: meta.title,
      description: meta.description,
      status,
      adminHint: meta.adminHint,
    };
  });
}

function deriveNextAction(phase: AdminEditorialPhase, ctx: DeriveContext): { title: string; description: string } {
  switch (phase) {
    case 'recibido':
      return {
        title: 'Revisar nueva solicitud',
        description: 'Confirma recepción del manuscrito y asigna prioridad de lectura.',
      };
    case 'analisis':
      return {
        title: 'Completar evaluación editorial',
        description: 'Finaliza el análisis técnico y prepara el dictamen de viabilidad.',
      };
    case 'propuesta':
      return {
        title: ctx.hasProposal ? 'Revisar propuesta pendiente' : 'Preparar propuesta',
        description: ctx.hasProposal
          ? 'La propuesta está enviada. Esperando respuesta del autor o gestionando ajustes.'
          : 'Genera el desglose comercial y técnico para presentar al autor.',
      };
    case 'produccion':
      return {
        title: ctx.hasOpenReviews ? 'Revisar feedback antes de continuar' : 'Supervisar producción activa',
        description: ctx.hasOpenReviews
          ? 'Hay observaciones abiertas que bloquean el avance limpio. Atiende antes de seguir.'
          : 'Monitorea capítulos en grabación/edición y valida entregables parciales.',
      };
    case 'revision':
      return {
        title: 'Coordinar correcciones',
        description: 'Gestiona las observaciones del autor, asigna regrabaciones y valida cambios.',
      };
    case 'entrega':
      return {
        title: 'Confirmar entrega final',
        description: 'Valida master final, documenta cierre y archiva el proyecto.',
      };
  }
}

export function deriveAdminEditorialJourney(ctx: DeriveContext): AdminEditorialJourney {
  const currentPhase = resolvePhase(ctx);
  const steps = buildSteps(currentPhase, ctx);
  const nextAction = deriveNextAction(currentPhase, ctx);

  const isBlocked = steps.some((s) => s.status === 'bloqueado');

  return {
    currentPhase,
    steps,
    nextActionTitle: nextAction.title,
    nextActionDescription: nextAction.description,
    isBlocked,
  };
}
