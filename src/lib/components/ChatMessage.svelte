<script lang="ts">
  // Importa el tipo que define la estructura de un mensaje.
  import type { ChatMessage as ChatMessageType } from '../types/chat';

  // Recibe el mensaje que este componente debe mostrar.
  export let message: ChatMessageType;
</script>

<!-- Contenedor principal de un mensaje individual. -->
<div
  class="message-row"
  class:user={message.role === 'user'}
  class:assistant={message.role === 'assistant'}
>
  <!-- Burbuja que contiene el texto del mensaje. -->
  <div class="message-bubble">
    <p>{message.content}</p>
  </div>
</div>

<style>
  /* Distribuye cada mensaje dentro del historial. */
  .message-row {
    display: flex;
    width: 100%;
    margin-bottom: 12px;
  }

  /* Los mensajes del usuario se alinean a la derecha. */
  .message-row.user {
    justify-content: flex-end;
  }

  /* Los mensajes del asistente se alinean a la izquierda. */
  .message-row.assistant {
    justify-content: flex-start;
  }

  /* Estilo común de las burbujas. */
  .message-bubble {
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 14px;
    overflow-wrap: anywhere;
  }

  /* Colores para los mensajes del usuario. */
  .user .message-bubble {
    background-color: var(--chat-user-bubble);
    color: var(--chat-user-text);
    border-bottom-right-radius: 4px;
  }

  /* Colores para los mensajes del asistente. */
  .assistant .message-bubble {
    background-color: var(--chat-assistant-bubble);
    color: var(--chat-assistant-text);
    border-bottom-left-radius: 4px;
  }

  /* Conserva los saltos de línea del contenido. */
  .message-bubble p {
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
  }
</style>