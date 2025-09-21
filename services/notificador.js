import chalk from "chalk";
import database from "../.config/database.js";

class Notificador {
    constructor() {

    }

    async mostrarIngredientesMasUsados() {
        try {
            const collection = await database.getCollection("pedidos");

            const pipeline = [
                // 1. Descomponer el array de pizzas de cada pedido
                { $unwind: "$pizzas" },

                // 2. Buscar los detalles de cada pizza en la colección 'pizzas'
                {
                    $lookup: {
                        from: "pizzas",
                        localField: "pizzas.pizzaId",
                        foreignField: "_id",
                        as: "pizzaInfo"
                    }
                },

                // 3. Descomponer el array de resultados de $lookup (aunque será de 1)
                { $unwind: "$pizzaInfo" },

                // 4. Descomponer el array de ingredientes de cada pizza
                { $unwind: "$pizzaInfo.ingredientes" },

                // 5. Buscar el nombre de cada ingrediente en la colección 'ingredientes'
                {
                    $lookup: {
                        from: "ingredientes",
                        localField: "pizzaInfo.ingredientes",
                        foreignField: "_id",
                        as: "ingredienteInfo"
                    }
                },

                // 6. Descomponer el array de resultados de $lookup
                { $unwind: "$ingredienteInfo" },

                // 7. Agrupar por nombre de ingrediente y contar
                {
                    $group: {
                        _id: "$ingredienteInfo.nombre",
                        vecesPedido: { $sum: 1 }
                    }
                },

                // 8. Ordenar de más a menos pedido
                { $sort: { vecesPedido: -1 } }
            ];

            const resultado = await collection.aggregate(pipeline).toArray();
            console.log(chalk.yellow.bold("\n--- 📊 Reporte: Ingredientes Más Utilizados ---"));
            console.table(resultado);
        } catch (error) {
            console.error(chalk.red("Error al generar el reporte de ingredientes:"), error);
        }
    }
}

export default new Notificador();