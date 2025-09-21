import chalk from "chalk";
import database from "../.config/database.js";

class Notificador {
    constructor() {

    }

    async mostrarIngredientesMasUsados() {
        try {
            const collection = await database.getCollection("pedidos");

            // Creamos una fecha que representa exactamente hace un mes desde ahora.
            const ultimoMes = new Date();
            ultimoMes.setMonth(ultimoMes.getMonth() - 1);

            const pipeline = [
                // Filtra los documentos para incluir solo aquellos cuya 'fecha'
                // sea mayor o igual ($gte) a la de hace un mes.
                {
                    $match: {
                        fecha: { $gte: ultimoMes }
                    }
                },

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

    async mostrarPromedioPrecioPorCategoria() {
        try {
            const collection = await database.getCollection("pizzas");

            const pipeline = [
                // 1. Agrupar los documentos por el campo 'categoria'
                {
                    $group: {
                        _id: "$categoria",
                        // Calcular el promedio del campo 'precio' para cada grupo
                        precioPromedio: { $avg: "$precio" }
                    }
                },
                // 2. Ordenar los resultados por el promedio de precio, de mayor a menor
                {
                    $sort: { precioPromedio: -1 }
                },
                // 3. Formatear la salida para que sea más legible
                {
                    $project: {
                        _id: 0,
                        Categoría: "$_id",
                        "Precio Promedio": { $round: ["$precioPromedio", 2] }
                    }
                }
            ];

            const resultado = await collection.aggregate(pipeline).toArray();
            console.log(chalk.cyan.bold("\n--- 📊 Reporte: Promedio de Precios por Categoría ---"));

            if (resultado.length > 0) {
                console.table(resultado);
            } else {
                console.log(chalk.blue("No se encontraron pizzas para generar este reporte."));
            }

        } catch (error) {
            console.error(chalk.red("Error al generar el reporte de precios por categoría:"), error);
        } finally {
            await database.desconectar();
        }
    }
}

export default new Notificador();