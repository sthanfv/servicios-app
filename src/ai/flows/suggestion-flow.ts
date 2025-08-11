'use server';
/**
 * @fileOverview Un flujo de IA para generar descripciones de servicios.
 * 
 * - suggestDescription - Una función que genera una descripción de servicio basada en un título.
 * - SuggestionInput - El tipo de entrada para la función suggestDescription.
 * - SuggestionOutput - El tipo de retorno para la función suggestDescription.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SuggestionInputSchema = z.object({
    title: z.string().describe('El título del servicio para el cual generar una descripción.'),
});
export type SuggestionInput = z.infer<typeof SuggestionInputSchema>;

const SuggestionOutputSchema = z.string().describe('La descripción de servicio sugerida.');
export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;

// Exported wrapper function to be called from the client
export async function suggestDescription(input: SuggestionInput): Promise<SuggestionOutput> {
    return suggestionFlow(input);
}

const suggestionPrompt = ai.definePrompt({
    name: 'suggestionPrompt',
    input: { schema: SuggestionInputSchema },
    output: { schema: SuggestionOutputSchema },
    prompt: `Eres un experto en marketing y redacción publicitaria especializado en la creación de anuncios de servicios locales.
    
    Tu tarea es generar una descripción de servicio atractiva, profesional y vendedora basada únicamente en el título proporcionado.
    
    El tono debe ser amigable, confiable y directo. Destaca los beneficios clave y utiliza un lenguaje claro. No excedas las 3 o 4 frases. No incluyas información de contacto ni precios. No uses markdown.
    
    Título del servicio: {{{title}}}
    
    Genera la descripción a continuación:`,
});


const suggestionFlow = ai.defineFlow(
  {
    name: 'suggestionFlow',
    inputSchema: SuggestionInputSchema,
    outputSchema: SuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await suggestionPrompt(input);
    return output!;
  }
);
