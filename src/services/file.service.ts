import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export interface ProductionStageRelation {
  id: string;
  name: string;
  status: string | null;
  order_index: number;
}

export interface ProjectRelation {
  id: string;
  status: string | null;
  production_stages?: ProductionStageRelation[] | null;
}

export interface ProjectRequestRelation {
  id: string;
  status: string | null;
}

export interface ManuscriptWithDetails {
  id: string;
  title: string;
  created_at: string | null;
  status: string | null;
  word_count: number | null;
  original_file_path: string | null;
  project_requests?: ProjectRequestRelation[] | null;
  projects?: ProjectRelation[] | null;
}

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];
export type FileRow = Database['public']['Tables']['files']['Row'];
export type DeliverableRow = Database['public']['Tables']['deliverables']['Row'];
export type PaymentPlanRow = Database['public']['Tables']['payment_plans']['Row'];
export type PaymentRow = Database['public']['Tables']['payments']['Row'];
export type ProductionStageRow = Database['public']['Tables']['production_stages']['Row'];

export type FileTone = 'bloqueado' | 'disponible' | 'en_revision' | 'aprobado';
export type FileKind = 'manuscript' | 'project_file' | 'deliverable';

export interface DashboardFileItem {
  id: string;
  kind: FileKind;
  name: string;
  sourceLabel: string;
  createdAt: string | null;
  sizeLabel: string | null;
  statusLabel: string;
  statusTone: FileTone;
  amountLabel: string | null;
  stageLabel: string | null;
  details: string[];
  downloadUrl: string | null;
  rawPath: string | null;
}

export interface DashboardFileLibraryData {
  projectId: string | null;
  projectTitle: string | null;
  projectStatus: string | null;
  currentStage: string | null;
  acceptedAmount: number;
  paidAmount: number;
  manuscriptCount: number;
  projectFilesCount: number;
  deliverablesCount: number;
  allItems: DashboardFileItem[];
  manuscripts: DashboardFileItem[];
  projectFiles: DashboardFileItem[];
  deliverables: DashboardFileItem[];
}

function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null || Number.isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatMoney(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function buildPublicUrl(bucket: string | null | undefined, path: string | null | undefined): string | null {
  if (!bucket || !path) return null;
  try {
    return supabaseClient.storage.from(bucket).getPublicUrl(path).data.publicUrl || null;
  } catch {
    return null;
  }
}

function getStageLabel(stages: ProductionStageRow[]): string | null {
  if (!stages.length) return null;
  const activeStage =
    stages.find((stage) => /active|activo|en_curso|en curso|production|produccion|grabaci/i.test(stage.status ?? '')) ||
    stages.find((stage) => (stage.progress_percentage ?? 0) > 0 && (stage.progress_percentage ?? 0) < 100) ||
    stages[stages.length - 1] ||
    null;

  return activeStage ? activeStage.name : null;
}

function createManuscriptTone(status: string | null | undefined): FileTone {
  if (!status) return 'en_revision';
  if (/approved|aprob/i.test(status)) return 'aprobado';
  if (/rejected|rechaz|pending|submitted|evaluat|revision|rev/i.test(status)) return 'en_revision';
  return 'disponible';
}

function createProjectFileTone(projectId: string | null): FileTone {
  return projectId ? 'disponible' : 'bloqueado';
}

export async function getDashboardFileLibraryData(
  authorId: string,
  projectId: string | null,
  selectedManuscriptId?: string | null
): Promise<DashboardFileLibraryData> {
  const { data: manuscriptRows, error: manuscriptError } = await supabaseClient
    .from('manuscripts')
    .select(`
      id, 
      title, 
      created_at, 
      status, 
      word_count, 
      original_file_path,
      project_requests (
        id,
        status
      ),
      projects (
        id,
        status,
        production_stages (
          id,
          name,
          status,
          order_index
        )
      )
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (manuscriptError) throw manuscriptError;

  const typedManuscriptRows = (manuscriptRows as unknown as ManuscriptWithDetails[]) || [];

  let resolvedProjectId = projectId;
  let projectTitle: string | null = null;
  let projectStatus: string | null = null;

  if (!resolvedProjectId && selectedManuscriptId) {
    const { data: matchedProject } = await supabaseClient
      .from('projects')
      .select('id, status, manuscripts(title)')
      .eq('manuscript_id', selectedManuscriptId)
      .maybeSingle();

    if (matchedProject) {
      resolvedProjectId = matchedProject.id;
      projectTitle = (matchedProject as { manuscripts?: { title?: string | null } | null } | null)?.manuscripts?.title || null;
      projectStatus = matchedProject.status || null;
    }
  } else if (!resolvedProjectId) {
    const { data: latestProject } = await supabaseClient
      .from('projects')
      .select('id, status, manuscripts(title)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    resolvedProjectId = latestProject?.id || null;
    projectTitle = (latestProject as { manuscripts?: { title?: string | null } | null } | null)?.manuscripts?.title || null;
    projectStatus = latestProject?.status || null;
  } else {
    const { data: projectRow } = await supabaseClient
      .from('projects')
      .select('id, status, manuscripts(title)')
      .eq('id', resolvedProjectId)
      .maybeSingle();

    projectTitle = (projectRow as { manuscripts?: { title?: string | null } | null } | null)?.manuscripts?.title || null;
    projectStatus = projectRow?.status || null;
  }

  const { data: fileRows } = resolvedProjectId
    ? await supabaseClient
        .from('files')
        .select('id, bucket, created_at, mime_type, owner_id, path, project_id, size_bytes')
        .eq('project_id', resolvedProjectId)
        .order('created_at', { ascending: false })
    : { data: [] };

  const { data: deliverableRows } = resolvedProjectId
    ? await supabaseClient
        .from('deliverables')
        .select('id, project_id, title, created_at, status, storage_path, version')
        .eq('project_id', resolvedProjectId)
        .order('created_at', { ascending: false })
    : { data: [] };

  const { data: paymentPlanRows } = resolvedProjectId
    ? await supabaseClient
        .from('payment_plans')
        .select('id, amount, percentage, installment_number, due_date, status, project_id, created_at')
        .eq('project_id', resolvedProjectId)
        .order('installment_number', { ascending: true })
    : { data: [] };

  const planIds = (paymentPlanRows ?? []).map((plan) => plan.id);

  const { data: paymentRows } = planIds.length
    ? await supabaseClient
        .from('payments')
        .select('id, amount, chapter_id, created_at, method, paid_at, payment_plan_id, receipt_url, reference')
        .in('payment_plan_id', planIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const { data: stageRows } = resolvedProjectId
    ? await supabaseClient
        .from('production_stages')
        .select('id, name, notes, order_index, progress_percentage, status, start_date, end_date, created_at, project_id')
        .eq('project_id', resolvedProjectId)
        .order('order_index', { ascending: true })
    : { data: [] };

  const acceptedAmount = (paymentPlanRows ?? []).reduce((sum, plan) => sum + (plan.amount ?? 0), 0);
  const paidAmount = (paymentRows ?? []).reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  const acceptedAmountLabel = formatMoney(acceptedAmount);
  const paidAmountLabel = formatMoney(paidAmount);
  const currentStage = getStageLabel((stageRows ?? []) as ProductionStageRow[]);

  const manuscriptItems: DashboardFileItem[] = typedManuscriptRows.map((manuscript: ManuscriptWithDetails) => {
    const downloadUrl = buildPublicUrl('manuscripts', manuscript.original_file_path);
    const wordCountLabel = manuscript.word_count ? `${manuscript.word_count.toLocaleString()} palabras` : 'Sin conteo';

    const projects = Array.isArray(manuscript.projects)
      ? manuscript.projects
      : manuscript.projects
      ? [manuscript.projects]
      : [];

    const requests = Array.isArray(manuscript.project_requests)
      ? manuscript.project_requests
      : manuscript.project_requests
      ? [manuscript.project_requests]
      : [];

    let statusLabel = 'Registrado';
    let statusTone: FileTone = 'en_revision';

    if (projects.length > 0) {
      const proj = projects[0];
      if (proj.status === 'completed') {
        statusLabel = 'Completado';
        statusTone = 'aprobado';
      } else {
        const stages = Array.isArray(proj.production_stages) ? proj.production_stages : [];
        const activeStage = stages.find((s: ProductionStageRelation) => /active|activo|en_curso|en curso/i.test(s.status || ''));
        if (activeStage) {
          statusLabel = activeStage.name;
        } else {
          statusLabel = 'En revisión';
        }
        statusTone = 'en_revision';
      }
    } else if (requests.length > 0) {
      const req = requests[0];
      if (req.status === 'evaluating') {
        statusLabel = 'En análisis';
        statusTone = 'en_revision';
      } else if (req.status === 'pending') {
        statusLabel = 'Pendiente de aceptación';
        statusTone = 'bloqueado';
      } else if (req.status === 'rejected') {
        statusLabel = 'Rechazado';
        statusTone = 'bloqueado';
      } else if (req.status === 'approved') {
        statusLabel = 'Aprobado';
        statusTone = 'aprobado';
      } else {
        statusLabel = req.status || 'En evaluación';
        statusTone = 'en_revision';
      }
    } else if (manuscript.status) {
      statusLabel = manuscript.status;
      statusTone = createManuscriptTone(manuscript.status);
    }

    return {
      id: `manuscript-${manuscript.id}`,
      kind: 'manuscript',
      name: manuscript.title,
      sourceLabel: 'Manuscrito original del autor',
      createdAt: manuscript.created_at || null,
      sizeLabel: wordCountLabel,
      statusLabel,
      statusTone,
      amountLabel: acceptedAmount > 0 ? acceptedAmountLabel : null,
      stageLabel: currentStage,
      details: [
        `Título: ${manuscript.title}`,
        `Subido el ${formatDate(manuscript.created_at)}`,
        `Estado: ${statusLabel}`,
        `Palabras: ${wordCountLabel}`,
        resolvedProjectId ? `Monto aprobado por admin: ${acceptedAmountLabel}` : 'Monto aprobado por admin: pendiente',
      ],
      downloadUrl,
      rawPath: manuscript.original_file_path || null,
    };
  });

  const projectFileItems: DashboardFileItem[] = (fileRows ?? []).map((fileRow) => ({
    id: `file-${fileRow.id}`,
    kind: 'project_file',
    name: fileRow.path.split('/').pop() || fileRow.path,
    sourceLabel: fileRow.bucket ? `Archivo en bucket ${fileRow.bucket}` : 'Archivo de proyecto',
    createdAt: fileRow.created_at || null,
    sizeLabel: formatBytes(fileRow.size_bytes),
    statusLabel: resolvedProjectId ? 'Disponible' : 'Bloqueado',
    statusTone: createProjectFileTone(resolvedProjectId),
    amountLabel: acceptedAmount > 0 ? acceptedAmountLabel : null,
    stageLabel: currentStage,
    details: [
      `Ruta: ${fileRow.path}`,
      `Bucket: ${fileRow.bucket}`,
      `MIME: ${fileRow.mime_type || 'no informado'}`,
      `Subido el ${formatDate(fileRow.created_at)}`,
      acceptedAmount > 0 ? `Monto aprobado por admin: ${acceptedAmountLabel}` : 'Monto aprobado por admin: pendiente',
      paidAmount > 0 ? `Pagado hasta ahora: ${paidAmountLabel}` : 'Pagos registrados: 0',
    ],
    downloadUrl: buildPublicUrl(fileRow.bucket, fileRow.path),
    rawPath: fileRow.path,
  }));

  const deliverableItems: DashboardFileItem[] = (deliverableRows ?? []).map((deliverable) => ({
    id: `deliverable-${deliverable.id}`,
    kind: 'deliverable',
    name: deliverable.title,
    sourceLabel: 'Entregable del proyecto',
    createdAt: deliverable.created_at || null,
    sizeLabel: deliverable.version ? `Versión ${deliverable.version}` : 'Sin versión',
    statusLabel: deliverable.status ?? 'Pendiente',
    statusTone: /approved|aprob/i.test(deliverable.status ?? '') ? 'aprobado' : 'disponible',
    amountLabel: acceptedAmount > 0 ? acceptedAmountLabel : null,
    stageLabel: currentStage,
    details: [
      `Título: ${deliverable.title}`,
      `Subido el ${formatDate(deliverable.created_at)}`,
      `Estado: ${deliverable.status ?? 'pendiente'}`,
      deliverable.version ? `Versión: ${deliverable.version}` : 'Versión: no definida',
      acceptedAmount > 0 ? `Monto aprobado por admin: ${acceptedAmountLabel}` : 'Monto aprobado por admin: pendiente',
    ],
    downloadUrl: buildPublicUrl('deliverables', deliverable.storage_path),
    rawPath: deliverable.storage_path,
  }));

  const allItems = [...manuscriptItems, ...projectFileItems, ...deliverableItems].sort((a, b) => {
    const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bt - at;
  });

  return {
    projectId: resolvedProjectId,
    projectTitle,
    projectStatus,
    currentStage,
    acceptedAmount,
    paidAmount,
    manuscriptCount: manuscriptItems.length,
    projectFilesCount: projectFileItems.length,
    deliverablesCount: deliverableItems.length,
    allItems,
    manuscripts: manuscriptItems,
    projectFiles: projectFileItems,
    deliverables: deliverableItems,
  };
}
