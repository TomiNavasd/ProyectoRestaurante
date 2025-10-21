import { getDishes } from '../../APIs/DishApi.js';
import { getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { renderDishesToModal } from '../../Components/renderAddDishesModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * carga las ordenes desde localStorage las pide a la api y se clasifican en curso y en historial
 */
async function cargarYClasificarPedidos() {
    // ===== 1. LEER VALORES DE LOS FILTROS =====
    const searchText = document.getElementById('order-search-input').value.trim();
    const statusId = document.getElementById('order-status-filter').value;

    const ordenesGuardadas = JSON.parse(localStorage.getItem('myOrders')) || [];
    if (ordenesGuardadas.length === 0) {
        renderOrders([], 'active-orders-container', 'No tienes pedidos en curso.');
        renderOrders([], 'history-orders-container', 'No tienes pedidos en tu historial.');
        return;
    }

    // (Tu lógica de fetch se mantiene intacta)
    const promesasDeOrdenes = ordenesGuardadas.map(id => getOrderById(id));
    const resultados = await Promise.allSettled(promesasDeOrdenes);
    
    const ordenesValidas = resultados
        .filter(resultado => resultado.status === 'fulfilled' && resultado.value !== null)
        .map(resultado => resultado.value);

    // ===== 2. APLICAR FILTROS ANTES DE RENDERIZAR =====
    let ordenesFiltradas = ordenesValidas;

    // Filtro de Búsqueda por N° de Orden
    if (searchText) {
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
            orden.orderNumber.toString().includes(searchText)
        );
    }

    // Filtro de Estado
    if (statusId !== 'all') {
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
            orden.status.id == statusId // '==' compara string con número
        );
    }
    
    // (Tu lógica de clasificación ahora usa la lista filtrada)
    const ordenesActivas = ordenesFiltradas.filter(orden => orden.status.id < 4);
    const ordenesHistorial = ordenesFiltradas.filter(orden => orden.status.id >= 4);
    
    const mensajeVacio = 'No hay pedidos que coincidan con tu búsqueda.';
    renderOrders(ordenesActivas, 'active-orders-container', mensajeVacio);
    renderOrders(ordenesHistorial, 'history-orders-container', mensajeVacio);
}

/**
 * configura todos los eventos de los detalles y la modificacion de una orden
 */
function configurarDetallesDeOrden() {
    const contenedorPrincipal = document.querySelector('main');
    const modalDetalles = document.getElementById('order-details-modal');
    const modalAgregarPlatos = document.getElementById('add-dishes-modal');
    
    if (!contenedorPrincipal || !modalDetalles || !modalAgregarPlatos) return;

    const instanciaModalDetalles = new bootstrap.Modal(modalDetalles);
    const instanciaModalAgregarPlatos = new bootstrap.Modal(modalAgregarPlatos);
    
    // variable de fuente de verdad mientras editamos una orden
    let ordenEnEdicion = null;

    contenedorPrincipal.addEventListener('click', async (event) => {
        const botonVerDetalle = event.target.closest('.view-details-btn');
        if (!botonVerDetalle) return;
        
        const ordenId = botonVerDetalle.dataset.orderId;
        const detallesDeLaOrden = await getOrderById(ordenId);

        if (!detallesDeLaOrden) {
            mostrarNot("No se pudieron cargar los detalles de la orden.", 'error');
            return;
        }
        // se crea una copia profunda para poder modificarla sin afectar otros datos
        ordenEnEdicion = JSON.parse(JSON.stringify(detallesDeLaOrden));
        
        // Renderizar con la copia (ordenEnEdicion)
        renderOrderModal(ordenEnEdicion);
        
        instanciaModalDetalles.show();
    });
    
    // la logica para el flujo entre modales es Detalles->Agregar platos->Volver a detalles
    modalAgregarPlatos.addEventListener('show.bs.modal', async () => {
        const idsDeItemsActuales = new Set(ordenEnEdicion.items.map(item => item.dish.id));
        const todosLosPlatos = await getDishes();
        renderDishesToModal(todosLosPlatos, idsDeItemsActuales);
    });

    modalAgregarPlatos.addEventListener('click', (event) => {
        const botonAgregar = event.target.closest('.add-dish-to-order-btn');
        if (botonAgregar && !botonAgregar.disabled) {
            const { dishId, dishName } = botonAgregar.dataset;
            const itemExistente = ordenEnEdicion.items.find(item => item.dish.id === dishId);
            if (itemExistente) {
                // Si está marcado para borrar (cant 0) y lo vuelve a agregar
                if (itemExistente.quantity === 0) {
                    itemExistente.quantity = 1; 
                } else {
                    itemExistente.quantity++;
                }
            } else {
                // Añadir 'status' por defecto
                ordenEnEdicion.items.push({ 
                    dish: { id: dishId, name: dishName }, 
                    quantity: 1, 
                    notes: '',
                    status: { id: 1, name: 'Pending' } 
                });
            }
            botonAgregar.disabled = true;
            botonAgregar.textContent = 'Agregado';
        }

    });

    // Flujo de modales (hide.bs.modal y sin .show())
    modalAgregarPlatos.addEventListener('hide.bs.modal', () => {
        // se cierra el modal de agregar volvemos a renderizar el de detalles con la info actualizada
        renderOrderModal(ordenEnEdicion);
    });
    
    // Listener para todas las acciones DENTRO del modal de detalles
    modalDetalles.addEventListener('click', async (event) => {
        const objetivo = event.target;

        // ===== INICIO: CAMBIO #1 (Lógica Botón Cantidad) =====
        if (objetivo.classList.contains('modal-quantity-btn')) {
            const elementoLista = objetivo.closest('li');
            const platoId = elementoLista.dataset.itemId;
            const itemEnEstado = ordenEnEdicion.items.find(item => item.dish.id === platoId);
            if (!itemEnEstado) return;

            const accion = objetivo.dataset.action;
            if (accion === 'increase') {
                itemEnEstado.quantity++;
            } else if (accion === 'decrease' && itemEnEstado.quantity > 0) { // No deja bajar de 0
                itemEnEstado.quantity--;
            }
            
            // Actualizar el DOM en lugar de borrar
            elementoLista.dataset.quantity = itemEnEstado.quantity;
            elementoLista.querySelector('.item-quantity').textContent = itemEnEstado.quantity;
            
            const spanNombre = elementoLista.querySelector('.d-flex span'); // Selector del nombre

            if (itemEnEstado.quantity === 0) {
                // Aplicar estilo de borrado
                elementoLista.classList.add('item-marked-for-deletion');
                if (spanNombre) spanNombre.classList.add('text-decoration-line-through');
            } else {
                // Quitar estilo de borrado (si el usuario se arrepiente y presiona '+')
                elementoLista.classList.remove('item-marked-for-deletion');
                if (spanNombre) spanNombre.classList.remove('text-decoration-line-through');
            }
        }
        // ===== FIN: CAMBIO #1 =====
        
        // ===== INICIO: CAMBIO #2 (Lógica Botón Guardar) =====
        if (objetivo.id === 'save-changes-btn') {
            const botonGuardar = objetivo;
            const ordenId = botonGuardar.dataset.orderId;
            
            const datosParaActualizar = {
                // ¡YA NO FILTRAMOS! Enviamos todos los ítems (incluidos los de cant 0)
                items: ordenEnEdicion.items
                    .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }))
            };

            botonGuardar.disabled = true;
            botonGuardar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;
            const resultado = await updateOrder(ordenId, datosParaActualizar);
            botonGuardar.disabled = false;
            botonGuardar.innerHTML = 'Guardar Cambios';

            if (resultado.error) {
                mostrarNot(`Error al guardar: ${resultado.error}`, 'error');
            } else {
                mostrarNot(`Orden #${ordenId} actualizada con éxito.`);
                instanciaModalDetalles.hide();
                await cargarYClasificarPedidos(); // await para asegurar que se refresque bien
            }
        }
        // ===== FIN: CAMBIO #2 =====
    });

    // Lógica de 'input' de notas (sin cambios)
    modalDetalles.addEventListener('input', (event) => {
        if (event.target.classList.contains('modal-item-note')) {
            const input = event.target;
            const platoId = input.closest('li').dataset.itemId;
            const itemEnEstado = ordenEnEdicion.items.find(item => item.dish.id === platoId);
            if (itemEnEstado) {
                itemEnEstado.notes = input.value;
            }
        }
    });
}

/**
 * Añade los listeners a los inputs de filtro.
 * (Esta función no cambia)
 */
function configurarFiltros() {
    const searchInput = document.getElementById('order-search-input');
    const statusFilter = document.getElementById('order-status-filter');

    if (searchInput) {
        // 'input' se dispara con cada tecla
        searchInput.addEventListener('input', cargarYClasificarPedidos);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', cargarYClasificarPedidos);
    }
}

/**
 * punto de entrada para la pagina mis pedidos
 */
export function initOrdersPage() {
    cargarYClasificarPedidos();
    configurarDetallesDeOrden();
    configurarFiltros();
}