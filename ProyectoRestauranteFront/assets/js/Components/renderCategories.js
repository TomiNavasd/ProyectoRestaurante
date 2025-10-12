
/**
 * Dibuja los botones de filtro de categorías en el HTML.
 * @param {Array} categories - El array de categorías.
 */
export function renderCategories(categories) {
    const container = document.getElementById('filters-container');
    if (!container) return;

    const buttonsHtml = categories.map(cat => 
        `<button class="btn btn-outline-secondary me-2" data-category-id="${cat.id}">${cat.name}</button>`
    ).join('');

    container.innerHTML = `<button class="btn btn-secondary me-2 active" data-category-id="">Todos</button>` + buttonsHtml;
}