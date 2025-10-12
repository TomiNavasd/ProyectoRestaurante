const API_BASE_URL = 'https://localhost:7280/api/v1'; // Ajusta tu puerto

/**
 * Obtiene los platos desde la API, con filtros opcionales.
 * @param {string|null} name - El texto para buscar por nombre.
 * @param {number|null} categoryId - El ID de la categoría para filtrar.
 * @returns {Promise<Array>}
 */
export async function getDishes(name = null, categoryId = null) {
    try {
        const url = new URL(`${API_BASE_URL}/Dish`);
        if (name) url.searchParams.append('name', name);
        if (categoryId) url.searchParams.append('category', categoryId);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener los platos.');
        return await response.json();
    } catch (error) {
        console.error("Error en getDishes:", error);
        return [];
    }
}