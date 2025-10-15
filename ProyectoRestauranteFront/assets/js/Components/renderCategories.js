
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
/**
 * Rellena el selector de categorías en el formulario de creación de platos.
 * @param {Array} categories - El array de categorías.
 */
export function renderCategoryOptions(categories) {
    const select = document.getElementById('dish-category');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Selecciona una categoría</option>'; // Opción por defecto
    select.innerHTML += categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}