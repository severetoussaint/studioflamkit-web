import type { EditorialJourney, EditorialPhase } from '@/types/domain.types';

export interface EditorialJourneyPresentation {
  label: string;
  nextActionTitle: string;
  nextActionDescription: string;
  buttonLabel?: string;
}

const PRESENTATION_BY_PHASE: Record<EditorialPhase, EditorialJourneyPresentation> = {
  received: {
    label: 'Recibido',
    nextActionTitle: 'Esperar evaluación',
    nextActionDescription: 'Estamos confirmando la recepción y preparando la lectura editorial.',
    buttonLabel: 'Ver ruta editorial',
  },
  analysis: {
    label: 'En análisis',
    nextActionTitle: 'Evaluación en curso',
    nextActionDescription: 'Nuestro equipo analiza estructura, extensión y viabilidad de producción.',
    buttonLabel: 'Ver estado',
  },
  proposal: {
    label: 'Propuesta en preparación',
    nextActionTitle: 'Revisar propuesta',
    nextActionDescription: 'Pronto tendrás el plan de producción y la propuesta para avanzar.',
    buttonLabel: 'Revisar propuesta',
  },
  production: {
    label: 'Producción',
    nextActionTitle: 'Seguir producción',
    nextActionDescription: 'Ya se están materializando capítulos y entregables reales.',
    buttonLabel: 'Ver producción',
  },
  review: {
    label: 'En revisión',
    nextActionTitle: 'Responder observaciones',
    nextActionDescription: 'Revisa comentarios, valida capítulos y desbloquea el cierre final.',
    buttonLabel: 'Responder observaciones',
  },
  completed: {
    label: 'Entrega final',
    nextActionTitle: 'Descargar entrega final',
    nextActionDescription: 'Tu obra ya está lista para salir del estudio con todo validado.',
    buttonLabel: 'Ver entrega final',
  },
};

const FALLBACK_BY_STATE: Record<'pending' | 'active', EditorialJourneyPresentation> = {
  pending: {
    label: 'Manuscrito Recibido',
    nextActionTitle: 'Esperar evaluación',
    nextActionDescription: 'Estamos confirmando la recepción y preparando la lectura editorial.',
    buttonLabel: 'Ver ruta editorial',
  },
  active: {
    label: 'En Producción Audiocinematográfica',
    nextActionTitle: 'Seguir producción',
    nextActionDescription: 'Ya se están materializando capítulos y entregables reales.',
    buttonLabel: 'Ver producción',
  },
};

export function getEditorialJourneyPresentation(
  journey: EditorialJourney | null | undefined,
  state: 'pending' | 'active',
): EditorialJourneyPresentation {
  if (journey) {
    return PRESENTATION_BY_PHASE[journey.currentPhase];
  }

  return FALLBACK_BY_STATE[state];
}
