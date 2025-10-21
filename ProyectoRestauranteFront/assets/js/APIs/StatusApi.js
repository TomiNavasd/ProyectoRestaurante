const API_BASE_URL = 'https://localhost:7280/api/v1';

/**
 * Obtiene la lista completa de estados de orden (Pending, In progress, etc.)
 * @returns {Promise<Array>} Una promesa que resuelve a un array de objetos de estado.
 */
export async function getStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/Status`);
        if (!response.ok) {
            console.error('Respuesta no OK de la API de Status');
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error('Error al traer los estados:', error);
        return []; // Devolver array vacío en caso de error
    }
}
