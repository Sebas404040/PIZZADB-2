import inquirer from 'inquirer';
import cfonts from 'cfonts';
import { client, dbName } from './db/connection.js';

async function main() {
    let exit = false;
    while (!exit) {
        cfonts.say('PIZZADB', {
            font: '3d',
            align: 'center',
            colors: ['yellow', '#840'],
            background: 'transparent',
            gradient: true,
        });


        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '🍕 ¡Bienvenido a Pizzadb 2! ¿Qué deseas hacer?',
                choices: [
                    'Registrar un nuevo pedido',
                    'Ver reportes de ventas',
                    'Salir'
                ],
            },
        ]);

        switch (action) {
            case 'Registrar un nuevo pedido':
                await registroNuevoPedido();
                break;
            case 'Ver reportes de ventas':
                await VerReportes();
                break;
            case 'Salir':
                exit = true;
                console.log("¡Gracias por usar nuestro sistema! 👋");
                break;
        }
    }
}

async function registroNuevoPedido() {
    try {
        await client.connect();
        const db = client.db(dbName);

        const clientes = await db.collection('clientes').find({}).toArray();
        const pizzas = await db.collection('pizzas').find({}).toArray();

        const { clienteId } = await inquirer.prompt({
            type: 'list',
            name: 'clienteId',
            message: 'Selecciona el cliente:',
            choices: clientes.map(c => ({ name: c.nombre, value: c._id }))
        });

        const { pizzaIds } = await inquirer.prompt({
            type: 'checkbox',
            name: 'pizzaIds',
            message: 'Selecciona las pizzas que deseas pedir:',
            choices: pizzas.map(p => ({ name: `${p.nombre} - $${p.precio}`, value: p._id })),
            validate: function (answer) {
                if (answer.length < 1) {
                    return 'Debes seleccionar al menos una pizza.';
                }
                return true;
            }
        });

        await client.close();

        await realizarPedido(clienteId, pizzaIds);

    } catch (error) {
        console.error("Error al procesar el nuevo pedido:", error);
        await client.close();
    }
}

async function VerReportes() {
    const { reporte } = await inquirer.prompt([
        {
            type: 'list',
            name: 'reporte',
            message: 'Selecciona un reporte:',
            choices: [
                'Ingredientes más utilizados (último mes)',
                'Promedio de precios por categoría',
                'Categoría de pizza más vendida',
                'Volver al menú principal'
            ],
        },
    ]);

    switch (reporte) {
        case 'Ingredientes más utilizados (último mes)':
            console.log("aqui va ingredientes usados");
            break;
        case 'Promedio de precios por categoría':
            console.log("aqui va precios por categoria");
            break;
        case 'Categoría de pizza más vendida':
            console.log("aqui va pizzas mas vendidas");
            break;
        case 'Volver al menú principal':
            return;
    }
}

main();