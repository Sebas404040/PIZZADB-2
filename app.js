// Importaciones necesarias
import inquirer from 'inquirer';
import cfonts from 'cfonts';

import database from './.config/database.js';
import notificador from './services/notificador.js';

import { Cliente } from './models/Cliente.js';
import { Pizza } from './models/Pizza.js';
import { Pedido } from './models/Pedido.js';

// Función para pausar y esperar que el usuario presione ENTER
async function pressEnterToContinue() {
    await inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: '\nPresione ENTER para continuar...',
        },
    ]);
}

// Función principal del menú interactivo
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

        // Se captura la acción del usuario en el menú principal
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: '🍕 ¡Bienvenido a Pizzadb 2! ¿Qué deseas hacer?',
                choices: [
                    'Registrar un nuevo pedido',
                    'Cancelar un pedido',
                    'Ver reportes de ventas',
                    'Salir'
                ],
            },
        ]);

        // Se ejecuta la acción seleccionada por el usuario
        switch (action) {
            case 'Registrar un nuevo pedido':
                await registrarNuevoPedido();
                break;
            case 'Cancelar un pedido':
                await CancelarPedido();
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

// Función para registrar un nuevo pedido
async function registrarNuevoPedido() {
    // Intenta conectar a la base de datos y realizar el pedido
    try {

        // Conexión a la base de datos y obtención de colecciones necesarias
        const clientesCollection = await database.getCollection('clientes');
        const pizzasCollection = await database.getCollection('pizzas');

        // Obtención de datos de clientes y pizzas
        const clientesData = await clientesCollection.find({}).toArray();
        const pizzasData = await pizzasCollection.find({}).toArray();

        // Mapeo de datos a instancias de las clases Cliente y Pizza
        const clientes = clientesData.map(c => new Cliente(c));
        const pizzas = pizzasData.map(p => new Pizza(p));

        // Se captura la selección del cliente 
        const { clienteSeleccionado } = await inquirer.prompt({
            type: 'list',
            name: 'clienteSeleccionado',
            message: 'Selecciona el cliente:',
            choices: clientes.map(c => ({ name: c.nombre, value: c }))
        });

        // Se captura la selección de pizzas (múltiples)
        const { pizzasSeleccionadas } = await inquirer.prompt({
            type: 'checkbox',
            name: 'pizzasSeleccionadas',
            message: 'Selecciona las pizzas que deseas pedir:',
            choices: pizzas.map(p => ({ name: `${p.nombre} - $${p.precio}`, value: p })),
            validate: answer => answer.length > 0 ? true : 'Debes seleccionar al menos una pizza.'
        });

        // Se crea un nuevo pedido y se guarda en la base de datos
        const nuevoPedido = new Pedido(clienteSeleccionado, pizzasSeleccionadas);
        
        await nuevoPedido.guardar();

    // En caso de error
    } catch (error) {
        console.log("No se pudo completar el pedido.");
    } finally {
        // Pausa antes de volver al menú principal
        await pressEnterToContinue();

        // Desconexión de la base de datos  
        await database.desconectar();
    }
}

// Cancelar un pedido existente
async function CancelarPedido() {

    // Intenta conectar a la base de datos y cancelar el pedido
    try {

        // Conexión a la base de datos y obtención de la colección de pedidos
        const pedidosCollection = await database.getCollection('pedidos');
        
        const pedidosActivos = await pedidosCollection.find({ estado: { $ne: 'cancelado' } }).toArray();

        // Si no hay pedidos activos, informa al usuario y retorna
        if (pedidosActivos.length === 0) {
            console.log("\nNo hay pedidos activos para cancelar.");
            return;
        }

        // Se captura la selección del pedido a cancelar
        const { pedidoIdParaCancelar } = await inquirer.prompt([
            {
                type: 'list',
                name: 'pedidoIdParaCancelar',
                message: 'Selecciona el pedido que deseas cancelar:',
                choices: pedidosActivos.map(pedido => ({
                    name: `Pedido del ${new Date(pedido.fecha).toLocaleString()} - Total: $${pedido.total}`,
                    value: pedido._id
                }))
            }
        ]);

        // Llama al método estático para cancelar el pedido
        await Pedido.cancelar(pedidoIdParaCancelar);

    } catch (error) {
        console.log("No se pudo completar la cancelación.");
    } finally {
        // Pausa antes de volver al menú principal
        await pressEnterToContinue();

        // Desconexión de la base de datos
        await database.desconectar();
    }
}

// Función para ver reportes de ventas
async function VerReportes() {

    // Se captura la selección del reporte a visualizar
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

    // Se ejecuta el reporte seleccionado
    switch (reporte) {
        case 'Ingredientes más utilizados (último mes)':
            await notificador.mostrarIngredientesMasUsados();
            break;
        case 'Promedio de precios por categoría':
            await notificador.mostrarPromedioPrecioPorCategoria();
            break;
        case 'Categoría de pizza más vendida':
            await notificador.mostrarCategoriaMasVendida();
            break;
        case 'Volver al menú principal':
            return;
    }
    if (reporte !== 'Volver al menú principal') {
        await pressEnterToContinue();
    }
}

// Inicia la aplicación
main();