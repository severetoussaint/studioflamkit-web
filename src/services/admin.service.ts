export type AdminProjectStatus = 'analisis' | 'produccion' | 'revisiones' | 'completado';
export type QuotationRequestStatus = 'pendiente' | 'aprobada' | 'en_revision';

export interface QuotationRequest {
  id: string;
  client: string;
  title: string;
  requestedAt: string;
  status: QuotationRequestStatus;
  chapters: number;
  amount: number;
}

export interface AudioDeliverable {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: string;
}

export interface AdminProject {
  id: string;
  title: string;
  client: string;
  status: AdminProjectStatus;
  progress: number;
  revisionsUsed: number;
  maxRevisions: number;
  chapters: number;
  deliverables: AudioDeliverable[];
  lastUpdate: string;
}

const initialQuotationRequests: QuotationRequest[] = [
  {
    id: 'rq-001',
    client: 'Mara Solís',
    title: 'Cotización novela juvenil',
    requestedAt: '2026-07-21',
    status: 'pendiente',
    chapters: 8,
    amount: 2400,
  },
  {
    id: 'rq-002',
    client: 'Andrés Vega',
    title: 'Audiolibro de historia',
    requestedAt: '2026-07-24',
    status: 'en_revision',
    chapters: 5,
    amount: 1800,
  },
  {
    id: 'rq-003',
    client: 'Elena Ruiz',
    title: 'Proyecto documental',
    requestedAt: '2026-07-26',
    status: 'aprobada',
    chapters: 3,
    amount: 1280,
  },
];

const initialProjects: AdminProject[] = [
  {
    id: 'pr-001',
    title: 'El jardín de las sombras',
    client: 'Mara Solís',
    status: 'produccion',
    progress: 74,
    revisionsUsed: 1,
    maxRevisions: 2,
    chapters: 8,
    deliverables: [
      { id: 'dl-001', title: 'Versión de prueba', completed: true, updatedAt: '2026-07-22' },
      { id: 'dl-002', title: 'Muestra de audio 01', completed: false, updatedAt: '2026-07-27' },
      { id: 'dl-003', title: 'Entrega final', completed: false, updatedAt: '2026-07-29' },
    ],
    lastUpdate: '2026-07-29',
  },
  {
    id: 'pr-002',
    title: 'Suenos de medianoche',
    client: 'Andrés Vega',
    status: 'revisiones',
    progress: 58,
    revisionsUsed: 2,
    maxRevisions: 2,
    chapters: 5,
    deliverables: [
      { id: 'dl-004', title: 'Retoque de mezcla', completed: true, updatedAt: '2026-07-25' },
      { id: 'dl-005', title: 'Versión final', completed: false, updatedAt: '2026-07-28' },
    ],
    lastUpdate: '2026-07-28',
  },
];

let quotationRequestsState = initialQuotationRequests.map((request) => ({ ...request }));
let projectsState = initialProjects.map((project) => ({
  ...project,
  deliverables: project.deliverables.map((deliverable) => ({ ...deliverable })),
}));

const getProgressByStatus = (status: AdminProjectStatus): number => {
  switch (status) {
    case 'analisis':
      return 25;
    case 'produccion':
      return 74;
    case 'revisiones':
      return 82;
    default:
      return 100;
  }
};

const cloneQuotationRequests = (): QuotationRequest[] =>
  quotationRequestsState.map((request) => ({ ...request }));

const cloneProjects = (): AdminProject[] =>
  projectsState.map((project) => ({
    ...project,
    deliverables: project.deliverables.map((deliverable) => ({ ...deliverable })),
  }));

export function listQuotationRequests(): QuotationRequest[] {
  return cloneQuotationRequests();
}

export function updateQuotationRequestStatus(id: string, status: QuotationRequestStatus): QuotationRequest | undefined {
  const request = quotationRequestsState.find((item) => item.id === id);

  if (!request) {
    return undefined;
  }

  request.status = status;
  return { ...request };
}

export function listAdminProjects(): AdminProject[] {
  return cloneProjects();
}

export function updateProjectStatus(id: string, status: AdminProjectStatus): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.status = status;
  project.progress = getProgressByStatus(status);
  project.lastUpdate = new Date().toISOString().slice(0, 10);
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function addProjectRevision(id: string): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project || project.revisionsUsed >= project.maxRevisions) {
    return undefined;
  }

  project.revisionsUsed += 1;
  project.status = 'revisiones';
  project.progress = getProgressByStatus('revisiones');
  project.lastUpdate = new Date().toISOString().slice(0, 10);
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function addAudioDeliverable(id: string, title: string): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.deliverables.push({
    id: `dl-${Date.now()}`,
    title,
    completed: false,
    updatedAt: new Date().toISOString().slice(0, 10),
  });

  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function toggleAudioDeliverable(id: string, deliverableId: string): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.deliverables = project.deliverables.map((deliverable) => {
    if (deliverable.id === deliverableId) {
      return { ...deliverable, completed: !deliverable.completed, updatedAt: new Date().toISOString().slice(0, 10) };
    }

    return { ...deliverable };
  });

  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export const adminService = {
  listQuotationRequests,
  updateQuotationRequestStatus,
  listAdminProjects,
  updateProjectStatus,
  addProjectRevision,
  addAudioDeliverable,
  toggleAudioDeliverable,
};
