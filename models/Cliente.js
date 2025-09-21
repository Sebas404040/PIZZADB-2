export class Cliente {
    constructor({ _id, nombre, telefono, direccion }) {
        this._id = _id;
        this.nombre = nombre;
        this.telefono = telefono;
        this.direccion = direccion;
    }
}