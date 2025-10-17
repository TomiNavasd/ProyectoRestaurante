import { state } from '../../state.js';
import { createOrder } from '../../APIs/OrderApi.js';
import { renderCart } from '../../Components/renderCart.js';
import { mostrarNot } from '../../notification.js';

// funciones para manipular el estado del carrito agregando, quitando, aumentando y disminuyendo la cantidad
function agregarAlCarrito(plato) {
    const itemExistente = state.cart.find(item => item.id === plato.id);
    if (itemExistente) {
        itemExistente.quantity++;
    } else {
        state.cart.push({ id: plato.id, name: plato.name, price: plato.price, quantity: 1, notes: '' });
    }
    renderCart(state.cart);
}

function aumentarCantidad(platoId) {
    const itemEnCarrito = state.cart.find(i => i.id === platoId);
    if (itemEnCarrito) {
        itemEnCarrito.quantity++;
        renderCart(state.cart);
    }
}

function disminuirCantidad(platoId) {
    const itemEnCarrito = state.cart.find(i => i.id === platoId);
    if (itemEnCarrito && itemEnCarrito.quantity > 1) {
        itemEnCarrito.quantity--;
        renderCart(state.cart);
    } else if (itemEnCarrito && itemEnCarrito.quantity === 1) {
        // si la cantidad es 1 y se disminuye lo quitamos del carrito.
        quitarDelCarrito(platoId);
    }
}

function quitarDelCarrito(platoId) {
    state.cart = state.cart.filter(item => item.id !== platoId);
    renderCart(state.cart);
}

//  configurar los eventos de la UI 

function configurarEventosDelCarrito() {
    const contenedorListaPlatos = document.getElementById('dish-list-container');
    const contenedorCarrito = document.getElementById('cart-items-container');

    // listener para el botón agregar a la comanda en las tarjetas de los platos
    contenedorListaPlatos.addEventListener('click', (event) => {
        if (!event.target.classList.contains('add-to-cart-btn')) return;
        const platoId = event.target.dataset.dishId;
        const platoParaAgregar = state.dishes.find(plato => plato.id === platoId);
        if (platoParaAgregar) {
            agregarAlCarrito(platoParaAgregar);
        }
    });

    // listener para las acciones DENTRO del carrito notas, +, -
    contenedorCarrito.addEventListener('input', (event) => {
        if (event.target.classList.contains('item-note-input')) {
            const platoId = event.target.dataset.dishId;
            const itemEnEstado = state.cart.find(item => item.id === platoId);
            if (itemEnEstado) {
                itemEnEstado.notes = event.target.value;
            }
        }
    });

    contenedorCarrito.addEventListener('click', (event) => {
        const objetivo = event.target;
        if (!objetivo.classList.contains('cart-action-btn')) return;
        
        const { dishId, action } = objetivo.dataset;
        if (action === 'increase') aumentarCantidad(dishId);
        if (action === 'decrease') disminuirCantidad(dishId);
        if (action === 'remove') quitarDelCarrito(dishId);
    });
}

/**
 * valida el formulario de entrega segun las reglas del negocio
 * @returns {boolean} true si es válido false si no
 */
function validarFormularioPedido() {
    const selectorEntrega = document.getElementById('delivery-type');
    const inputDetalleEntrega = document.getElementById('delivery-address');
    const idTipoEntrega = selectorEntrega.value;
    const valorDetalle = inputDetalleEntrega.value.trim();
    let mensajeError = '';

    inputDetalleEntrega.classList.remove('is-invalid');

    switch (idTipoEntrega) {
        case '1': if (valorDetalle === '') mensajeError = 'Por favor, ingresa una dirección para el delivery.'; break;
        case '2': if (valorDetalle === '') mensajeError = 'Por favor, ingresa un nombre para el retiro.'; break;
        case '3': if (valorDetalle === '') mensajeError = 'Por favor, ingresa el número de mesa.'; break;
    }

    if (mensajeError) {
        mostrarNot(mensajeError, 'error');
        inputDetalleEntrega.classList.add('is-invalid');
        return false;
    }
    return true;
}

/**
 * logica de envio de la orden
 */
function configurarEnvioDeOrden() {
    const botonRealizarPedido = document.getElementById('place-order-btn');
    if (!botonRealizarPedido) return;

    botonRealizarPedido.addEventListener('click', async () => {
        if (state.cart.length === 0) {
            mostrarNot('Tu comanda está vacía.', 'error');
            return;
        }

        if (!validarFormularioPedido()) return;
        
        botonRealizarPedido.disabled = true;
        botonRealizarPedido.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Creando...`;

        const idTipoEntrega = parseInt(document.getElementById('delivery-type').value, 10);
        const detalleEntrega = document.getElementById('delivery-address').value;
        const notasGenerales = document.getElementById('order-notes').value;

        // backend espera un string vacío para el campo 'to' si no es delivery
        const datosEntrega = {
            id: idTipoEntrega,
            to: idTipoEntrega === 1 ? detalleEntrega : (detalleEntrega || "") 
        };

        const pedidoAEnviar = {
            items: state.cart.map(item => ({ id: item.id, quantity: item.quantity, notes: item.notes || '' })),
            delivery: datosEntrega,
            notes: notasGenerales
        };
        
        const resultado = await createOrder(pedidoAEnviar);

        botonRealizarPedido.disabled = false;
        botonRealizarPedido.textContent = 'Realizar Pedido';

        if (resultado.error) {
            mostrarNot(`Error al crear la orden: ${resultado.error}`, 'error');
        } else {
            mostrarNot(`¡Orden #${resultado.orderNumber} creada con éxito!`);
            
            // se guarda el número de la nueva orden para verla en "mis pedidos"
            const ordenesGuardadas = JSON.parse(localStorage.getItem('myOrders')) || [];
            ordenesGuardadas.push(resultado.orderNumber);
            localStorage.setItem('myOrders', JSON.stringify(ordenesGuardadas));
            
            // Limpiamos todo.
            state.cart = [];
            renderCart(state.cart);
            document.getElementById('delivery-address').value = '';
            document.getElementById('order-notes').value = '';
        }
    });
}

/**
 * controla la ui del formulario de entrega (cambia etiquetas y placeholders)
 */
function configurarManejadorTipoEntrega() {
    const selectorEntrega = document.getElementById('delivery-type');
    const contenedorDetalle = document.getElementById('address-input-container'); 
    const etiquetaDetalle = contenedorDetalle.querySelector('label');
    const inputDetalle = document.getElementById('delivery-address');

    if (!selectorEntrega || !contenedorDetalle || !etiquetaDetalle || !inputDetalle) return;

    const actualizarInterfazEntrega = () => {
        const idSeleccionado = selectorEntrega.value;
        contenedorDetalle.classList.remove('d-none');
        inputDetalle.value = '';
        inputDetalle.classList.remove('is-invalid');

        switch (idSeleccionado) {
            case '1':
                etiquetaDetalle.textContent = 'Dirección';
                inputDetalle.placeholder = 'Ingresa la dirección de entrega';
                break;
            case '2':
                etiquetaDetalle.textContent = 'Nombre';
                inputDetalle.placeholder = 'Ingresa el nombre para el retiro';
                break;
            case '3':
                etiquetaDetalle.textContent = 'N° de Mesa';
                inputDetalle.placeholder = 'Ingresa el número de mesa';
                break;
            default:
                contenedorDetalle.classList.add('d-none');
        }
    };

    selectorEntrega.addEventListener('change', actualizarInterfazEntrega);
    actualizarInterfazEntrega(); // llamada inicial para que se vea bien al cargar
}

/**
 * entrada principal para toda la logica del carrito y la comanda.
 */
export function initCartHandlers() {
    configurarEventosDelCarrito();
    configurarEnvioDeOrden();
    configurarManejadorTipoEntrega();
}