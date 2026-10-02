<script lang="ts">
  // Importa el tipo que define la estructura de los mensajes.
  import type { ChatMessage as ChatMessageType } from '../types/chat';

  // Importa el componente que representa cada mensaje.
  import ChatMessage from './ChatMessage.svelte';

  // Recibe la colección de mensajes de la conversación.
  export let messages: ChatMessageType[] = [];
</script>

<!-- Contenedor desplazable de los mensajes. -->
<div class="message-list" aria-label="Mensajes de la conversación">
  {#if messages.length > 0}
    {#each messages as message (message.id)}
      <ChatMessage {message} />
    {/each}
  {:else}
    <!-- Mensaje inicial cuando no hay conversación. -->
    <div class="empty-state">
      <p>¡Hola! ¿En qué puedo ayudarte?</p>
    </div>
  {/if}
</div>

<style>
  /* Organiza el historial y habilita su desplazamiento independiente. */
  .message-list {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
    gap: 4px;
    background-color: var(--chat-surface);
  }

  /* Personaliza la barra de desplazamiento en navegadores compatibles. */
  .message-list::-webkit-scrollbar {
    width: 6px;
  }

  .message-list::-webkit-scrollbar-thumb {
    background-color: var(--chat-scrollbar);
    border-radius: 10px;
  }

  /* Centra el mensaje de bienvenida. */
  .empty-state {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: var(--chat-text-muted);
    text-align: center;
  }

  .empty-state p {
    margin: 0;
  }
</style>