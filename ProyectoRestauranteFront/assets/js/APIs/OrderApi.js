const API_BASE_URL = 'https://localhost:7280/api/v1';

/**
 * nueva orden a la API
 * @param {object} orderRequest el cuerpo de la petición para crear la orden
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
 * obtiene las ordenes desde la API con filtros opcionales.
 * @param {object} [filters={}] ojeto con filtros por ejemplo from: '2025-10-01', to: '2025-10-15'
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
 * actualiza el estado de un ítem específico de una orden.
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
 * actualiza los items de una orden existente.
 * @param {Int32Array} orderId  el id de la orden a actualizar
 * @param {object} updateRequest el cuerpo de la peticion con la nueva lista de items
 * @returns {Promise<object>}
 */
export async function updateOrder(orderId, updateRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
            method: 'PATCH', //posible q lo tenga que cambiar
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateRequest),
        });

        // si la respuesta NO es exitosa (400, 404, 500)
        if (!response.ok) {
            // leemos la respuesta como TEXTO que nunca falla.
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
        }

        const contentLength = response.headers.get('content-length');
        if (!contentLength || contentLength === '0') {
            return { success: true };
        }
        
        //si hay contenido lo parseamos como json.
        return await response.json();

    } catch (error) {
        console.error("Error en updateOrder:", error);
        return { error: error.message };
    }
}

/**
 * actualiza el estado general de una orden.
 * @param {number} orderId el id de la orden.
 * @param {number} newStatusId el id del nuevo estado.
 * @returns {Promise<object>}
 */
export async function updateOrderStatus(orderId, newStatusId) {
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
