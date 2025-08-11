'use server';
/**
 * @fileOverview Un flujo de IA para el chatbot de soporte.
 * 
 * - supportChat - Una función que responde a las preguntas de los usuarios.
 * - SupportChatInput - El tipo de entrada para la función supportChat.
 * - SupportChatOutput - El tipo de retorno para la función supportChat.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SupportChatInputSchema = z.object({
    question: z.string().describe('La pregunta del usuario.'),
});
export type SupportChatInput = z.infer<typeof SupportChatInputSchema>;

const SupportChatOutputSchema = z.string().describe('La respuesta del asistente de IA.');
export type SupportChatOutput = z.infer<typeof SupportChatOutputSchema>;

export async function supportChat(input: SupportChatInput): Promise<SupportChatOutput> {
    return supportChatFlow(input);
}

const faqData = `
1. ¿Cómo publico un servicio?
   - Para publicar, inicia sesión, ve a "Agregar Servicio", completa el formulario con título, descripción, categoría, precio y una imagen, y haz clic en "Guardar Servicio".

2. ¿Cómo contacto a un proveedor?
   - En la página de detalle del servicio, haz clic en "Contactar" o "Contratar Servicio". Esto te permitirá enviar un mensaje directo o una solicitud formal al proveedor a través de nuestro chat.

3. ¿Es seguro pagar por la plataforma?
   - Actualmente, ServiYa solo conecta a clientes y proveedores. Los acuerdos de pago se realizan directamente entre las partes. No procesamos pagos en la plataforma.

4. ¿Cómo funcionan las reseñas?
   - Después de que un servicio se marca como "Completado", puedes dejar una reseña y una calificación de 1 a 5 estrellas en la página del servicio. Tu opinión ayuda a toda la comunidad.

5. ¿Qué es un proveedor verificado?
   - Un proveedor verificado (con una insignia de escudo azul) es alguien cuya identidad ha sido confirmada por nuestro equipo, lo que añade una capa extra de confianza.

6. Olvidé mi contraseña, ¿qué hago?
   - En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones para recibir un correo de restablecimiento.
`;

const supportChatPrompt = ai.definePrompt({
    name: 'supportChatPrompt',
    input: { schema: SupportChatInputSchema },
    output: { schema: SupportChatOutputSchema },
    prompt: `Eres "Yani", el asistente virtual amigable y servicial de ServiYa, una plataforma que conecta proveedores de servicios con clientes.

Tu tarea es responder a las preguntas de los usuarios de manera clara, concisa y amable. Utiliza la siguiente base de conocimientos de Preguntas Frecuentes (FAQs) como tu fuente principal de verdad.

Base de Conocimientos (FAQs):
{{{faqData}}}

Instrucciones:
- Basándote en la pregunta del usuario, encuentra la respuesta más relevante en las FAQs y reformúlala de manera conversacional.
- Si la pregunta no está en las FAQs, responde honestamente que no tienes la información y sugiere al usuario que contacte por WhatsApp para obtener ayuda más detallada. No inventes respuestas.
- Siempre mantén un tono positivo y servicial.
- No reveles que eres un prompt de IA.

Pregunta del usuario: {{{question}}}

Respuesta de Yani:`,
});


const supportChatFlow = ai.defineFlow(
  {
    name: 'supportChatFlow',
    inputSchema: SupportChatInputSchema,
    outputSchema: SupportChatOutputSchema,
  },
  async (input) => {
    const { output } = await supportChatPrompt({ ...input, faqData });
    return output!;
  }
);
