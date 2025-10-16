import { state } from '../../state.js';
import { getDishes } from '../../APIs/DishApi.js';
import { renderDishes } from '../../Components/renderDishes.js';


// Función helper para no repetir código
async function applyFiltersAndRender() {
    const activeDishes = await getDishes(state.currentFilter);
    renderDishes(activeDishes);
}

export function initFilters() {
    const filtersContainer = document.getElementById('filters-container');
    const searchInput = document.getElementById('search-input');
    const sortByPriceSelect = document.getElementById('sort-by-price'); // <-- NUEVO
    let debounceTimeout;

    // Listener para los botones de categoría
    filtersContainer.addEventListener('click', async (event) => {
        if (event.target.tagName !== 'BUTTON') return;
        
        const categoryId = event.target.dataset.categoryId;
        state.currentFilter.category = categoryId;
        
        const currentActive = filtersContainer.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        event.target.classList.add('active');
        
        await applyFiltersAndRender();
    });

    // Listener para la barra de búsqueda
    searchInput.addEventListener('input', (event) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            state.currentFilter.name = event.target.value;
            await applyFiltersAndRender();
        }, 300);
    });

    // --- NUEVO: Listener para el dropdown de ordenamiento ---
    sortByPriceSelect.addEventListener('change', async (event) => {
        const sortValue = event.target.value;
        state.currentFilter.sortByPrice = sortValue || null; // Si el valor es "", lo guardamos como null
        await applyFiltersAndRender();
    });
}