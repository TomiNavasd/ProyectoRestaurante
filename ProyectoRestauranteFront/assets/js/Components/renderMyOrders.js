/**
 * lista de ordenes activas en su contenedor correspondiente
 * @param {Array} ordenes lista de órdenes activas a mostrar.
 */
export function renderActiveOrders(ordenes) {
    const contenedor = document.getElementById('active-orders-container');
    // sino encontramos el div, salimos para evitar errores.
    if (!contenedor) return;

    // Si no hay pedidos activos
    if (ordenes.length === 0) {
        contenedor.innerHTML = '<p class="text-muted">No tienes pedidos activos recientes.</p>';
        return;
    }

    // mapeo
    contenedor.innerHTML = ordenes.map(orden => `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <h5 class="card-title">Orden #${orden.orderNumber}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">Estado: ${orden.status.name}</h6>
                    </div>
                    <div class="text-end">
                        <p class="card-text"><strong>Total: $${orden.totalAmount.toFixed(2)}</strong></p>
                        <button class="btn btn-sm btn-outline-primary view-details-btn" data-order-id="${orden.orderNumber}">Ver Detalle / Modificar</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}