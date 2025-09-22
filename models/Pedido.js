// Importaciones
import { ObjectId } from 'mongodb';
import database from '../.config/database.js';

// clase Pedido
export class Pedido {

    // construcción de atributos
    constructor(cliente, pizzasSeleccionadas) {
        this.clienteId = cliente._id;
        this.fecha = new Date();
        this.repartidorAsignadoId = null;
        this.estado = "en_proceso";

        // Contar las cantidades de cada pizza seleccionada
        const pizzaCounts = new Map();
        pizzasSeleccionadas.forEach(pizza => {
            const pizzaIdStr = pizza._id.toString();
            const count = pizzaCounts.get(pizzaIdStr) || 0;
            pizzaCounts.set(pizzaIdStr, count + 1);
        });

        // Convertir el mapa a un array de objetos con pizzaId y cantidad
        this.pizzas = Array.from(pizzaCounts.entries()).map(([pizzaId, cantidad]) => ({
            pizzaId: new ObjectId(pizzaId),
            cantidad: cantidad
        }));

        // Calcular el total del pedido
        this.total = pizzasSeleccionadas.reduce((sum, pizza) => sum + pizza.precio, 0);

        // Guardar las pizzas seleccionadas para uso interno
        this._pizzasData = pizzasSeleccionadas;
    }

    // Guarda el pedido en la base de datos ejecutando una transacción.
    async guardar() {
        // Se obtiene una sesión directamente desde el singleton Singleton
        const session = await database.startSession();

        try {
            // Iniciamos la transacción en la sesión
            await session.withTransaction(async () => {
                // Obtenemos las colecciones usando el método del Singleton
                const ingredientesCollection = await database.getCollection('ingredientes');
                const repartidoresCollection = await database.getCollection('repartidores');
                const pedidosCollection = await database.getCollection('pedidos');

                // Lógica de verificación de ingredientes
                const ingredientesRequeridos = new Map();
                this._pizzasData.forEach(pizza => {
                    pizza.ingredientes.forEach(ingId => {
                        const ingIdStr = ingId.toString();
                        const count = ingredientesRequeridos.get(ingIdStr) || 0;
                        ingredientesRequeridos.set(ingIdStr, count + 1);
                    });
                });

                // Verificar stock de ingredientes
                for (const [ingId, cantidad] of ingredientesRequeridos.entries()) {
                    const ingrediente = await ingredientesCollection.findOne({ _id: new ObjectId(ingId) }, { session });
                    if (!ingrediente || ingrediente.stock < cantidad) {
                        throw new Error(`Stock insuficiente para el ingrediente: ${ingrediente?.nombre || ingId}`);
                    }
                }

                // Lógica de asignación de repartidor
                const repartidor = await repartidoresCollection.findOne({ estado: 'disponible' }, { session });
                if (!repartidor) {
                    throw new Error("No hay repartidores disponibles en este momento. 🛵");
                }
                this.repartidorAsignadoId = repartidor._id;

                // Actualizar inventario de ingredientes
                for (const [ingId, cantidad] of ingredientesRequeridos.entries()) {
                    await ingredientesCollection.updateOne(
                        { _id: new ObjectId(ingId) },
                        { $inc: { stock: -cantidad } },
                        { session }
                    );
                }

                // Actualizar estado del repartidor
                await repartidoresCollection.updateOne(
                    { _id: this.repartidorAsignadoId },
                    { $set: { estado: 'ocupado' } },
                    { session }
                );

                // Registrar el pedido
                await pedidosCollection.insertOne({
                    clienteId: this.clienteId,
                    pizzas: this.pizzas,
                    total: this.total,
                    fecha: this.fecha,
                    repartidorAsignadoId: this.repartidorAsignadoId,
                    estado: this.estado
                }, { session });

                console.log("✅ ¡Pedido realizado con éxito!");
            });
        } catch (error) {
            console.error("❌ Error en la transacción del pedido: " + error.message);
            throw error;
        } finally {
            await session.endSession();
        }
    }

    // Cancela un pedido existente y revierte los cambios en stock y repartidor.
    static async cancelar(pedidoId) {

        // Se obtiene una sesión directamente desde el singleton Singleton
        const session = await database.startSession();

        try {
            await session.withTransaction(async () => {
                const pedidosCollection = await database.getCollection('pedidos');
                const ingredientesCollection = await database.getCollection('ingredientes');
                const repartidoresCollection = await database.getCollection('repartidores');

                // 1. Encontrar el pedido que se va a cancelar
                const pedido = await pedidosCollection.findOne({ _id: pedidoId }, { session });
                if (!pedido) throw new Error("El pedido no existe.");
                if (pedido.estado === 'cancelado') throw new Error("Este pedido ya ha sido cancelado.");

                // 2. Calcular los ingredientes a devolver al stock
                const pizzasCollection = await database.getCollection('pizzas');
                const ingredientesADevolver = new Map();

                for (const itemPizza of pedido.pizzas) {
                    const pizzaInfo = await pizzasCollection.findOne({ _id: itemPizza.pizzaId }, { session });
                    for (const ingId of pizzaInfo.ingredientes) {
                        const ingIdStr = ingId.toString();
                        const count = ingredientesADevolver.get(ingIdStr) || 0;
                        // Sumamos la cantidad de ingredientes por la cantidad de pizzas pedidas
                        ingredientesADevolver.set(ingIdStr, count + itemPizza.cantidad);
                    }
                }

                // --- INICIO DE OPERACIONES DE ESCRITURA ---

                // 3. Devolver los ingredientes al stock
                for (const [ingId, cantidad] of ingredientesADevolver.entries()) {
                    await ingredientesCollection.updateOne(
                        { _id: new ObjectId(ingId) },
                        { $inc: { stock: cantidad } }, // Usamos $inc con un número positivo para sumar
                        { session }
                    );
                }

                // 4. Liberar al repartidor
                if (pedido.repartidorAsignadoId) { 
                    await repartidoresCollection.updateOne(
                        { _id: pedido.repartidorAsignadoId }, 
                        { $set: { estado: 'disponible' } },
                        { session }
                    );
                }

                // 5. Marcar el pedido como cancelado
                const resultado = await pedidosCollection.updateOne(
                    { _id: pedidoId },
                    { $set: { estado: 'cancelado' } },
                    { session }
                );

                console.log("✅ ¡Pedido cancelado exitosamente! El stock y el repartidor han sido restaurados.");
            });
        } catch (error) {
            console.error("❌ Error en la transacción de cancelación: " + error.message);
            throw error;
        } finally {
            await session.endSession();
        }
    }
}