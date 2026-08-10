export type EditorialStage = 'none' | 'recibido' | 'analisis' | 'propuesta' | 'produccion' | 'revision' | 'entrega';
export type EditorialStepStatus = 'completado' | 'activo' | 'pendiente' | 'bloqueado';
export type EditorialDashboardState = 'none' | 'pending' | 'active';

export interface EditorialSnapshot {
  state: EditorialDashboardState;
  progress: number;
  statusLabel?: string | null;
  projectTitle?: string | null;
  submittedDate?: string | null;
}

export interface EditorialTimelineStep {
  id: EditorialStage;
  title: string;
  description: string;
  status: EditorialStepStatus;
}

export interface EditorialJourney {
  stage: EditorialStage;
  label: string;
  progress: number;
  nextActionTitle: string;
  nextActionDescription: string;
  buttonLabel?: string;
  steps: EditorialTimelineStep[];
}

const EDITORIAL_SEQUENCE: Exclude<EditorialStage, 'none'>[] = [
  'recibido',
  'analisis',
  'propuesta',
  'produccion',
  'revision',
  'entrega',
];

const EDITORIAL_META: Record<EditorialStage, { title: string; description: string; nextActionTitle: string; nextActionDescription: string; buttonLabel?: string }> = {
  none: {
    title: 'Sin manuscrito',
    description: 'Aún no hay una obra enviada para esta cuenta.',
    nextActionTitle: 'Enviar manuscrito',
    nextActionDescription: 'Sube tu archivo para abrir la ruta editorial y recibir tu evaluación inicial.',
    buttonLabel: 'Subir Manuscrito',
  },
  recibido: {
    title: 'Recibido',
    description: 'El manuscrito ya está resguardado en el sistema.',
    nextActionTitle: 'Esperar evaluación',
    nextActionDescription: 'Estamos confirmando la recepción y preparando la lectura editorial.',
    buttonLabel: 'Ver ruta editorial',
  },
  analisis: {
    title: 'En análisis',
    description: 'La obra está siendo revisada por el equipo editorial.',
    nextActionTitle: 'Evaluación en curso',
    nextActionDescription: 'Nuestro equipo analiza estructura, extensión y viabilidad de producción.',
    buttonLabel: 'Ver estado',
  },
  propuesta: {
    title: 'Propuesta en preparación',
    description: 'Se está cerrando el desglose técnico y comercial.',
    nextActionTitle: 'Revisar propuesta',
    nextActionDescription: 'Pronto tendrás el plan de producción y la propuesta para avanzar.',
    buttonLabel: 'Revisar propuesta',
  },
  produccion: {
    title: 'Producción',
    description: 'La obra está en grabación, edición o mezcla.',
    nextActionTitle: 'Seguir producción',
    nextActionDescription: 'Ya se están materializando capítulos y entregables reales.',
    buttonLabel: 'Ver producción',
  },
  revision: {
    title: 'En revisión',
    description: 'Hay observaciones, correcciones o aprobaciones pendientes.',
    nextActionTitle: 'Responder observaciones',
    nextActionDescription: 'Revisa comentarios, valida capítulos y desbloquea el cierre final.',
    buttonLabel: 'Responder observaciones',
  },
  entrega: {
    title: 'Entrega final',
    description: 'El master o paquete final ya está listo para revisión o descarga.',
    nextActionTitle: 'Descargar entrega final',
    nextActionDescription: 'Tu obra ya está lista para salir del estudio con todo validado.',
    buttonLabel: 'Ver entrega final',
  },
};

const STAGE_PROGRESS: Record<EditorialStage, number> = {
  none: 0,
  recibido: 12,
  analisis: 28,
  propuesta: 48,
  produccion: 70,
  revision: 86,
  entrega: 100,
};

let editorialSnapshot: EditorialSnapshot | null = null;

export function storeEditorialSnapshot(snapshot: EditorialSnapshot | null) {
  editorialSnapshot = snapshot;
}

export function getEditorialSnapshot() {
  return editorialSnapshot;
}

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.max(0, Math.min(100, progress));
}

function normalize(value?: string | null) {
  return (value ?? '').toLowerCase().trim();
}

function deriveStage(snapshot: EditorialSnapshot | null): EditorialStage {
  if (!snapshot || snapshot.state === 'none') return 'none';

  const progress = clampProgress(snapshot.progress);

  if (snapshot.state === 'pending') {
    if (progress <= 5) return 'recibido';
    if (progress <= 28) return 'analisis';
    if (progress <= 55) return 'propuesta';
    if (progress <= 80) return 'produccion';
    if (progress <= 95) return 'revision';
    return 'entrega';
  }

  if (progress <= 18) return 'recibido';
  if (progress <= 35) return 'analisis';
  if (progress <= 55) return 'propuesta';
  if (progress <= 80) return 'produccion';
  if (progress < 100) return 'revision';
  return 'entrega';
}

function buildSteps(stage: EditorialStage): EditorialTimelineStep[] {
  if (stage === 'none') {
    return EDITORIAL_SEQUENCE.map((id) => ({
      id,
      title: EDITORIAL_META[id].title,
      description: EDITORIAL_META[id].description,
      status: 'pendiente',
    }));
  }

  const activeIndex = EDITORIAL_SEQUENCE.indexOf(stage as Exclude<EditorialStage, 'none'>);

  return EDITORIAL_SEQUENCE.map((id, index) => ({
    id,
    title: EDITORIAL_META[id].title,
    description: EDITORIAL_META[id].description,
    status: index < activeIndex ? 'completado' : index === activeIndex ? 'activo' : 'pendiente',
  }));
}

export function resolveEditorialJourney(snapshot: EditorialSnapshot | null = editorialSnapshot): EditorialJourney {
  const resolvedSnapshot = snapshot ?? editorialSnapshot;
  const stage = deriveStage(resolvedSnapshot);
  const meta = EDITORIAL_META[stage];
  const progress = resolvedSnapshot ? clampProgress(resolvedSnapshot.progress) || STAGE_PROGRESS[stage] : STAGE_PROGRESS[stage];

  return {
    stage,
    label: meta.title,
    progress,
    nextActionTitle: meta.nextActionTitle,
    nextActionDescription: meta.nextActionDescription,
    buttonLabel: meta.buttonLabel,
    steps: buildSteps(stage),
  };
}

export function snapshotFromDashboardProps(input: {
  state: EditorialDashboardState;
  progress: number;
  statusLabel?: string | null;
  projectTitle?: string | null;
  submittedDate?: string | null;
}): EditorialSnapshot {
  const progress = clampProgress(input.progress);
  return {
    state: input.state,
    progress,
    statusLabel: input.statusLabel ?? null,
    projectTitle: input.projectTitle ?? null,
    submittedDate: input.submittedDate ?? null,
  };
}

export function stageLabelFromSnapshot(snapshot: EditorialSnapshot | null = editorialSnapshot) {
  return resolveEditorialJourney(snapshot).label;
}

export function stageButtonLabelFromSnapshot(snapshot: EditorialSnapshot | null = editorialSnapshot) {
  return resolveEditorialJourney(snapshot).buttonLabel;
}

export function stageDescriptionFromSnapshot(snapshot: EditorialSnapshot | null = editorialSnapshot) {
  return resolveEditorialJourney(snapshot).nextActionDescription;
}

export function stageTitleFromSnapshot(snapshot: EditorialSnapshot | null = editorialSnapshot) {
  return resolveEditorialJourney(snapshot).nextActionTitle;
}

export function stageIndexFromSnapshot(snapshot: EditorialSnapshot | null = editorialSnapshot) {
  const stage = resolveEditorialJourney(snapshot).stage;
  return stage === 'none' ? -1 : EDITORIAL_SEQUENCE.indexOf(stage as Exclude<EditorialStage, 'none'>);
}

export function safeStageFromValues(state: EditorialDashboardState, progress: number) {
  return resolveEditorialJourney(snapshotFromDashboardProps({ state, progress })).stage;
}
