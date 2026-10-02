// Define la estructura de los datos que recibe el endpoint.
interface ChatRequest {
  session_id: string;
  message: string;
}

// Define los datos que contiene un evento SSE.
interface SSEEvent {
  event: string;
  data: string;
}

// Define los datos de un evento token.
interface TokenData {
  content: string;
}

// Define los datos de un evento de error.
interface ErrorData {
  code: string;
  message: string;
}

// Define la dirección base del backend.
const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
).replace(/\/+$/, '');

// Procesa una petición de chat y recibe progresivamente los fragmentos.
export async function sendChatMessage(
  sessionId: string,
  message: string,
  onToken: (content: string) => void
): Promise<void> {
  // Construye la petición que espera FastAPI.
  const requestBody: ChatRequest = {
    session_id: sessionId,
    message
  };

  // Envía la petición HTTP al backend.
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    },
    body: JSON.stringify(requestBody)
  });

  // Gestiona los errores HTTP antes de leer el flujo.
  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Error HTTP ${response.status}: ${errorBody || response.statusText}`
    );
  }

  // Verifica que exista un flujo de respuesta.
  if (!response.body) {
    throw new Error('El servidor no proporcionó un flujo de respuesta.');
  }

  // Permite leer la respuesta progresivamente.
  const reader = response.body.getReader();

  // Convierte los bytes recibidos en texto UTF-8.
  const decoder = new TextDecoder();

  // Almacena temporalmente los datos que todavía no forman un evento completo.
  let buffer = '';

  // Indica si el servidor confirmó la finalización de la respuesta.
  let completed = false;

  // Procesa un evento SSE recibido del servidor.
  function processEvent(rawEvent: string): void {
    const event: SSEEvent = {
      event: 'message',
      data: ''
    };

    const dataLines: string[] = [];

    // Analiza las líneas del evento SSE.
    for (const line of rawEvent.split('\n')) {
      // Ignora líneas vacías y comentarios SSE.
      if (!line || line.startsWith(':')) {
        continue;
      }

      // Identifica el tipo de evento.
      if (line.startsWith('event:')) {
        event.event = line.slice(6).trim();
      }

      // Acumula las líneas de datos del evento.
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).replace(/^ /, ''));
      }
    }

    event.data = dataLines.join('\n');

    // Ignora eventos sin contenido.
    if (!event.data) {
      return;
    }

    // Convierte los datos JSON del evento.
    let payload: unknown;

    try {
      payload = JSON.parse(event.data);
    } catch {
      throw new Error('El servidor envió un evento SSE inválido.');
    }

    // Procesa los fragmentos de texto.
    if (event.event === 'token') {
      const token = payload as TokenData;

      if (typeof token.content !== 'string') {
        throw new Error('El evento token no contiene texto válido.');
      }

      onToken(token.content);
      return;
    }

    // Procesa la confirmación de finalización.
    if (event.event === 'done') {
      completed = true;
      return;
    }

    // Procesa los errores enviados dentro del flujo.
    if (event.event === 'error') {
      const error = payload as ErrorData;

      throw new Error(
        error.message || 'El servidor no pudo completar la respuesta.'
      );
    }
  }

  try {
    // Lee el flujo mientras el servidor siga enviando datos.
    while (true) {
      const { value, done } = await reader.read();

      // Finaliza la lectura cuando se cierra el flujo.
      if (done) {
        buffer += decoder.decode();
        break;
      }

      // Convierte el fragmento recibido a texto.
      buffer += decoder.decode(value, { stream: true });

      // Normaliza los saltos de línea del protocolo SSE.
      buffer = buffer.replace(/\r\n/g, '\n');

      // Extrae y procesa todos los eventos completos disponibles.
      let separatorIndex = buffer.indexOf('\n\n');

      while (separatorIndex !== -1) {
        const rawEvent = buffer.slice(0, separatorIndex);

        buffer = buffer.slice(separatorIndex + 2);

        processEvent(rawEvent);

        separatorIndex = buffer.indexOf('\n\n');
      }
    }

    // Procesa un posible evento final sin separador.
    if (buffer.trim()) {
      processEvent(buffer);
    }

    // No considera exitosa una respuesta que no emitió done.
    if (!completed) {
      throw new Error(
        'El flujo terminó sin confirmar la finalización de la respuesta.'
      );
    }
  } finally {
    // Libera el lector incluso cuando ocurre un error.
    reader.releaseLock();
  }
}