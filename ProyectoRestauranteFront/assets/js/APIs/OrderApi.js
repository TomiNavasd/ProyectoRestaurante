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
 * Obtiene las órdenes desde la API, con filtros opcionales.
 * @param {object} [filters={}] - Objeto con filtros (ej: { from: '2025-10-01', to: '2025-10-15' }).
 * @returns {Promise<Array>}
 */
export async function getOrders(filters = {}) {
    try {
        const url = new URL(`${API_BASE_URL}/Order`);

        // Añade los filtros como parámetros de búsqueda si existen
        if (filters.from) {
            url.searchParams.append('from', filters.from);
        }
        if (filters.to) {
            url.searchParams.append('to', filters.to);
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener las órdenes');
        return await response.json();
    } catch (error) {
        console.error("Error en getOrders:", error);
        return { error: error.message };
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
 * @param {Int32Array} orderId - El ID de la orden a actualizar.
 * @param {object} updateRequest - El cuerpo de la petición con la nueva lista de items.
 * @returns {Promise<object>}
 */
export async function updateOrder(orderId, updateRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateRequest),
        });

        // Si la respuesta NO es exitosa (ej: 400, 404, 500)
        if (!response.ok) {
            // Leemos la respuesta como TEXTO, que nunca falla.
            const errorText = await response.text();
            // Usamos el texto del error si existe, o el mensaje de estado por defecto.
            throw new Error(errorText || response.statusText);
        }

        // Si la respuesta es exitosa pero no tiene contenido (ej: 204 No Content)
        const contentLength = response.headers.get('content-length');
        if (!contentLength || contentLength === '0') {
            return { success: true }; // Devolvemos un objeto de éxito simple.
        }
        
        // Solo si hay contenido, lo parseamos como JSON.
        return await response.json();

    } catch (error) {
        console.error("Error en updateOrder:", error);
        return { error: error.message };
    }
}

/**
 * Actualiza el estado general de una orden.
 * @param {number} orderId - El ID de la orden.
 * @param {number} newStatusId - El ID del nuevo estado.
 * @returns {Promise<object>}
 */
export async function updateOrderStatus(orderId, newStatusId) {
    // NOTA: Asumimos que tu backend tiene un endpoint PATCH o PUT
    // para cambiar solo el estado. Si no, necesitaríamos enviar el objeto completo.
    // Esta es una implementación común con PATCH.
    try {
        const response = await fetch(`${API_BASE_URL}/Order/${orderId}/status`, { // Asumiendo un endpoint específico, ajústalo si es necesario
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatusId }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el estado de la orden.');
        }
        return { success: true };
    } catch (error) {
        console.error("Error en updateOrderStatus:", error);
        return { error: error.message };
    }
}
