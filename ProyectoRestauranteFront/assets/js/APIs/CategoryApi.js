const API_BASE_URL = 'https://localhost:7280/api/v1';

/**
 * para obtener categorias de la APi
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