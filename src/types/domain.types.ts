/**
 * Tipos de Dominio Compartidos — Studio Flamkit & Art
 *
 * Este archivo define los tipos de dominio centralizados compartidos entre
 * el Dashboard (Autor) y la consola de Administración (Admin).
 *
 * Contrato de Dominio Mínimo Ajustado (1B3.1.A):
 * - Refleja los valores reales almacenados en la base de datos Supabase.
 * - Separa los conceptos puros de dominio de los ViewModels / Presentación.
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
  | 'canceled';

/**
 * Estados reales de una propuesta comercial/técnica en `proposals.status`.
 */
export type ProposalStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired';

/**
 * Estados reales de las revisiones de entregables en `reviews.status`.
 */
export type ReviewStatus =
  | 'open'
  | 'resolved'
  | 'discarded';

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
export type EditorialStepStatus =
  | 'completed'
  | 'active'
  | 'pending'
  | 'blocked';

/**
 * Paso individual del itinerario editorial de dominio.
 */
export interface EditorialTimelineStep {
  id: EditorialPhase;
  status: EditorialStepStatus;
}

/**
 * Modelo de dominio del itinerario editorial (Editorial Journey).
 * Modela la fase actual y los pasos sin acoplarse a etiquetas o controles de UI.
 */
export interface EditorialJourney {
  currentPhase: EditorialPhase;
  steps: EditorialTimelineStep[];
}

/**
 * Modelo de dominio de Proyecto.
 * Representa el concepto de negocio sin campos de presentación.
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
