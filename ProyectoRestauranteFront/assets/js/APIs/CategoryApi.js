const API_BASE_URL = 'https://localhost:7280/api/v1'; // Ajusta tu puerto

/**
 * Obtiene todas las categorías desde la API.
 * @returns {Promise<Array>}
 */
export async function getCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/Category`);
        if (!response.ok) throw new Error('Error al obtener categorías');
        return await response.json();
    } catch (error) {
        console.error("Error en getCategories:", error);
        return [];
    }
}