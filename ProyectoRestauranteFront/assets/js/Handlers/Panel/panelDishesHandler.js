import { state } from '../../state.js';
import { createDish, getDishes, updateDish, deleteDish } from '../../APIs/DishApi.js';
import { getCategories } from '../../APIs/CategoryApi.js';
import { renderCategoryOptions } from '../../Components/renderCategories.js';
import { renderAdminDishes } from '../../Components/renderAdminDishes.js';
import { showNotification } from '../../notification.js';

async function refreshDishesPanel() {
    const dishes = await getDishes({ onlyActive: false }); 
    state.dishes = dishes;
    renderAdminDishes(state.dishes);
}

function populateEditForm(dish) {
    document.getElementById('edit-dish-id').value = dish.id;
    document.getElementById('edit-dish-name').value = dish.name;
    document.getElementById('edit-dish-description').value = dish.description;
    document.getElementById('edit-dish-price').value = dish.price;
    document.getElementById('edit-dish-category').value = dish.category.id;
    document.getElementById('edit-dish-image').value = dish.image;
    document.getElementById('edit-dish-active').checked = dish.isActive;
}

function initCreateDishForm() {
    // ... (Tu código para crear plato se mantiene exactamente igual) ...
    const form = document.getElementById('create-dish-form');
    if (!form) return;
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dishRequest = {
            name: document.getElementById('dish-name').value,
            description: document.getElementById('dish-description').value,
            price: parseFloat(document.getElementById('dish-price').value),
            category: parseInt(document.getElementById('dish-category').value),
            image: document.getElementById('dish-image').value
        };
        const result = await createDish(dishRequest);
        if (result.error) {
            showNotification(`Error al crear el plato: ${result.error}`);
        } else {
            showNotification(`¡Plato "${result.name}" creado con éxito!`);
            form.reset();
            const modalElement = document.getElementById('create-dish-modal');
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            bootstrapModal.hide();
            await refreshDishesPanel(); // Refrescamos la lista para ver el nuevo plato
        }
    });
}

// --- NUEVA FUNCIÓN PARA MANEJAR EL GUARDADO DE LA EDICIÓN ---
function initEditDishForm() {
    const form = document.getElementById('edit-dish-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const dishId = document.getElementById('edit-dish-id').value;

        // Recolectamos los datos actualizados del formulario de edición
        const dishUpdateRequest = {
            name: document.getElementById('edit-dish-name').value,
            description: document.getElementById('edit-dish-description').value,
            price: parseFloat(document.getElementById('edit-dish-price').value),
            category: parseInt(document.getElementById('edit-dish-category').value),
            image: document.getElementById('edit-dish-image').value,
            isActive: document.getElementById('edit-dish-active').checked
        };

        const result = await updateDish(dishId, dishUpdateRequest);

        if (result.error) {
            showNotification(`Error al actualizar el plato: ${result.error}`);
        } else {
            showNotification(`Plato "${result.name}" actualizado con éxito.`);
            const modalElement = document.getElementById('edit-dish-modal');
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            bootstrapModal.hide();
            await refreshDishesPanel(); // Refrescamos la lista de platos para ver los cambios
        }
    });
}

function initMenuManagement() {
    const dishListContainer = document.getElementById('panel-dish-list');
    if (!dishListContainer) return;

    dishListContainer.addEventListener('click', async (event) => {
        // Buscamos si el clic fue en un botón de editar o en uno de estado
        const editButton = event.target.closest('.edit-dish-btn');
        const statusButton = event.target.closest('.status-toggle-btn'); // <-- ESTA LÍNEA ES LA CLAVE

        // Lógica para el botón EDITAR
        if (editButton) {
            const dishId = editButton.dataset.dishId;
            const dishToEdit = state.dishes.find(d => d.id === dishId);
            if (dishToEdit) {
                populateEditForm(dishToEdit);
            }
        }

        // Lógica para el botón ACTIVAR/DESACTIVAR
        if (statusButton) { // <-- Ahora 'statusButton' sí está definido
            const dishId = statusButton.dataset.dishId;
            const action = statusButton.dataset.action;
            const dish = state.dishes.find(d => d.id === dishId);
            if (!dish) return;

            if (action === 'deactivate') {
                const confirmation = confirm(`¿Estás seguro de que quieres DESACTIVAR "${dish.name}"?`);
                if (confirmation) {
                    const result = await deleteDish(dishId);
                    if (result.error) {
                        showNotification(`Error: ${result.error}`);
                    } else {
                        await refreshDishesPanel();
                    }
                }
            } else if (action === 'activate') {
                const confirmation = confirm(`¿Estás seguro de que quieres ACTIVAR "${dish.name}"?`);
                if (confirmation) {
                    const updateRequest = {
                        name: dish.name,
                        description: dish.description,
                        price: dish.price,
                        category: dish.category.id,
                        image: dish.image,
                        isActive: true
                    };
                    const result = await updateDish(dishId, updateRequest);
                    if (result.error) {
                        showNotification(`Error: ${result.error}`);
                    } else {
                        await refreshDishesPanel();
                    }
                }
            }
        }
    });
}

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN (ACTUALIZADA) ---
export async function initDishAdminHandlers() {
    await refreshDishesPanel();

    const categories = await getCategories();
    renderCategoryOptions(categories);
    document.getElementById('edit-dish-category').innerHTML = document.getElementById('dish-category').innerHTML;

    initCreateDishForm();
    initEditDishForm();
    initMenuManagement();
}