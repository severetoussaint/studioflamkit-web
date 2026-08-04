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

export interface AudioDeliverableComment {
  id: string;
  sender: 'admin' | 'client';
  text: string;
  timestamp: string;
}

export interface AudioDeliverable {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: string;
  audioUrl?: string;
  comments?: AudioDeliverableComment[];
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
  amount?: number;
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
    amount: 2400,
    deliverables: [
      { 
        id: 'dl-001', 
        title: 'Capítulo 1 - Mezcla inicial', 
        completed: true, 
        updatedAt: '2026-07-22',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        comments: [
          { id: 'c-1', sender: 'client', text: 'Me encanta la música de fondo al inicio.', timestamp: '14:23' },
          { id: 'c-2', sender: 'admin', text: '¡Excelente! Mantendremos ese tono en toda la obra.', timestamp: '15:10' }
        ]
      },
      { 
        id: 'dl-002', 
        title: 'Muestra de efectos sonoros 01', 
        completed: false, 
        updatedAt: '2026-07-27',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        comments: [
          { id: 'c-3', sender: 'client', text: '¿Podríamos atenuar un poco el sonido del viento?', timestamp: '10:05' }
        ]
      },
      { 
        id: 'dl-003', 
        title: 'Capítulo 2 - Audio procesado', 
        completed: false, 
        updatedAt: '2026-07-29',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        comments: []
      },
    ],
    lastUpdate: '2026-07-29',
  },
  {
    id: 'pr-002',
    title: 'Sueños de medianoche',
    client: 'Andrés Vega',
    status: 'revisiones',
    progress: 58,
    revisionsUsed: 2,
    maxRevisions: 3,
    chapters: 5,
    amount: 1800,
    deliverables: [
      { 
        id: 'dl-004', 
        title: 'Retoque de mezcla - Prólogo', 
        completed: true, 
        updatedAt: '2026-07-25',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        comments: [
          { id: 'c-4', sender: 'client', text: 'La voz suena muy limpia ahora.', timestamp: '18:12' }
        ]
      },
      { 
        id: 'dl-005', 
        title: 'Versión final - Compilado Completo', 
        completed: false, 
        updatedAt: '2026-07-28',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        comments: []
      },
    ],
    lastUpdate: '2026-07-28',
  },
];

const isBrowser = typeof window !== 'undefined';

function loadState<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading state from localStorage', error);
    return defaultValue;
  }
}

function saveState<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving state to localStorage', error);
  }
}

let quotationRequestsState: QuotationRequest[] = [];
let projectsState: AdminProject[] = [];

if (isBrowser) {
  quotationRequestsState = loadState('admin_quotation_requests', initialQuotationRequests);
  projectsState = loadState('admin_projects', initialProjects);
} else {
  quotationRequestsState = initialQuotationRequests.map((request) => ({ ...request }));
  projectsState = initialProjects.map((project) => ({
    ...project,
    deliverables: project.deliverables.map((deliverable) => ({ ...deliverable })),
  }));
}

const syncStorage = () => {
  saveState('admin_quotation_requests', quotationRequestsState);
  saveState('admin_projects', projectsState);
};

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
    deliverables: project.deliverables.map((deliverable) => ({
      ...deliverable,
      comments: deliverable.comments ? deliverable.comments.map(c => ({ ...c })) : []
    })),
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
  syncStorage();
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
  syncStorage();
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function addProjectRevision(id: string): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.revisionsUsed = Math.min(project.maxRevisions, project.revisionsUsed + 1);
  project.status = 'revisiones';
  project.progress = getProgressByStatus('revisiones');
  project.lastUpdate = new Date().toISOString().slice(0, 10);
  syncStorage();
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function updateProjectMaxRevisions(id: string, maxRevisions: number): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.maxRevisions = Math.max(0, maxRevisions);
  syncStorage();
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function updateProjectBudget(id: string, amount: number): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.amount = Math.max(0, amount);
  syncStorage();
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function createAdminProject(newProj: Omit<AdminProject, 'id' | 'deliverables' | 'progress' | 'lastUpdate'>): AdminProject {
  const project: AdminProject = {
    ...newProj,
    id: `pr-${Date.now()}`,
    progress: getProgressByStatus(newProj.status),
    deliverables: [],
    lastUpdate: new Date().toISOString().slice(0, 10),
  };
  
  projectsState.push(project);
  syncStorage();
  return { ...project };
}

export function addAudioDeliverable(id: string, title: string, audioUrl?: string): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === id);

  if (!project) {
    return undefined;
  }

  project.deliverables.push({
    id: `dl-${Date.now()}`,
    title,
    completed: false,
    updatedAt: new Date().toISOString().slice(0, 10),
    audioUrl: audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    comments: [],
  });

  syncStorage();
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

  syncStorage();
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function addDeliverableComment(projectId: string, deliverableId: string, sender: 'admin' | 'client', text: string): AdminProject | undefined {
  const project = projectsState.find((item) => item.id === projectId);
  if (!project) return undefined;

  project.deliverables = project.deliverables.map((deliverable) => {
    if (deliverable.id === deliverableId) {
      const comments = deliverable.comments ? [...deliverable.comments] : [];
      comments.push({
        id: `c-${Date.now()}`,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      return { ...deliverable, comments };
    }
    return deliverable;
  });

  syncStorage();
  return { ...project, deliverables: project.deliverables.map((delivery) => ({ ...delivery })) };
}

export function deleteAdminProject(id: string): boolean {
  const index = projectsState.findIndex(p => p.id === id);
  if (index === -1) return false;
  projectsState.splice(index, 1);
  syncStorage();
  return true;
}

export function addQuotationRequest(req: Omit<QuotationRequest, 'id' | 'requestedAt'>): QuotationRequest {
  const request: QuotationRequest = {
    ...req,
    id: `rq-${Date.now()}`,
    requestedAt: new Date().toISOString().slice(0, 10),
  };
  quotationRequestsState.push(request);
  syncStorage();
  return { ...request };
}

export function deleteQuotationRequest(id: string): boolean {
  const index = quotationRequestsState.findIndex(r => r.id === id);
  if (index === -1) return false;
  quotationRequestsState.splice(index, 1);
  syncStorage();
  return true;
}

export const adminService = {
  listQuotationRequests,
  updateQuotationRequestStatus,
  addQuotationRequest,
  deleteQuotationRequest,
  listAdminProjects,
  updateProjectStatus,
  updateProjectMaxRevisions,
  updateProjectBudget,
  createAdminProject,
  deleteAdminProject,
  addAudioDeliverable,
  toggleAudioDeliverable,
  addDeliverableComment,
  addProjectRevision,
};
