import { state } from '../../state.js';
import { getDishes } from '../../APIs/DishApi.js';
import { renderDishes } from '../../Components/renderDishes.js';

/**
 * agarra los filtros actuales del state pide los platos a la api y los vuelve a mostrar
 * (lo cree para no repetir codigo)
 */
async function aplicarFiltrosYRenderear() {
    // le pasamos el objeto completo de filtros a la api
    const platosFiltrados = await getDishes(state.currentFilter);
    renderDishes(platosFiltrados);
}

/**
 * punto de entrada para configurar todos los manejadores de eventos de los filtros
 */
export function initFilters() {
    const contenedorCategorias = document.getElementById('filters-container');
    const inputBusqueda = document.getElementById('search-input');
    const selectOrdenarPrecio = document.getElementById('sort-by-price');

    // ===== NUEVO SELECTOR =====
    const switchInactivos = document.getElementById('show-inactive-toggle');
    
    // variable para no sobrecargar la api con búsquedas
    let retrasoBusqueda;

    contenedorCategorias.addEventListener('click', async (event) => {
        if (event.target.tagName !== 'BUTTON') return;
        
        const categoriaId = event.target.dataset.categoryId;
        state.currentFilter.category = categoriaId;
        
        // quitamos la clase active del botón anterior y la ponemos en el nuevo
        const botonActivo = contenedorCategorias.querySelector('.active');
        if (botonActivo) {
            botonActivo.classList.remove('active');
        }
        event.target.classList.add('active');
        
        await aplicarFiltrosYRenderear();
    });

    // listener para la barra de búsqueda por nombre.
    inputBusqueda.addEventListener('input', (event) => {
        // ejemplo de debounce- esperamos 300ms despues de que el usuario deja de teclear
        // antes de lanzar la busqueda. asi evitamos hacer una llamada a la api por cada letra
        clearTimeout(retrasoBusqueda);
        retrasoBusqueda = setTimeout(async () => {
            state.currentFilter.name = event.target.value;
            await aplicarFiltrosYRenderear();
        }, 300);
    });

    // listener el selector de ordenamiento por precio.
    selectOrdenarPrecio.addEventListener('change', async (event) => {
        const valorSeleccionado = event.target.value;
        state.currentFilter.sortByPrice = valorSeleccionado || null;
        await aplicarFiltrosYRenderear();
    });
    // ===== NUEVO LISTENER AÑADIDO =====
    // listener para el switch de ver inactivos
    switchInactivos.addEventListener('change', async (event) => {
        // Si está 'checked' (marcado), queremos ver TODOS (onlyActive = false)
        // Si está 'unchecked' (desmarcado), queremos ver SOLO ACTIVOS (onlyActive = true)
        state.currentFilter.onlyActive = !event.target.checked;
        
        // Llamamos a la función que actualiza la vista
        await aplicarFiltrosYRenderear();
    });
}