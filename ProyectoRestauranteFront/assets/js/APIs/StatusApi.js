const API_BASE_URL = 'https://localhost:7280/api/v1';

/**
 * obtiene la lista completa de estados de orden
 * @returns {Promise<Array>} una promesa que resuelve a un array de objetos de estado.
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
