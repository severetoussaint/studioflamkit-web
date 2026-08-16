import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type {
  Conversation,
  ConversationStatus,
  ConversationType,
  Message,
  MessageSenderType,
} from '@/types/domain.types';
import { createNotification } from '@/services/notification.service';

export type ConversationRow = Database['public']['Tables']['conversations']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];

interface ConversationJoinedRow extends ConversationRow {
  authors?: { full_name?: string; email?: string } | null;
  projects?: { manuscripts?: { title?: string } | null } | null;
}

export interface CreateConversationInput {
  authorId: string;
  projectId?: string | null;
  type?: ConversationType;
  subject: string;
  initialMessage?: string;
  senderType?: MessageSenderType;
  senderId?: string;
}

export interface SendMessageInput {
  conversationId: string;
  senderType: MessageSenderType;
  senderId: string;
  body: string;
}

export interface ListConversationsParams {
  authorId?: string;
  projectId?: string;
  status?: ConversationStatus;
  type?: ConversationType;
}

function mapMessageRowToDomain(row: MessageRow): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderType: (row.sender_type as MessageSenderType) || 'author',
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at ?? new Date().toISOString(),
    readAt: row.read_at,
  };
}

function mapConversationRowToDomain(
  row: ConversationRow,
  extra?: {
    lastMessage?: Message | null;
    authorName?: string;
    authorEmail?: string;
    projectTitle?: string;
    unreadCount?: number;
  }
): Conversation {
  return {
    id: row.id,
    authorId: row.author_id,
    projectId: row.project_id,
    type: (row.type as ConversationType) || 'support',
    subject: row.subject,
    status: (row.status as ConversationStatus) || 'open',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? new Date().toISOString(),
    lastMessage: extra?.lastMessage ?? null,
    authorName: extra?.authorName,
    authorEmail: extra?.authorEmail,
    projectTitle: extra?.projectTitle,
    unreadCount: extra?.unreadCount ?? 0,
  };
}

export async function listConversations(params?: ListConversationsParams): Promise<Conversation[]> {
  try {
    let query = supabaseClient
      .from('conversations')
      .select(`
        id,
        author_id,
        project_id,
        type,
        subject,
        status,
        created_at,
        updated_at,
        authors ( id, full_name, email ),
        projects ( id, manuscripts ( title ) )
      `)
      .order('updated_at', { ascending: false });

    if (params?.authorId) {
      query = query.eq('author_id', params.authorId);
    }
    if (params?.projectId) {
      query = query.eq('project_id', params.projectId);
    }
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    if (params?.type) {
      query = query.eq('type', params.type);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching conversations from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const conversationIds = data.map((c) => c.id);

    // Fetch latest message and unread count for each conversation
    const { data: messagesData } = await supabaseClient
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: true });

    const messagesByConv: Record<string, Message[]> = {};
    (messagesData ?? []).forEach((m) => {
      const msg = mapMessageRowToDomain(m as MessageRow);
      if (!messagesByConv[msg.conversationId]) {
        messagesByConv[msg.conversationId] = [];
      }
      messagesByConv[msg.conversationId].push(msg);
    });

    return data.map((item) => {
      const row = item as unknown as ConversationJoinedRow;
      const convMessages = messagesByConv[row.id] ?? [];
      const lastMsg = convMessages.length > 0 ? convMessages[convMessages.length - 1] : null;
      const unreadCount = convMessages.filter((m) => !m.readAt).length;

      const authorName = row.authors?.full_name ?? undefined;
      const authorEmail = row.authors?.email ?? undefined;
      const projectTitle = row.projects?.manuscripts?.title ?? undefined;

      return mapConversationRowToDomain(row, {
        lastMessage: lastMsg,
        authorName,
        authorEmail,
        projectTitle,
        unreadCount,
      });
    });
  } catch (err) {
    console.error('Unexpected error in listConversations:', err);
    return [];
  }
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  if (!conversationId) return null;
  try {
    const { data, error } = await supabaseClient
      .from('conversations')
      .select(`
        id,
        author_id,
        project_id,
        type,
        subject,
        status,
        created_at,
        updated_at,
        authors ( id, full_name, email ),
        projects ( id, manuscripts ( title ) )
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('Error fetching conversation:', error);
      return null;
    }

    const row = data as unknown as ConversationJoinedRow;
    const authorName = row.authors?.full_name ?? undefined;
    const authorEmail = row.authors?.email ?? undefined;
    const projectTitle = row.projects?.manuscripts?.title ?? undefined;

    return mapConversationRowToDomain(row, {
      authorName,
      authorEmail,
      projectTitle,
    });
  } catch (err) {
    console.error('Unexpected error in getConversation:', err);
    return null;
  }
}

export async function createConversation(input: CreateConversationInput): Promise<{
  conversation: Conversation;
  initialMessage?: Message;
}> {
  if (!input.authorId) throw new Error('authorId is required to create a conversation.');
  if (!input.subject.trim()) throw new Error('Subject is required.');

  const { data: convRow, error: convError } = await supabaseClient
    .from('conversations')
    .insert({
      author_id: input.authorId,
      project_id: input.projectId ?? null,
      type: input.type ?? 'support',
      subject: input.subject.trim(),
      status: 'open',
    })
    .select('*')
    .single();

  if (convError || !convRow) {
    console.error('Error inserting conversation:', convError);
    throw convError || new Error('Failed to create conversation');
  }

  let createdInitialMessage: Message | undefined;

  if (input.initialMessage && input.initialMessage.trim()) {
    const senderType = input.senderType ?? 'author';
    const senderId = input.senderId ?? input.authorId;

    const { data: msgRow, error: msgError } = await supabaseClient
      .from('messages')
      .insert({
        conversation_id: convRow.id,
        sender_type: senderType,
        sender_id: senderId,
        body: input.initialMessage.trim(),
      })
      .select('*')
      .single();

    if (msgError) {
      console.warn('Error creating initial message for conversation:', msgError);
    } else if (msgRow) {
      createdInitialMessage = mapMessageRowToDomain(msgRow as MessageRow);

      // If admin initiated the conversation with an initial message, notify author
      if (senderType === 'admin') {
        try {
          await createNotification({
            authorId: input.authorId,
            title: `Nuevo mensaje editorial: ${input.subject}`,
            message: input.initialMessage.trim(),
            status: 'pending',
          });
        } catch (notifErr) {
          console.warn('Failed to send notification for initial message:', notifErr);
        }
      }
    }
  }

  const domainConv = mapConversationRowToDomain(convRow as ConversationRow, {
    lastMessage: createdInitialMessage,
  });

  return {
    conversation: domainConv,
    initialMessage: createdInitialMessage,
  };
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  if (!conversationId) return [];
  try {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error getting conversation messages:', error);
      return [];
    }

    return ((data ?? []) as MessageRow[]).map(mapMessageRowToDomain);
  } catch (err) {
    console.error('Unexpected error in getConversationMessages:', err);
    return [];
  }
}

export async function sendMessage(input: SendMessageInput): Promise<Message> {
  if (!input.conversationId) throw new Error('conversationId is required to send a message.');
  if (!input.body.trim()) throw new Error('Message body cannot be empty.');
  if (!input.senderId) throw new Error('senderId is required.');

  // 1. Insert message
  const { data: msgRow, error: msgError } = await supabaseClient
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_type: input.senderType,
      sender_id: input.senderId,
      body: input.body.trim(),
    })
    .select('*')
    .single();

  if (msgError || !msgRow) {
    console.error('Error inserting message:', msgError);
    throw msgError || new Error('Failed to send message');
  }

  // 2. Touch conversation updated_at
  await supabaseClient
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', input.conversationId);

  const domainMessage = mapMessageRowToDomain(msgRow as MessageRow);

  // 3. Notification generation:
  // If admin sent the message -> notify the author
  if (input.senderType === 'admin') {
    try {
      const { data: conv } = await supabaseClient
        .from('conversations')
        .select('author_id, subject')
        .eq('id', input.conversationId)
        .maybeSingle();

      if (conv?.author_id) {
        const preview = input.body.length > 120 ? `${input.body.slice(0, 117)}...` : input.body;
        await createNotification({
          authorId: conv.author_id,
          title: `Respuesta del equipo editorial: ${conv.subject || 'Consulta'}`,
          message: preview,
          status: 'pending',
        });
      }
    } catch (notifErr) {
      console.warn('Failed to send notification for admin message:', notifErr);
    }
  }

  return domainMessage;
}

export async function markMessagesRead(
  conversationId: string,
  readerType: MessageSenderType
): Promise<boolean> {
  if (!conversationId) return false;
  try {
    // If reader is 'author', mark all messages from 'admin' as read
    // If reader is 'admin', mark all messages from 'author' as read
    const senderTypeToMark = readerType === 'author' ? 'admin' : 'author';

    const { error } = await supabaseClient
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('sender_type', senderTypeToMark)
      .is('read_at', null);

    if (error) {
      console.warn('Error marking messages as read:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in markMessagesRead:', err);
    return false;
  }
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus
): Promise<boolean> {
  if (!conversationId) return false;
  try {
    const { error } = await supabaseClient
      .from('conversations')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    if (error) {
      console.warn('Error updating conversation status:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error in updateConversationStatus:', err);
    return false;
  }
}
