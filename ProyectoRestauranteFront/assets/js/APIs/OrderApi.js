const API_BASE_URL = 'https://localhost:7280/api/v1'; // Ajusta tu puerto

/**
 * Envía una nueva orden a la API.
 * @param {object} orderRequest - El cuerpo de la petición para crear la orden.
 * @returns {Promise<object>}
 */
export async function createOrder(orderRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/Order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderRequest),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear la orden.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en createOrder:", error);
        return { error: error.message };
    }
}

/**
 * Obtiene todas las órdenes desde la API.
 * @returns {Promise<Array>}
 */
export async function getOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/Order`);
        if (!response.ok) throw new Error('Error al obtener las órdenes');
        return await response.json();
    } catch (error) {
        console.error("Error en getOrders:", error);
        return [];
    }
}

/**
 * Actualiza el estado de un ítem específico de una orden.
 * @param {number} orderId 
 * @param {number} itemId 
 * @param {number} newStatus 
 * @returns {Promise<object>}
 */
export async function updateOrderItemStatus(orderId, itemId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/Order/${orderId}/item/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el estado.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en updateOrderItemStatus:", error);
        return { error: error.message };
    }
}

export async function getOrderById(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/Order/${orderId}`);
        if (!response.ok) throw new Error('Orden no encontrada');
        return await response.json();
    } catch (error) {
        console.error(`Error al obtener orden ${orderId}:`, error);
        return null; // Devuelve null si hay un error
    }
}

/**
 * Actualiza los items de una orden existente.
 * @param {number} orderId - El ID de la orden a actualizar.
 * @param {object} updateRequest - El cuerpo de la petición con la nueva lista de items.
 * @returns {Promise<object>}
 */
export async function updateOrder(orderId, updateRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateRequest),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar la orden.');
        }
        return await response.json();
    } catch (error) {
        console.error("Error en updateOrder:", error);
        return { error: error.message };
    }
}