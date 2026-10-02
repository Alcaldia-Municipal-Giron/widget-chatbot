<script lang="ts">
  // Permite comunicar eventos al componente padre.
  import { createEventDispatcher } from 'svelte';

  // Define los eventos que puede emitir este componente.
  const dispatch = createEventDispatcher<{
    minimize: void;
  }>();

  // Permite personalizar el título desde el componente padre.
  export let title = 'Asistente virtual';
</script>

<!-- Cabecera principal del widget. -->
<header class="chat-header">
  <!-- Información e identidad del asistente. -->
  <div class="assistant-info">
    <!-- Icono visual del asistente. -->
    <div class="assistant-avatar" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M12 8V4H8" />
        <rect width="16" height="12" x="4" y="8" rx="2" />
        <path d="M2 14h2" />
        <path d="M20 14h2" />
        <path d="M9 13v2" />
        <path d="M15 13v2" />
      </svg>
    </div>

    <!-- Título y descripción del asistente. -->
    <div class="assistant-details">
      <h2>{title}</h2>
      <p>Asistente con IA</p>
    </div>
  </div>

  <!-- Botón que solicita minimizar el widget. -->
  <button
    type="button"
    class="minimize-button"
    aria-label="Minimizar chat"
    title="Minimizar chat"
    on:click={() => dispatch('minimize')}
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
      <path d="M5 12h14" />
    </svg>
  </button>
</header>

<style>
  /* Organiza horizontalmente la información y el botón. */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background-color: var(--chat-primary);
    color: var(--chat-primary-text);
  }

  /* Agrupa el avatar y los textos del asistente. */
  .assistant-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  /* Da forma al contenedor del icono. */
  .assistant-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--chat-avatar);
  }

  /* Organiza el título y la descripción. */
  .assistant-details {
    min-width: 0;
  }

  .assistant-details h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .assistant-details p {
    margin: 3px 0 0;
    font-size: 12px;
    opacity: 0.85;
  }

  /* Estiliza el botón de minimizar. */
  .minimize-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .minimize-button:hover {
    background-color: var(--chat-header-hover);
  }

  .minimize-button:focus-visible {
    outline: 2px solid var(--chat-focus);
    outline-offset: 2px;
  }
</style>