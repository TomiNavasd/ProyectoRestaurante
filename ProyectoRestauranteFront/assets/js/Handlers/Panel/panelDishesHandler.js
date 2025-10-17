import { state } from '../../state.js';
import { createDish, getDishes, updateDish, deleteDish } from '../../APIs/DishApi.js';
import { getCategories } from '../../APIs/CategoryApi.js';
import { renderCategoryOptions } from '../../Components/renderCategories.js';
import { renderAdminDishes } from '../../Components/renderAdminDishes.js';
import { mostrarNot } from '../../notification.js';

// actualiza vista de gestion con todos los platos de la base de datos
async function refrescarPanelDePlatos() {
    // pedimos todos los platos incluyendo los inactivos porque desde aca los podemos gestionar
    const todosLosPlatos = await getDishes({ onlyActive: false }); 
    state.dishes = todosLosPlatos;
    renderAdminDishes(state.dishes);
}

// carga los datos de un plato existente en el formulario de edicion
function rellenarFormularioEdicion(plato) {
    document.getElementById('edit-dish-id').value = plato.id;
    document.getElementById('edit-dish-name').value = plato.name;
    document.getElementById('edit-dish-description').value = plato.description;
    document.getElementById('edit-dish-price').value = plato.price;
    document.getElementById('edit-dish-category').value = plato.category.id;
    document.getElementById('edit-dish-image').value = plato.image;
    document.getElementById('edit-dish-active').checked = plato.isActive;
}

// logica para el formulario de crear un plato nuevo
function iniciarFormularioCrear() {
    const form = document.getElementById('create-dish-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const datosDelPlato = {
            name: document.getElementById('dish-name').value,
            description: document.getElementById('dish-description').value,
            price: parseFloat(document.getElementById('dish-price').value),
            category: parseInt(document.getElementById('dish-category').value),
            image: document.getElementById('dish-image').value
        };
        const resultado = await createDish(datosDelPlato);

        if (resultado.error) {
            mostrarNot(`Error al crear el plato: ${resultado.error}`);
        } else {
            mostrarNot(`¡Plato "${resultado.name}" creado con éxito!`);
            // limpiamos y cerramos el modal si todo salio bien
            form.reset();
            const modalElement = document.getElementById('create-dish-modal');
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            bootstrapModal.hide();
            await refrescarPanelDePlatos();
        }
    });
}

// logica para el formulario de edityar un plato existente
function iniciarFormularioEditar() {
    const form = document.getElementById('edit-dish-form');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dishId = document.getElementById('edit-dish-id').value;
        const datosActualizados = {
            name: document.getElementById('edit-dish-name').value,
            description: document.getElementById('edit-dish-description').value,
            price: parseFloat(document.getElementById('edit-dish-price').value),
            category: parseInt(document.getElementById('edit-dish-category').value),
            image: document.getElementById('edit-dish-image').value,
            isActive: document.getElementById('edit-dish-active').checked
        };

        const resultado = await updateDish(dishId, datosActualizados);

        if (resultado.error) {
            mostrarNot(`Error al actualizar el plato: ${resultado.error}`);
        } else {
            mostrarNot(`Plato "${resultado.name}" actualizado con éxito.`);
            const modalElement = document.getElementById('edit-dish-modal');
            const bootstrapModal = bootstrap.Modal.getInstance(modalElement);
            bootstrapModal.hide();
            await refrescarPanelDePlatos();
        }
    });
}

// activa botones de lista de platos Editar y Activar/Desactivar
function iniciarGestionMenu() {
    const listaPlatos = document.getElementById('panel-dish-list');
    if (!listaPlatos) return;

    listaPlatos.addEventListener('click', async (event) => {
        const botonEditar = event.target.closest('.edit-dish-btn');
        if (botonEditar) {
            const dishId = botonEditar.dataset.dishId;
            const platoAEditar = state.dishes.find(d => d.id === dishId);
            if (platoAEditar) {
                rellenarFormularioEdicion(platoAEditar);
            }
        }

        const botonEstado = event.target.closest('.status-toggle-btn');
        if (botonEstado) {
            const dishId = botonEstado.dataset.dishId;
            const accion = botonEstado.dataset.action;
            const plato = state.dishes.find(d => d.id === dishId);
            if (!plato) return;

            const esDesactivar = accion === 'deactivate';
            const mensajeConfirmacion = `¿Estás seguro de que quieres ${esDesactivar ? 'DESACTIVAR' : 'ACTIVAR'} "${plato.name}"?`;
            
            if (confirm(mensajeConfirmacion)) {
                let resultado;
                if (esDesactivar) {
                    // softdelete se hace a traves de la api
                    resultado = await deleteDish(dishId);
                } else {
                    const datosParaActivar = {
                        name: plato.name,
                        description: plato.description,
                        price: plato.price,
                        category: plato.category.id,
                        image: plato.image,
                        isActive: true
                    };
                    resultado = await updateDish(dishId, datosParaActivar);
                }

                if (resultado.error) {
                    mostrarNot(`Error: ${resultado.error}`);
                } else {
                    await refrescarPanelDePlatos();
                }
            }
        }
    });
}

// exporta inicializar la pagina de gestion
export async function initDishAdminHandlers() {
    await refrescarPanelDePlatos();

    const categories = await getCategories();
    renderCategoryOptions(categories);
    // para no tener que llamar a la api de categorias otra vez
    // copiamos las opciones del primer select al segundo
    document.getElementById('edit-dish-category').innerHTML = document.getElementById('dish-category').innerHTML;

    iniciarFormularioCrear();
    iniciarFormularioEditar();
    iniciarGestionMenu();
}