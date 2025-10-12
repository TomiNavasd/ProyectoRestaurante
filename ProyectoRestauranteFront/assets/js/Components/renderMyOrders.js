export function renderActiveOrders(orders) {
    const container = document.getElementById('active-orders-container');
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = '<p class="text-muted">No tienes pedidos activos recientes.</p>';
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between">
                    <div>
                        <h5 class="card-title">Orden #${order.orderNumber}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">Estado: ${order.status.name}</h6>
                    </div>
                    <div>
                        <p class="card-text"><strong>Total: $${order.totalAmount.toFixed(2)}</strong></p>
                        <button class="btn btn-sm btn-outline-primary" data-order-id="${order.orderNumber}">Ver Detalle / Modificar</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
