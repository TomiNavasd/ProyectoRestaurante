/**
 * Dibuja los items del carrito, el total y el contador de la barra de navegación.
 * @param {Array} cart - El array de items en el carrito.
 */
export function renderCart(cart) {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total');
    const cartCounter = document.getElementById('cart-counter');

    if (!container || !totalEl || !cartCounter) return;

    // --- CORRECCIÓN CLAVE: Sumamos las cantidades de cada item ---
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
    cartCounter.textContent = totalQuantity;
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-muted">Tu comanda está vacía.</p>';
        totalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="list-group-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="my-0">${item.name}</h6>
                        <small class="text-muted">Cantidad: ${item.quantity}</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-secondary cart-action-btn" data-dish-id="${item.id}" data-action="decrease">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary cart-action-btn" data-dish-id="${item.id}" data-action="increase">+</button>
                        <button class="btn btn-sm btn-danger ms-3 cart-action-btn" data-dish-id="${item.id}" data-action="remove">X</button>
                    </div>
                </div>
                <input type="text"
                       class="form-control form-control-sm mt-2 item-note-input"
                       placeholder="Notas (ej: sin cebolla, bien cocido...)"
                       data-dish-id="${item.id}"
                       value="${item.notes || ''}">
            </div>
        `;
    }).join('');

    totalEl.textContent = total.toFixed(2);
}

/**
 * Rellena el selector de tipos de entrega.
 * @param {Array} deliveryTypes - El array de tipos de entrega.
 */
export function renderDeliveryTypes(deliveryTypes) {
    const select = document.getElementById('delivery-type');
    if (!select) return;

    select.innerHTML = deliveryTypes.map(type => 
        `<option value="${type.id}">${type.name}</option>`
    ).join('');
}