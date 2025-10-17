    /**
     * lista de items en la comanda calcula el total y actualiza el contador del carrito
     * @param {Array} cart array de items que están actualmente en el carrito
     */
    export function renderCart(cart) {
        // obtengo elementos
        const contenedor = document.getElementById('cart-items-container');
        const elementoTotal = document.getElementById('cart-total');
        const contadorCarrito = document.getElementById('cart-counter');

        // si no encontramos los elementos no hacemos nada
        if (!contenedor || !elementoTotal || !contadorCarrito) return;

        // sumamos las cantidades de todos los productos no solo la cantidad de items distintos
        const cantidadTotal = cart.reduce((total, item) => total + item.quantity, 0);
        contadorCarrito.textContent = cantidadTotal;
        
        // si el carrito está vacío, mostramos un mensaje y reseteamos el total
        if (cart.length === 0) {
            contenedor.innerHTML = '<p class="text-muted">Tu comanda está vacía.</p>';
            elementoTotal.textContent = '0.00';
            return;
        }

        let totalGeneral = 0;
        // mapeo
        contenedor.innerHTML = cart.map(item => {
            const subtotalItem = item.price * item.quantity;
            totalGeneral += subtotalItem;
            
            // plantilla para cada producto en la comanda.
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

        elementoTotal.textContent = totalGeneral.toFixed(2);
    }

    /**
     * Tipo de entrega con los datos que vienen de la API
     * @param {Array} deliveryTypes array los tipos de entrega (Delivery, take away...)
     */
    export function renderDeliveryTypes(deliveryTypes) {
        const selector = document.getElementById('delivery-type');
        if (!selector) return;

        selector.innerHTML = deliveryTypes.map(tipo => 
            `<option value="${tipo.id}">${tipo.name}</option>`
        ).join('');
    }