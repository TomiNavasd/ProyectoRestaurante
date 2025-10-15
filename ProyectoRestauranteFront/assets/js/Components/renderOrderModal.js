// /assets/js/Components/renderOrderModal.js

/**
 * Renderiza el contenido del modal de detalles de la orden.
 * @param {object} order - El objeto de la orden con todos sus detalles.
 */
export function renderOrderModal(order) {
    const orderNumberEl = document.getElementById('modal-order-number');
    const orderBodyEl = document.getElementById('modal-order-body');
    const saveButton = document.querySelector('#order-details-modal #save-changes-btn');

    if (!orderNumberEl || !orderBodyEl) return;

    orderNumberEl.textContent = `Detalles de la Orden #${order.orderNumber}`;

    const isEditable = order.status.id === 1;

    if (saveButton) {
        saveButton.dataset.orderId = order.orderNumber;
        saveButton.style.display = isEditable ? 'block' : 'none';
    }

    // --- LÓGICA CORREGIDA PARA MOSTRAR LA ETIQUETA CORRECTA ---
    let deliveryLabel = 'Detalle'; // Etiqueta por defecto

    if (order.deliveryType.id === 1) {
        deliveryLabel = 'Dirección';
    } else if (order.deliveryType.id === 2) {
        deliveryLabel = 'Nombre';
    } else if (order.deliveryType.id === 3) {
        deliveryLabel = 'N° de Mesa';
    }

    // Se muestra siempre como texto plano, nunca como un formulario.
    const deliveryDetailsHtml = `
        <p><strong>Tipo de Entrega:</strong> ${order.deliveryType.name}</p>
        <p><strong>${deliveryLabel}:</strong> ${order.deliveryTo || 'N/A'}</p>
    `;

    orderBodyEl.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Estado:</strong> <span class="badge bg-info">${order.status.name}</span></p>
                <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
            </div>
            <div class="col-md-6">
                ${deliveryDetailsHtml}
            </div>
        </div>
        <hr>
        <h6>Ítems en la Orden</h6>
        <ul id="modal-item-list" class="list-group">
            ${order.items.map(item => `
                <li class="list-group-item" data-item-id="${item.dish.id}" data-quantity="${item.quantity}">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>${item.dish.name}</span>
                        <div class="d-flex align-items-center">
                            ${isEditable ? `
                                <button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="decrease">-</button>
                                <span class="mx-2 item-quantity">${item.quantity}</span>
                                <button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="increase">+</button>
                            ` : `<span class="item-quantity">Cantidad: ${item.quantity}</span>`}
                        </div>
                    </div>
                    ${isEditable ? `
                        <input type="text" class="form-control form-control-sm mt-2 modal-item-note" placeholder="Notas para este plato..." value="${item.notes || ''}">
                    ` : `${item.notes ? `<p class="text-muted mt-2 mb-0">Nota: ${item.notes}</p>` : ''}`}
                </li>
            `).join('')}
        </ul>
        ${isEditable ? `
        <div class="d-grid gap-2 mt-4">
            <button class="btn btn-success" type="button" data-bs-toggle="modal" data-bs-target="#add-dishes-modal">
                Agregar Platos
            </button>
        </div>
        ` : ''}
    `;
}