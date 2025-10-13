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

/**
 * Envía un nuevo plato a la API para ser creado.
 * @param {object} dishRequest - El objeto con los datos del nuevo plato.
 * @returns {Promise<object>}
 */
export async function createDish(dishRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/Dish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dishRequest),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ocurrió un error al crear el plato.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en createDish:", error);
        return { error: error.message };
    }
}

/**
 * Envía los datos actualizados de un plato a la API.
 * @param {string} dishId - El ID del plato a actualizar.
 * @param {object} dishUpdateRequest - El objeto con los datos actualizados del plato.
 * @returns {Promise<object>}
 */
export async function updateDish(dishId, dishUpdateRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/Dish/${dishId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dishUpdateRequest),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ocurrió un error al actualizar el plato.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en updateDish:", error);
        return { error: error.message };
    }
}