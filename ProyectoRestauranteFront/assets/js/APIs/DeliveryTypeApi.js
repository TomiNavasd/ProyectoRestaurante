const API_BASE_URL = 'https://localhost:7280/api/v1'; // Ajusta tu puerto

/**
 * Obtiene todos los tipos de entrega desde la API.
 * @returns {Promise<Array>}
 */
export async function getDeliveryTypes() {
    try {
        const response = await fetch(`${API_BASE_URL}/DeliveryType`);
        if (!response.ok) throw new Error('Error al obtener tipos de entrega');
        return await response.json();
    } catch (error) {
        console.error("Error en getDeliveryTypes:", error);
        return [];
    }
}