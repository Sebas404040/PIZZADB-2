import { ObjectId } from 'mongodb';
import database from '../.config/database.js';

export class Pedido {

    constructor(cliente, pizzasSeleccionadas) {
        this.clienteId = cliente._id;
        this.fecha = new Date();
        this.repartidorAsignadoId = null;

        const pizzaCounts = new Map();
        pizzasSeleccionadas.forEach(pizza => {
            const pizzaIdStr = pizza._id.toString();
            const count = pizzaCounts.get(pizzaIdStr) || 0;
            pizzaCounts.set(pizzaIdStr, count + 1);
        });

        this.pizzas = Array.from(pizzaCounts.entries()).map(([pizzaId, cantidad]) => ({
            pizzaId: new ObjectId(pizzaId),
            cantidad: cantidad
        }));
        
        this.total = pizzasSeleccionadas.reduce((sum, pizza) => sum + pizza.precio, 0);

        this._pizzasData = pizzasSeleccionadas; 
    }

    // Guarda el pedido en la base de datos ejecutando una transacción.
    async guardar() {
        // Obtenemos una sesión directamente desde nuestro Singleton
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
                    repartidorAsignado: this.repartidorAsignadoId
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
}