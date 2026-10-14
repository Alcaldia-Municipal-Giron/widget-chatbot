<script lang="ts">
  // Importa los componentes que conforman el widget.
  import ChatHeader from './ChatHeader.svelte';
  import MessageList from './MessageList.svelte';
  import ChatInput from './ChatInput.svelte';

  // Importa el tipo que define la estructura de un mensaje.
  import type { ChatMessage as ChatMessageType } from '../types/chat';

  // Importa el servicio encargado de comunicarse con FastAPI.
  import { sendChatMessage } from '../services/chatService';

  // Controla si el panel de conversación está abierto.
  let isOpen = false;

  // Conserva los mensajes mientras el componente permanezca montado.
  let messages: ChatMessageType[] = [];

  // Indica si existe una petición en curso.
  let isLoading = false;

  // Identifica la sesión actual de conversación.
  const sessionId = crypto.randomUUID();

  // Abre el panel del chatbot.
  function openChat(): void {
    isOpen = true;
  }

  // Minimiza el panel sin eliminar la conversación.
  function minimizeChat(): void {
    isOpen = false;
  }

  // Actualiza el contenido de un mensaje existente.
  function updateMessage(messageId: string, content: string): void {
    messages = messages.map((message) =>
      message.id === messageId
        ? { ...message, content }
        : message
    );
  }

  // Recibe la pregunta y gestiona la respuesta progresiva del backend.
  async function handleSend(content: string): Promise<void> {
    // Evita solicitudes simultáneas o mensajes vacíos.
    if (isLoading || !content.trim()) {
      return;
    }

    // Crea el mensaje del usuario.
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    // Crea una burbuja vacía que recibirá los fragmentos del asistente.
    const assistantMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString()
    };

    // Agrega ambos mensajes a la conversación.
    messages = [...messages, userMessage, assistantMessage];

    // Bloquea temporalmente el campo de entrada.
    isLoading = true;

    try {
      // Envía la pregunta al backend y recibe cada fragmento.
      await sendChatMessage(
        sessionId,
        userMessage.content,
        (token: string) => {
          // Recupera el contenido actual del mensaje del asistente.
          const currentMessage = messages.find(
            (message) => message.id === assistantMessage.id
          );

          // Acumula el fragmento en la misma burbuja.
          if (currentMessage) {
            updateMessage(
              assistantMessage.id,
              currentMessage.content + token
            );
          }
        }
      );
    } catch (error) {
      // Registra el error para facilitar el diagnóstico.
      console.error('Error al comunicarse con el chatbot:', error);

      // Recupera el contenido parcial, si existe.
      const currentMessage = messages.find(
        (message) => message.id === assistantMessage.id
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.';

      // Informa el error sin ocultar una respuesta parcial.
      const errorNotice = currentMessage?.content
        ? `\n\n[La respuesta se interrumpió: ${errorMessage}]`
        : `No fue posible obtener una respuesta: ${errorMessage}`;

      updateMessage(
        assistantMessage.id,
        (currentMessage?.content ?? '') + errorNotice
      );
    } finally {
      // Habilita nuevamente el campo de entrada.
      isLoading = false;
    }
  }
</script>

<!-- Contenedor principal del widget. -->
<div class="chat-widget">
  <!-- El panel permanece montado para conservar el estado. -->
  <section
    class="chat-panel"
    class:closed={!isOpen}
    aria-label="Ventana del asistente virtual"
    aria-hidden={!isOpen}
  >
    <!-- Cabecera del chat. -->
    <ChatHeader on:minimize={minimizeChat} />

    <!-- Historial de mensajes. -->
    <MessageList {messages} />

    <!-- Campo para escribir y enviar mensajes. -->
    <ChatInput
      disabled={isLoading}
      on:send={(event) => handleSend(event.detail)}
    />
  </section>

  <!-- Botón flotante que permite abrir el chat. -->
  {#if !isOpen}
    <button
      type="button"
      class="chat-launcher"
      aria-label="Abrir chat"
      title="Abrir chat"
      aria-expanded={isOpen}
      on:click={openChat}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
      </svg>
    </button>
  {/if}
</div>

<style>
  /* Mantiene el widget independiente del contenido de la página. */
  .chat-widget {
    position: relative;
    z-index: 1000;
  }

  /* Define la posición y las dimensiones del panel. */
  .chat-panel {
    position: fixed;
    top: auto;
    right: 24px;
    bottom: 24px;

    display: flex;
    flex-direction: column;

    width: 360px;
    max-width: calc(100vw - 32px);

    height: 520px;
    max-height: calc(100dvh - 48px);

    overflow: hidden;
    border: 1px solid var(--chat-border);
    border-radius: 16px;
    background-color: var(--chat-surface);
    box-shadow: var(--chat-shadow);
  }

  /* Oculta el panel sin desmontarlo. */
  .chat-panel.closed {
    display: none;
  }

  /* Estiliza el botón flotante para abrir el chat. */
  .chat-launcher {
    position: fixed;
    right: 24px;
    bottom: 24px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 56px;
    height: 56px;

    border: none;
    border-radius: 50%;

    color: var(--chat-primary-text);
    background-color: var(--chat-primary);
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);

    cursor: pointer;
  }

  .chat-launcher:hover {
    background-color: var(--chat-primary-hover);
    transform: translateY(-2px);
  }

  .chat-launcher:focus-visible {
    outline: 3px solid var(--chat-focus);
    outline-offset: 3px;
  }

  /* Adapta el widget a pantallas móviles. */
  @media (max-width: 480px) {
    .chat-panel {
      inset: 0;

      width: 100%;
      max-width: none;

      height: 100vh;
      height: 100dvh;
      max-height: none;

      border: none;
      border-radius: 0;
    }

    .chat-launcher {
      right: 16px;
      bottom: 16px;
    }
  }

  /* Ajusta el panel cuando la altura disponible es reducida. */
  @media (min-width: 481px) and (max-height: 600px) {
    .chat-panel {
      top: 16px;
      bottom: 16px;

      height: auto;
      max-height: none;
    }
  }
  
</style>