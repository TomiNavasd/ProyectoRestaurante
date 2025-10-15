import { state } from '../../state.js';
import { getDishes } from '../../APIs/DishApi.js';
import { renderDishes } from '../../Components/renderDishes.js';

export function initFilters() {
    const filtersContainer = document.getElementById('filters-container');
    const searchInput = document.getElementById('search-input');
    let debounceTimeout;

    filtersContainer.addEventListener('click', async (event) => {
        if (event.target.tagName !== 'BUTTON') return;
        
        const categoryId = event.target.dataset.categoryId;
        state.currentFilter.category = categoryId;
        
        const currentActive = filtersContainer.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        event.target.classList.add('active');
        
        const activeDishes = await getDishes(state.currentFilter.name, state.currentFilter.category);
        renderDishes(activeDishes);
    });

    searchInput.addEventListener('input', (event) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            const searchText = event.target.value;
            state.currentFilter.name = searchText;
            const activeDishes = await getDishes(state.currentFilter.name, state.currentFilter.category);
            renderDishes(activeDishes);
        }, 300);
    });
}