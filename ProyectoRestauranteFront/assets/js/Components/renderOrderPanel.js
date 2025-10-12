/**
 * Dibuja todas las órdenes en sus respectivas columnas de estado.
 * @param {Array} orders - El array de órdenes.
 */
export function renderOrderPanel(orders) {
    const pendingContainer = document.getElementById('orders-pending');
    const preparingContainer = document.getElementById('orders-preparing');
    const readyContainer = document.getElementById('orders-ready');

    if (!pendingContainer || !preparingContainer || !readyContainer) return;

    pendingContainer.innerHTML = '';
    preparingContainer.innerHTML = '';
    readyContainer.innerHTML = '';

    for (const order of orders) {
        const cardHtml = `
            <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between">
                    <strong>Orden #${order.orderNumber}</strong>
                    <span class="badge bg-secondary">${order.deliveryType.name}</span>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        ${order.items.map(item => `
                            <li class="list-group-item d-flex justify-content-between align-items-center">
                                <span>${item.quantity}x ${item.dish.name} (${item.status.name})</span>
                                <div class="btn-group">
                                    ${item.status.id === 1 ? `<button class="btn btn-sm btn-warning status-action-btn" data-order-id="${order.orderNumber}" data-item-id="${item.id}" data-new-status="2">Preparar</button>` : ''}
                                    ${item.status.id === 2 ? `<button class="btn btn-sm btn-success status-action-btn" data-order-id="${order.orderNumber}" data-item-id="${item.id}" data-new-status="3">Terminar</button>` : ''}
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        `;

        switch (order.status.id) {
            case 1: pendingContainer.innerHTML += cardHtml; break;
            case 2: preparingContainer.innerHTML += cardHtml; break;
            case 3: readyContainer.innerHTML += cardHtml; break;
        }
    }
}