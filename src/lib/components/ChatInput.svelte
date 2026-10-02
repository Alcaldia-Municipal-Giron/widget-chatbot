<script lang="ts">
  // Permite emitir eventos hacia el componente padre.
  import { createEventDispatcher } from 'svelte';

  // Define los eventos que este componente puede emitir.
  const dispatch = createEventDispatcher<{
    send: string;
  }>();

  // Almacena el texto que el usuario está escribiendo.
  let message = '';

  // Permite que el componente padre bloquee el campo de entrada.
  export let disabled = false;

  // Determina si el mensaje puede enviarse.
  $: canSend = message.trim().length > 0 && !disabled;

  // Emite el mensaje y limpia el campo de entrada.
  function sendMessage(): void {
    const content = message.trim();

    // Evita enviar mensajes vacíos o cuando el envío está bloqueado.
    if (!content || disabled) {
      return;
    }

    // Comunica el contenido al componente padre.
    dispatch('send', content);

    // Limpia el campo después de emitir el mensaje.
    message = '';
  }

  // Permite enviar con Enter y escribir saltos de línea con Shift + Enter.
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<!-- Área de entrada y envío de mensajes. -->
<div class="chat-input">
  <textarea
    bind:value={message}
    placeholder="Escribe tu mensaje..."
    aria-label="Escribe tu mensaje"
    rows="1"
    disabled={disabled}
    on:keydown={handleKeydown}
  ></textarea>

  <!-- Botón para enviar el mensaje. -->
  <button
    type="button"
    class="send-button"
    aria-label="Enviar mensaje"
    title="Enviar mensaje"
    disabled={!canSend}
    on:click={sendMessage}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  </button>
</div>

<style>
  /* Distribuye el campo de texto y el botón de envío. */
  .chat-input {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid var(--chat-border);
    background-color: var(--chat-surface);
  }

  /* Configura el área donde se escribe el mensaje. */
  textarea {
    flex: 1;
    min-width: 0;
    max-height: 120px;
    padding: 10px 12px;
    border: 1px solid var(--chat-border);
    border-radius: 12px;
    outline: none;
    resize: none;
    font-size: 14px;
    line-height: 1.5;
    color: var(--chat-text);
    background-color: var(--chat-surface);
  }

  textarea:focus {
    border-color: var(--chat-primary);
  }

  textarea:disabled {
    cursor: not-allowed;
    background-color: var(--chat-background);
  }

  textarea::placeholder {
    color: var(--chat-placeholder);
  }

  /* Estiliza el botón de envío. */
  .send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 10px;
    color: var(--chat-primary-text);
    background-color: var(--chat-primary);
    cursor: pointer;
  }

  .send-button:hover:not(:disabled) {
    background-color: var(--chat-primary-hover);
  }

  .send-button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .send-button:focus-visible {
    outline: 2px solid var(--chat-focus);
    outline-offset: 3px;
  }
</style>