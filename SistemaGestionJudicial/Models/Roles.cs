using System;
using System.Collections.Generic;

namespace SistemaGestionJudicial.Models;

public partial class Roles
{
    public long IdRol { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Persona> Personas { get; set; } = new List<Persona>();
}
