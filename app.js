import inquirer from 'inquirer';
import cfonts from 'cfonts';
import { client, dbName } from './db/connection.js';

import { Cliente } from './models/Cliente.js';
import { Pizza } from './models/Pizza.js';

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
                await registrarNuevoPedido();
                break;
            case 'Ver reportes de ventas':
                await VerReportes();
                break;
            case 'Salir':
                exit = true;
                console.log("\n¡Gracias por usar nuestro sistema! 👋");
                break;
        }
    }
}

async function registrarNuevoPedido() {
    try {
        await client.connect();
        const db = client.db(dbName);

        const clientesData = await db.collection('clientes').find({}).toArray();
        const pizzasData = await db.collection('pizzas').find({}).toArray();

        const clientes = clientesData.map(c => new Cliente(c));
        const pizzas = pizzasData.map(p => new Pizza(p));

        const { clienteSeleccionado } = await inquirer.prompt({
            type: 'list',
            name: 'clienteSeleccionado',
            message: 'Selecciona el cliente:',
            choices: clientes.map(c => ({ name: c.nombre, value: c }))
        });

        const { pizzasSeleccionadas } = await inquirer.prompt({
            type: 'checkbox',
            name: 'pizzasSeleccionadas',
            message: 'Selecciona las pizzas que deseas pedir:',
            choices: pizzas.map(p => ({ name: `${p.nombre} - $${p.precio}`, value: p })),
            validate: function (answer) {
                if (answer.length < 1) {
                    return 'Debes seleccionar al menos una pizza.';
                }
                return true;
            }
        });

        await client.close();

        const nuevoPedido = new Pedido(clienteSeleccionado, pizzasSeleccionadas);

        await nuevoPedido.guardar();

    } catch (error) {
        console.error("Error al procesar el nuevo pedido:", error);
        if (client) {
            await client.close();
        }
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
            console.log("aqui va ingredientes mas usados");
            break;
        case 'Promedio de precios por categoría':
            console.log("aqui va promedio precio categoria");
            break;
        case 'Categoría de pizza más vendida':
            console.log("aqui va pizza mas vendida");
            break;
        case 'Volver al menú principal':
            return;
    }
}

main();