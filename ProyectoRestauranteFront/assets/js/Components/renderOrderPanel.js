/**
 * Dibuja todas las órdenes en sus respectivas columnas de estado.
 * @param {Array} orders - El array de órdenes.
 */
export function renderOrderPanel(orders) {
    const pendingContainer = document.getElementById('orders-pending');
    const preparingContainer = document.getElementById('orders-preparing');
    const readyContainer = document.getElementById('orders-ready');

    if (!pendingContainer || !preparingContainer || !readyContainer) return;

    // Limpiamos los contenedores antes de volver a renderizar
    pendingContainer.innerHTML = '';
    preparingContainer.innerHTML = '';
    readyContainer.innerHTML = '';

    // Si no hay órdenes, mostramos un mensaje y salimos
    if (!orders || orders.length === 0) {
        pendingContainer.innerHTML = '<p class="text-muted text-center">No hay órdenes pendientes.</p>';
        preparingContainer.innerHTML = '<p class="text-muted text-center">No hay órdenes en preparación.</p>';
        readyContainer.innerHTML = '<p class="text-muted text-center">No hay órdenes listas para entregar.</p>';
        return;
    }

    // Iteramos sobre cada orden para construir su HTML
    for (const order of orders) {
        // Lógica para mostrar el botón "Entregar" solo si la orden está en estado "Listo"
        let deliverButtonHtml = '';
        if (order.status.id === 3) { // Asumiendo que 3 es el ID para "Listo"
            deliverButtonHtml = `
                <button class="btn btn-sm btn-info order-action-btn ms-2"
                        data-order-id="${order.orderNumber}"
                        data-new-status-id="4">
                    Entregar
                </button>
            `;
        }

        const cardHtml = `
            <div class="card shadow-sm">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <strong>Orden #${order.orderNumber}</strong>
                    
                    <div class="d-flex align-items-center">
                        <span class="badge bg-secondary">${order.deliveryType.name}</span>
                        
                        <button class="btn btn-sm btn-outline-secondary ms-2 view-details-btn" 
                                data-bs-toggle="modal" 
                                data-bs-target="#order-details-modal"
                                data-order-id="${order.orderNumber}">
                            Ver Detalle
                        </button>

                        ${deliverButtonHtml}
                    </div>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush">
                        ${order.items.map(item => `
                            <li class="list-group-item d-flex justify-content-between align-items-center" data-item-id="${item.id}">
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

        // Añadimos la tarjeta a la columna correspondiente
        switch (order.status.id) {
            case 1: pendingContainer.innerHTML += cardHtml; break; // Pendiente
            case 2: preparingContainer.innerHTML += cardHtml; break; // En Preparación
            case 3: readyContainer.innerHTML += cardHtml; break; // Listo para Entregar
        }
    }
}