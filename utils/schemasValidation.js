export const ingredientesSchema = {
    $jsonSchema: {
        bsonType: "object",
        title: "Esquema de Ingrediente",
        required: ["nombre", "tipo", "stock"],
        properties: {
            nombre: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            },
            tipo: {
                bsonType: "string",
                enum: ["queso", "salsa", "topping", "masa"],
                description: "debe ser una cadena de la lista de valores permitidos y es obligatorio"
            },
            stock: {
                bsonType: "int",
                minimum: 0,
                description: "debe ser un entero mayor o igual a 0 y es obligatorio"
            }
        }
    }
};

export const pizzasSchema = {
    $jsonSchema: {
        bsonType: "object",
        title: "Esquema de Pizza",
        required: ["nombre", "categoria", "precio", "ingredientes"],
        properties: {
            nombre: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            },
            categoria: {
                bsonType: "string",
                enum: ["tradicional", "especial", "vegana"],
                description: "debe ser una cadena de la lista de valores permitidos y es obligatorio"
            },
            precio: {
                bsonType: ["double", "int"],
                minimum: 0,
                description: "debe ser un número de punto flotante y es obligatorio"
            },
            ingredientes: {
                bsonType: "array",
                description: "debe ser un array de ObjectIds de ingredientes y es obligatorio",
                items: {
                    bsonType: "objectId",
                    description: "debe ser un ObjectId que referencia a un ingrediente"
                }
            }
        }
    }
};

export const clientesSchema = {
    $jsonSchema: {
        bsonType: "object",
        title: "Esquema de Cliente",
        required: ["nombre", "telefono", "direccion"],
        properties: {
            nombre: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            },
            telefono: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            },
            direccion: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            }
        }
    }
};

export const repartidoresSchema = {
    $jsonSchema: {
        bsonType: "object",
        title: "Esquema de Repartidor",
        required: ["nombre", "zona", "estado"],
        properties: {
            nombre: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            },
            zona: {
                bsonType: "string",
                description: "debe ser una cadena y es obligatorio"
            },
            estado: {
                bsonType: "string",
                enum: ["disponible", "ocupado"],
                description: "debe ser 'disponible' u 'ocupado' y es obligatorio"
            }
        }
    }
};

export const pedidosSchema = {
    $jsonSchema: {
        bsonType: "object",
        title: "Esquema de Pedido",
        required: ["clienteId", "pizzas", "total", "fecha", "repartidorAsignadoId", "estado"],
        properties: {
            clienteId: {
                bsonType: "objectId",
                description: "debe ser un ObjectId de la colección clientes y es obligatorio"
            },
            pizzas: {
                bsonType: "array",
                description: "debe ser un array de objetos de pizza y es obligatorio",
                items: {
                    bsonType: "object",
                    required: ["pizzaId", "cantidad"],
                    properties: {
                        pizzaId: {
                            bsonType: "objectId",
                            description: "debe ser un ObjectId de la colección pizzas"
                        },
                        cantidad: {
                            bsonType: "int",
                            minimum: 1,
                            description: "debe ser un entero de al menos 1"
                        }
                    }
                }
            },
            total: {
                bsonType: ["double", "int"],
                minimum: 0,
                description: "debe ser un número de punto flotante y es obligatorio"
            },
            fecha: {
                bsonType: "date",
                description: "debe ser una fecha y es obligatorio"
            },
            repartidorAsignadoId: {
                bsonType: "objectId",
                description: "debe ser un ObjectId de la colección repartidores y es obligatorio"
            },
            estado: {
                bsonType: "string",
                enum: ["en_proceso", "completado", "cancelado"],
                description: "debe ser 'en_proceso', 'completado' o 'cancelado'"
            }
        }
    }
};