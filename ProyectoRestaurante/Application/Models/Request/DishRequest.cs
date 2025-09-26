using Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Models.Request
{
    public class DishRequest
    {
        [Required(ErrorMessage = "El nombre del plato es requerido.")]
        [StringLength(255, ErrorMessage = "El nombre no puede tener más de 255 caracteres.")] 
        public string Name { get; set; }

        public string Description { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "El precio debe ser mayor a cero.")]
        [DefaultValue(0)]
        [Required(ErrorMessage = "El precio es obligatorio")]
        public decimal Price { get; set; }
        
        [Range(1, int.MaxValue, ErrorMessage = "Se debe especificar una categoría válida.")]
        [DefaultValue(0)]
        [Required(ErrorMessage = "La categoria es obligatorio")]
        public int Category { get; set; }

        public string? Image { get; set; }
    }
}