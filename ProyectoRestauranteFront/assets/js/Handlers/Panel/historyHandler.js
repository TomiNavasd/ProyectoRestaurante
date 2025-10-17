import { getOrders, getOrderById } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * carga ordenes desde la api las filtra para el historial y las muestra en pantalla
 * @param {object} filtros filtro de fechas
 */
async function cargarHistorial(filtros = {}) {
    const contenedor = document.getElementById('history-orders-container');
    contenedor.innerHTML = `<p class="text-center">Cargando historial...</p>`;
    
    const todasLasOrdenes = await getOrders(filtros);
    
    // historial solo muestra ordenes que ya fueron entregadas ID 4
    const ordenesDelHistorial = todasLasOrdenes.filter(orden => orden.status.id >= 4);
    // reutilizamos el componente renderOrders pero le indicamos que no es editable
    renderOrders(ordenesDelHistorial, 'history-orders-container', 'No se encontraron órdenes para las fechas seleccionadas.', false);
}

/**
 * configura el evento para abrir el modal de ver detalle en cada orden
 */
function activarModalDetalles() {
    const contenedorPrincipal = document.querySelector('main');
    const elementoModal = document.getElementById('order-details-modal');
    if (!contenedorPrincipal || !elementoModal) return;

    const instanciaModal = new bootstrap.Modal(elementoModal);
    
    contenedorPrincipal.addEventListener('click', async (event) => {
        const botonVerDetalle = event.target.closest('.view-details-btn');
        if (!botonVerDetalle) return;
        
        const ordenId = botonVerDetalle.dataset.orderId;
        const detallesDeLaOrden = await getOrderById(ordenId);
        
        if (detallesDeLaOrden) {
            renderOrderModal(detallesDeLaOrden);
            // ocultamos el boton agregar plato
            const contenedorBotonAgregar = document.querySelector('#order-details-modal .d-grid');
            if(contenedorBotonAgregar) {
                contenedorBotonAgregar.style.display = 'none';
            }

            instanciaModal.show();
        } else {
            mostrarNot('No se pudieron cargar los detalles de la orden.', 'error');
        }
    });
}

/**
 * punto de entrada para inicializar toda la pagina de historial
 */
export function initHistoryPage() {
    const botonFiltrar = document.getElementById('filter-btn');
    
    botonFiltrar.addEventListener('click', () => {
        const fechaDesde = document.getElementById('date-from').value;
        const fechaHasta = document.getElementById('date-to').value;

        const filtros = {};
        // aseguro de que el filtro incluya el dia completo
        if (fechaDesde) {
            filtros.from = `${fechaDesde}T00:00:00`;
        }
        if (fechaHasta) {
            filtros.to = `${fechaHasta}T23:59:59`;
        }
        
        cargarHistorial(filtros);
    });

    cargarHistorial(); // carga sin filtro
    activarModalDetalles(); // logica de detalles
}