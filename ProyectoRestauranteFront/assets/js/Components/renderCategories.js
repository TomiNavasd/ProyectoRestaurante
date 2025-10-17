/**
 * los botones de las categorías en la página del menu
 * @param {Array} categorias lista de categorías que viene de la API.
 */
export function renderCategories(categorias) {
    const contenedor = document.getElementById('filters-container');
    if (!contenedor) return;

    // mapeo
    const htmlDeLosBotones = categorias.map(categoria => 
        `<button class="btn btn-outline-secondary me-2" data-category-id="${categoria.id}">${categoria.name}</button>`
    ).join('');

    // html final
    contenedor.innerHTML = `<button class="btn btn-secondary me-2 active" data-category-id="">Todos</button>` + htmlDeLosBotones;
}

/**
 * rellena en los formularios de categorías para crear o editar platos
 * @param {Array} categorias lista de categorías
 */
export function renderCategoryOptions(categorias) {
    const selector = document.getElementById('dish-category');
    if (!selector) return;

    // pongo una primera opción deshabilitada
    let opcionesHtml = '<option value="" disabled selected>Selecciona una categoría</option>';
    
    opcionesHtml += categorias.map(categoria => 
        `<option value="${categoria.id}">${categoria.name}</option>`
    ).join('');

    selector.innerHTML = opcionesHtml;
}