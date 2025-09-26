using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Request
{
    public class DishUpdateRequest
    {
        [Required(ErrorMessage = "El nombre del plato es requerido.")]
        [StringLength(255, ErrorMessage = "El nombre no puede tener más de 255 caracteres.")]
        public string Name { get; set; }

        public string? Description { get; set; }
        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a cero.")]
        [DefaultValue(0)]
        [Required(ErrorMessage = "El precio es obligatorio")]
        public decimal Price { get; set; }
        [Required(ErrorMessage = "La categoría es obligatoria.")]
        [DefaultValue(0)]
        [Range(1, int.MaxValue, ErrorMessage = "No se ingresó una categoría válida.")]
        public int Category { get; set; }

        public string? Image { get; set; }
        [Required(ErrorMessage = "Debe especificar si el plato está activo o no.")]
        public bool IsActive { get; set; } 
    }
}

