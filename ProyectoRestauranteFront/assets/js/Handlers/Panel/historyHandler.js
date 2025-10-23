import { getOrders, getOrderById } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * carga ordenes desde la api solo con filtro de fecha y despues
 * aplica los filtros de busqueda y estado
 */
async function cargarHistorial(filtrosAPI = {}) {
    const contenedor = document.getElementById('history-orders-container');
    contenedor.innerHTML = `<p class="text-center">Cargando historial...</p>`;

    //llamar a la api
    const todasLasOrdenes = await getOrders(filtrosAPI);
    
    // filtrar primero por estados
    let ordenesBaseHistorial = todasLasOrdenes.filter(
        orden => orden.status.id === 4 || orden.status.id === 5
    );

    //leer filtros del dom
    const searchText = document.getElementById('history-search-input').value.trim();
    const statusId = document.getElementById('history-status-filter').value;

    //filtros adicionales
    let ordenesFiltradas = ordenesBaseHistorial;

    //filtro busqueda
    if (searchText) {
        ordenesFiltradas = ordenesFiltradas.filter(orden =>
            orden.orderNumber.toString().includes(searchText)
        );
    }

    //filtroestado
    if (statusId !== 'all') {
        // solo 4 y 5 status
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
            orden.status.id == statusId
        );
    }
    renderOrders(ordenesFiltradas, 'history-orders-container', 'No se encontraron órdenes que coincidan con los filtros.', false);
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
    const searchInput = document.getElementById('history-search-input');
    const statusFilter = document.getElementById('history-status-filter');
    
    //funcion de filtrar
    const ejecutarFiltro = () => {
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
    };

    // --- Asignar listeners a TODOS los filtros ---
    botonFiltrar.addEventListener('click', ejecutarFiltro);
    searchInput.addEventListener('input', ejecutarFiltro); // se filtra al escribir
    statusFilter.addEventListener('change', ejecutarFiltro); // se filtra al cambiar
    document.getElementById('date-from').addEventListener('change', ejecutarFiltro);
    document.getElementById('date-to').addEventListener('change', ejecutarFiltro);


    cargarHistorial(); // carga sin filtro
    activarModalDetalles(); // logica de detalles
}