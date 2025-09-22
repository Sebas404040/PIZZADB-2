// Clase pizza
export class Pizza {
    constructor({ _id, nombre, categoria, precio, ingredientes }) {
        this._id = _id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
        this.ingredientes = ingredientes;
    }
}