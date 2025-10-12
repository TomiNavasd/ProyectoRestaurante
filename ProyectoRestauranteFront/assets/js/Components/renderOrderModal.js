export function renderOrderModal(order) {
    const orderNumberEl = document.getElementById('modal-order-number');
    const orderBodyEl = document.getElementById('modal-order-body');
    const saveButton = document.querySelector('#order-details-modal .btn-primary');

    orderNumberEl.textContent = `Detalles de la Orden #${order.orderNumber}`;

    // Guardamos el ID de la orden en el botón de guardar para usarlo después
    saveButton.dataset.orderId = order.orderNumber;

    // Si la orden no está pendiente (ID 1), deshabilitamos el botón de guardar
    if (order.status.id !== 1) {
        saveButton.style.display = 'none';
    } else {
        saveButton.style.display = 'block';
    }

    orderBodyEl.innerHTML = `
        <p><strong>Estado:</strong> <span class="badge bg-info">${order.status.name}</span></p>
        <h6>Ítems en la Orden</h6>
        <ul id="modal-item-list" class="list-group">
            ${order.items.map(item => `
                <li class="list-group-item d-flex justify-content-between align-items-center" data-item-id="${item.dish.id}" data-quantity="${item.quantity}">
                    <span>${item.dish.name}</span>
                    <div class="d-flex align-items-center">
                        ${order.status.id === 1 ? // Solo mostramos controles si la orden está pendiente
                            `<button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="decrease">-</button>
                             <span class="mx-2 item-quantity">${item.quantity}</span>
                             <button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="increase">+</button>`
                             : `<span class="item-quantity">Cantidad: ${item.quantity}</span>`
                        }
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
}