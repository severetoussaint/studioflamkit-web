/**
 * Tipos de Dominio Compartidos — Studio Flamkit & Art
 *
 * Contratos de negocio compartidos entre Dashboard (Autor) y Admin.
 * Los tipos de Supabase permanecen en database.types.ts.
 */

export type ProjectStatus =
  | 'planning'
  | 'production'
  | 'review'
  | 'completed'
  | 'archived';

export type RequestStatus =
  | 'pending'
  | 'evaluating'
  | 'accepted'
  | 'rejected'
  | 'canceled';

export type ProposalStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired';

export type ReviewStatus =
  | 'open'
  | 'resolved'
  | 'discarded';

export type EvaluationResult =
  | 'approved'
  | 'approved_with_notes'
  | 'rejected';

export type ProductionStageStatus =
  | 'pending'
  | 'in_progress'
  | 'completed';

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'read';

export type ConversationType =
  | 'general'
  | 'project'
  | 'editorial'
  | 'proposal'
  | 'support';

export type ConversationStatus =
  | 'open'
  | 'closed';

export type MessageSenderType =
  | 'author'
  | 'admin';

export type EditorialPhase =
  | 'received'
  | 'analysis'
  | 'proposal'
  | 'production'
  | 'review'
  | 'completed';

export type EditorialStepStatus =
  | 'completed'
  | 'active'
  | 'pending'
  | 'blocked';

export type TimelineEvent =
  | 'project_created'
  | 'project_stage_changed'
  | 'project_completed'
  | 'chapter_created'
  | 'chapter_delivered'
  | 'deliverable_created'
  | 'deliverable_approved'
  | 'review_created'
  | 'review_resolved'
  | 'review_discarded';

export interface EditorialTimelineStep {
  id: EditorialPhase;
  status: EditorialStepStatus;
}

export interface EditorialJourney {
  currentPhase: EditorialPhase;
  steps: EditorialTimelineStep[];
}

export interface Project {
  id: string;
  authorId: string;
  manuscriptId: string;
  proposalId: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  percentage: number;
  completedStages: number;
  totalStages: number;
  currentStageId: string | null;
}

export interface ProductionStage {
  id: string;
  projectId: string;
  name: string;
  orderIndex: number;
  progressPercentage: number;
  status: ProductionStageStatus;
  startDate: string | null;
  endDate: string | null;
  assignedTo: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TimelineEntry {
  id: string;
  projectId: string;
  event: TimelineEvent;
  details: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  authorId: string;
  title: string;
  message: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface ProjectRequest {
  id: string;
  manuscriptId: string;
  channel: string | null;
  status: RequestStatus;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  requestId: string;
  feasibility: string | null;
  narrativeQuality: string | null;
  technicalDifficulty: string | null;
  estimatedTime: string | null;
  observations: string | null;
  result: EvaluationResult;
  createdAt: string;
}

export interface Proposal {
  id: string;
  requestId: string;
  amount: number;
  currency: string | null;
  services: unknown | null;
  revisionsIncluded: number | null;
  deadline: string | null;
  status: ProposalStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  deliverableId: string;
  chapterTitle: string | null;
  comment: string;
  filePath: string | null;
  status: ReviewStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface Conversation {
  id: string;
  authorId: string;
  projectId: string | null;
  type: ConversationType;
  subject: string;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message | null;
  authorName?: string;
  authorEmail?: string;
  projectTitle?: string;
  unreadCount?: number;
}

