import { MongoClient } from 'mongodb';
import { client, dbName } from '../db/connection.js';

async function seedDatabase() {
    try {
        await client.connect();
        console.log("Conectado a MongoDB para poblar la base de datos.");
        const db = client.db(dbName);

        await db.collection('ingredientes').deleteMany({});
        await db.collection('pizzas').deleteMany({});
        await db.collection('clientes').deleteMany({});
        await db.collection('repartidores').deleteMany({});

        // se insertan los ingredientes
        const ingredientes = await db.collection('ingredientes').insertMany([
            { nombre: 'Queso Mozzarella', tipo: 'queso', stock: 100 },
            { nombre: 'Salsa de Tomate', tipo: 'salsa', stock: 100 },
            { nombre: 'Pepperoni', tipo: 'topping', stock: 80 },
            { nombre: 'Champiñones', tipo: 'topping', stock: 60 },
            { nombre: 'Piña', tipo: 'topping', stock: 50 },
            { nombre: 'Masa Tradicional', tipo: 'masa', stock: 100 },
            { nombre: 'Queso Vegano', tipo: 'queso', stock: 40 },
        ]);
        console.log('Ingredientes insertados.');

        // se insertan las pipzas
        const ing = ingredientes.insertedIds;
        await db.collection('pizzas').insertMany([
            { 
                nombre: 'Pizza de Pepperoni', 
                categoria: 'tradicional', 
                precio: 12500.0, 
                ingredientes: [ing[0], ing[1], ing[2], ing[5]] 
            },
            { 
                nombre: 'Pizza Hawaiana', 
                categoria: 'tradicional', 
                precio: 13000.0, 
                ingredientes: [ing[0], ing[1], ing[4], ing[5]] 
            },
            { 
                nombre: 'Pizza de Champiñones', 
                categoria: 'especial', 
                precio: 11000.0, 
                ingredientes: [ing[0], ing[1], ing[3], ing[5]] 
            },
            {
                nombre: 'Pizza Vegana',
                categoria: 'vegana',
                precio: 15000.0,
                ingredientes: [ing[6], ing[1], ing[3], ing[5]]
            }
        ]);
        console.log('Pizzas insertadas.');

        // se insertan los clientes pizzeros
        await db.collection('clientes').insertMany([
            { nombre: 'Pancrasio Alberto', telefono: '3111234567', direccion: 'Calle Falsa 123' },
            { nombre: 'Jose Armando Casas', telefono: '3229876543', direccion: 'Avenida Siempre Viva 742' },
            { nombre: 'Ortencio PRO', telefono: '3004729811',
            direccion: 'Aguasmalas Calle 66' },
            { nombre: 'Marck Zuckerberg', telefono: '3183741265',
            direccion: 'Vereda el Bazuco' }
        ]);
        console.log('Clientes insertados.');

        // se insertan repartidores pizzeros
        await db.collection('repartidores').insertMany([
            { nombre: 'Carlos Pibe Valderrama', zona: 'Norte', estado: 'disponible' },
            { nombre: 'Yerkleison Paniagua', zona: 'Sur', estado: 'disponible' },
            { nombre: 'Oscaryimerth Garcia', zona: 'Occidente', estado: 'disponible' },
            { nombre: 'Veneco 4', zona: 'Norte', estado: 'disponible' }
        ]);
        console.log('Repartidores insertados.');

    } catch (error) {
        console.error("Error al poblar la base de datos:", error);
    } finally {
        await client.close();
        console.log("Conexión cerrada.");
    }
}

seedDatabase();