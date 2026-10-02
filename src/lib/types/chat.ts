
// Define quién envía un mensaje dentro de la conversación.
export type MessageRole = 'user' | 'assistant';

// Representa un mensaje individual del chatbot.
export interface ChatMessage {
  // Identificador único del mensaje.
  id: string;

  // Indica si el mensaje pertenece al usuario o al asistente.
  role: MessageRole;

  // Contenido de texto del mensaje.
  content: string;

  // Fecha y hora de creación en formato ISO 8601.
  createdAt: string;
}
