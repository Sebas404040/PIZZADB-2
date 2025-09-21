import inquirer from 'inquirer';
import cfonts from 'cfonts';

import database from './.config/database.js';
import notificador from './services/notificador.js';

import { Cliente } from './models/Cliente.js';
import { Pizza } from './models/Pizza.js';
import { Pedido } from './models/Pedido.js';

async function pressEnterToContinue() {
    await inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: '\nPresione ENTER para continuar...',
        },
    ]);
}

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
                await database.desconectar(); 
                console.log("\n¡Gracias por usar nuestro sistema! 👋");
                break;
        }
    }
}

async function registrarNuevoPedido() {
    try {
        const clientesCollection = await database.getCollection('clientes');
        const pizzasCollection = await database.getCollection('pizzas');

        const clientesData = await clientesCollection.find({}).toArray();
        const pizzasData = await pizzasCollection.find({}).toArray();

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
            validate: answer => answer.length > 0 ? true : 'Debes seleccionar al menos una pizza.'
        });

        const nuevoPedido = new Pedido(clienteSeleccionado, pizzasSeleccionadas);
        
        await nuevoPedido.guardar();

    } catch (error) {
        console.log("No se pudo completar el pedido.");
    } finally {
        await pressEnterToContinue();
        await database.desconectar();
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
            await notificador.mostrarIngredientesMasUsados();
            break;
        case 'Promedio de precios por categoría':
            console.log("aqui promedio precios categoria");
            break;
        case 'Categoría de pizza más vendida':
            console.log("aqui va categoria pizza mas vendida");
            break;
        case 'Volver al menú principal':
            return;
    }
    if (reporte !== 'Volver al menú principal') {
        await pressEnterToContinue();
    }
}

main();