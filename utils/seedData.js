import database from '../.config/database.js';
import { ingredientesSchema, pizzasSchema, clientesSchema, repartidoresSchema, pedidosSchema } from './schemasValidation.js';

const coleccionesConEsquema = {
    ingredientes: ingredientesSchema,
    pizzas: pizzasSchema,
    clientes: clientesSchema,
    repartidores: repartidoresSchema,
    pedidos: pedidosSchema
};

async function aplicarValidaciones(db) {
    console.log('Aplicando validaciones de esquema...');
    for (const [nombreColeccion, esquema] of Object.entries(coleccionesConEsquema)) {
        try {
            await db.createCollection(nombreColeccion, { validator: esquema });
            console.log(`Colección '${nombreColeccion}' creada con validación.`);
        } catch (error) {
            if (error.code === 48) {
                await db.command({
                    collMod: nombreColeccion,
                    validator: esquema
                });
                console.log(`Validación aplicada a la colección existente '${nombreColeccion}'.`);
            } else {
                console.error(`Error al aplicar validación a '${nombreColeccion}':`, error);
            }
        }
    }
}

async function seedDatabase() {
    let db;
    try {
        db = await database.realizarConexion();
        console.log("Conectado a MongoDB para poblar la base de datos.");

        await aplicarValidaciones(db);

        console.log('Limpiando colecciones existentes...');
        const ingredientesCollection = db.collection('ingredientes');
        const pizzasCollection = db.collection('pizzas');
        const clientesCollection = db.collection('clientes');
        const repartidoresCollection = db.collection('repartidores');
        const pedidosCollection = db.collection('pedidos');

        await ingredientesCollection.deleteMany({});
        await pizzasCollection.deleteMany({});
        await clientesCollection.deleteMany({});
        await repartidoresCollection.deleteMany({});
        await pedidosCollection.deleteMany({});

        console.log('Insertando datos de ejemplo...');

        const ingredientesResult = await ingredientesCollection.insertMany([
            { nombre: 'Queso Mozzarella', tipo: 'queso', stock: 100 },
            { nombre: 'Salsa de Tomate', tipo: 'salsa', stock: 100 },
            { nombre: 'Pepperoni', tipo: 'topping', stock: 80 },
            { nombre: 'Champiñones', tipo: 'topping', stock: 60 },
            { nombre: 'Piña', tipo: 'topping', stock: 50 },
            { nombre: 'Masa Tradicional', tipo: 'masa', stock: 100 },
            { nombre: 'Queso Vegano', tipo: 'queso', stock: 40 },
        ]);
        console.log('-> Ingredientes insertados.');

        const ingIds = ingredientesResult.insertedIds;
        await pizzasCollection.insertMany([
            { 
                nombre: 'Pizza de Pepperoni', 
                categoria: 'tradicional', 
                precio: 12500.0, 
                ingredientes: [ingIds[0], ingIds[1], ingIds[2], ingIds[5]] 
            },
            { 
                nombre: 'Pizza Hawaiana', 
                categoria: 'tradicional', 
                precio: 13000.0, 
                ingredientes: [ingIds[0], ingIds[1], ingIds[4], ingIds[5]] 
            },
            { 
                nombre: 'Pizza de Champiñones', 
                categoria: 'especial', 
                precio: 11000.0, 
                ingredientes: [ingIds[0], ingIds[1], ingIds[3], ingIds[5]] 
            },
            {
                nombre: 'Pizza Vegana',
                categoria: 'vegana',
                precio: 15000.0,
                ingredientes: [ingIds[6], ingIds[1], ingIds[3], ingIds[5]]
            }
        ]);
        console.log('-> Pizzas insertadas.');

        await clientesCollection.insertMany([
            { nombre: 'Ana Gómez', telefono: '3111234567', direccion: 'Calle Falsa 123' },
            { nombre: 'Luis Pérez', telefono: '3229876543', direccion: 'Avenida Siempre Viva 742' },
            { nombre: 'Jose Armando Casas', telefono: '3006489124', direccion: 'Calle Jeando 123' },
            { nombre: 'Marck Zuckerberg', telefono: '3184720154', direccion: 'Vereda los Malandros' }
        ]);
        console.log('-> Clientes insertados.');

        await repartidoresCollection.insertMany([
            { nombre: 'Carlos Pibe Valderrama', zona: 'Norte', estado: 'disponible' },
            { nombre: 'Pedro Picapiedra', zona: 'Sur', estado: 'disponible' },
            { nombre: 'Yeirkleison Paniagua', zona: 'Occidente', estado: 'disponible' },
            { nombre: 'Rappi José', zona: 'Sur', estado: 'disponible' }
        ]);
        console.log('-> Repartidores insertados.');

        console.log('\nBase de datos configurada y poblada exitosamente.');

    } catch (error) {
        console.error("Error en el script de siembra:", error);
    } finally {
        if (db) {
            await database.desconectar();
        }
    }
}

seedDatabase();