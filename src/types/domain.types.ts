/**
 * Tipos de Dominio Compartidos — Studio Flamkit & Art
 *
 * Este archivo define los tipos de dominio centralizados compartidos entre
 * el Dashboard (Autor) y la consola de Administración (Admin).
 *
 * Fuente de especificación:
 * - docs/Fase 1B2/Fase 1B2.7/architecture/1B2.7.5 — Especificación de implementación.md
 * - docs/Fase 1B2/Fase 1B2.8/architecture/1B2.8 — Revisión global del modelo.md
 */

/**
 * Estados reales de un proyecto en la tabla `projects.status`.
 */
export type ProjectStatus =
  | 'planning'
  | 'production'
  | 'review'
  | 'completed'
  | 'archived';

/**
 * Estados reales de una solicitud de proyecto en `project_requests.status`.
 */
export type RequestStatus =
  | 'pending'
  | 'evaluating'
  | 'accepted'
  | 'rejected'
  | 'cancelled';

/**
 * Estados reales de una propuesta comercial/técnica en `proposals.status`.
 */
export type ProposalStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired';

/**
 * Estados reales de las revisiones de entregables en `reviews.status`.
 */
export type ReviewStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'changes_requested';

/**
 * Las seis fases de producto del itinerario editorial (Editorial Journey).
 */
export type EditorialPhase =
  | 'received'
  | 'analysis'
  | 'proposal'
  | 'production'
  | 'review'
  | 'completed';

/**
 * Estado individual de un paso en el itinerario editorial.
 */
export type EditorialStepStatus = 'completed' | 'active' | 'pending' | 'blocked';

/**
 * Paso individual del timeline del itinerario editorial.
 */
export interface EditorialTimelineStep {
  id: EditorialPhase;
  title: string;
  description: string;
  status: EditorialStepStatus;
}

/**
 * Modelo de dominio del itinerario editorial (Editorial Journey).
 * Representa el avance del autor a lo largo de las 6 fases de producto.
 */
export interface EditorialJourney {
  currentPhase: EditorialPhase;
  label: string;
  progress: number;
  nextActionTitle: string;
  nextActionDescription: string;
  buttonLabel?: string;
  steps: EditorialTimelineStep[];
}

/**
 * Modelo de dominio de Proyecto.
 * Representa el concepto de negocio (no la fila de Supabase ni un ViewModel de UI).
 */
export interface Project {
  id: string;
  authorId: string;
  manuscriptId: string;
  proposalId: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}
