// /assets/js/Components/renderOrdersPage.js

export function renderOrders(orders, containerId, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!orders || orders.length === 0) {
        container.innerHTML = `<p class="text-muted">${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = orders.map(order => {
        const isHistory = order.status.id >= 4;
        let buttonHtml;

        if (isHistory) {
            buttonHtml = `
                <button class="btn btn-sm btn-outline-secondary view-details-btn" 
                        data-order-id="${order.orderNumber}"
                        data-bs-toggle="modal"
                        data-bs-target="#order-details-modal">
                    Ver Detalle
                </button>
            `;
        } else {
            buttonHtml = `
                <button class="btn btn-sm btn-primary view-details-btn" 
                        data-order-id="${order.orderNumber}"
                        data-bs-toggle="modal"
                        data-bs-target="#order-details-modal">
                    Ver Detalle / Modificar
                </button>
            `;
        }

        return `
            <div class="card shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="card-title">Orden #${order.orderNumber}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Total: $${order.totalAmount.toFixed(2)}</h6>
                            <small class="text-muted">Realizado el: ${new Date(order.createdAt).toLocaleDateString()}</small>
                        </div>
                        <div class="d-flex flex-column align-items-end">
                            <span class="badge ${isHistory ? 'bg-secondary' : 'bg-success'} mb-2">
                                ${order.status.name}
                            </span>
                            ${buttonHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}