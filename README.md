# PIZZADB-2
# 🍕 PizzaDB-2 - Sistema de Gestión

Sistema de gestión por consola para la cadena de pizzerías "PizzaDB", desarrollado como un taller práctico en Node.js. 
La aplicación resuelve problemas de control de pedidos, inventario y análisis de ventas utilizando MongoDB, 
con un fuerte enfoque en la Programación Orientada a Objetos y los principios de diseño de software SOLID.

---

## ✨ Características Principales

- **Gestión de Pedidos Transaccional**: Registro de pedidos de forma atómica y segura utilizando Transactions de MongoDB.  
- **Reportes Avanzados**: Análisis de datos de ventas e inventario mediante consultas complejas con el Aggregation Framework.  
- **Arquitectura Robusta**: Implementado con Programación Orientada a Objetos (POO), aplicando principios SOLID y patrones de diseño como Singleton para la gestión de la conexión a la base de datos.  
- **Validación de Esquemas**: Integridad de datos garantizada a nivel de base de datos mediante la implementación de `$jsonSchema` en cada colección.  
- **Interfaz de Consola Interactiva**: Experiencia de usuario amigable y guiada gracias a Inquirer.js y CFonts.  

---

## 📐 Arquitectura y Diseño del Proyecto

El proyecto sigue una arquitectura Orientada a Objetos, separando las responsabilidades en diferentes capas para asegurar un código limpio, mantenible y escalable.

### Estructura de Archivos

```
PIZZADB-2/
├── config/
│   └── database.js       # Gestor de conexión a la BD (Singleton)
├── models/
│   ├── Pedido.js         # Clase Pedido con lógica transaccional
│   └── ...               # Clases para Cliente, Pizza, etc.
├── services/
│   └── notificador.js    # Servicio para generar y mostrar reportes
├── utils/
│   ├── seedData.js       # Script para aplicar esquemas y poblar la BD
│   └── schemaValidations.js # Definición de los esquemas de validación
├── app.js                # Orquestador principal de la aplicación (Controlador)
└── .env.example          # Plantilla para las variables de entorno
```

### Diagrama de Clases (UML)

El siguiente diagrama de clases ilustra la arquitectura y las relaciones entre los componentes clave del sistema.

![Diagrama UML](./docs/diagrama-UML.jpg)

### Diagrama del Modelo de Datos (NoSQL)
El siguiente es el diagrama de la base de datos para MongoDB propuesto propuesto, donde ilustra los componentes clave del sistema.

![Diagrama BD](./docs/diagrama-bd.jpg)

---

## 🛠️ Tecnologías y Librerías Utilizadas

- **Node.js**: Entorno de ejecución de JavaScript.  
- **MongoDB**: Base de datos NoSQL, utilizando el driver nativo `mongodb`.  
- **Inquirer.js**: Para la creación de la interfaz de consola interactiva.  
- **Chalk**: Para dar estilo y color a la salida por consola.  
- **CFonts**: Para la creación de banners estilizados en la consola.  
- **DotEnv**: Para la gestión de variables de entorno de forma segura.  

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Node.js (v18.x o superior)  
- npm (generalmente se instala con Node.js)  
- Una cuenta en MongoDB Atlas (un clúster M0 gratuito es suficiente).  

---

## 🚀 Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto:

1. **Clona el repositorio:**  
```bash
git clone https://github.com/Sebas404040/PIZZADB-2.git
cd PIZZADB-2
```

2. **Instala las dependencias:**  
```bash
npm i chalk mongodb boxen cfonts inquirer dotenv
```

3. **Configura las variables de entorno:**  
   - Crea un nuevo archivo en la raíz del proyecto llamado `.env`.  
   - Copia el contenido del archivo `.env.example` y pégalo en tu nuevo archivo `.env`.  
   - Rellena las variables con tus propias credenciales de MongoDB Atlas:  

```bash
# Contenido para tu archivo .env
DB_USER="profe"
DB_PASSWORD="12345"
DB_CLUSTER="cluster0.wzrcudo.mongodb.net/"
DB_NAME="pizzadb" # O el nombre que prefieras para tu base de datos
```

4. **Configura la base de datos:**  
Este comando aplicará los esquemas de validación a las colecciones y las poblará con datos de ejemplo.

```bash
node utils/seedData.js
```

---

## ▶️ Cómo Usar la Aplicación

Una vez configurado, inicia la aplicación con el siguiente comando:

```bash
node app.js
```

Se te presentará un menú interactivo con las siguientes opciones.

### Salida Esperada por Opción

#### Registrar un Nuevo Pedido
La aplicación te guiará para seleccionar un cliente y una o más pizzas.  
Al finalizar, verás un mensaje de éxito o de error.

```bash
✅ ¡Pedido realizado con éxito!
Presione ENTER para continuar...
```

#### Ver Reportes de Ventas

- **Reporte 1: Ingredientes más utilizados (Último Mes)**  
- **Reporte 2: Promedio de Precios por Categoría**  
- **Reporte 3: Categoría de Pizza Más Vendida**  

Ejemplo de salida:

```bash
--- 📊 Reporte: Ingredientes Más Utilizados (Último Mes) ---
┌─────────┬────────────────────┬─────────────┐
│ (index) │        _id         │ vecesPedido │
├─────────┼────────────────────┼─────────────┤
│    0    │ 'Queso Mozzarella' │      2      │
│    1    │ 'Salsa de Tomate'  │      2      │
└─────────┴────────────────────┴─────────────┘
```

```bash
--- 📊 Reporte: Promedio de Precios por Categoría ---
┌─────────┬─────────────┬──────────────────┐
│ (index) │  Categoría  │ 'Precio Promedio'│
├─────────┼─────────────┼──────────────────┤
│    0    │  'vegana'   │       15000      │
│    1    │ 'tradicional' │      12750     │
└─────────┴─────────────┴──────────────────┘
```

```bash
--- 📊 Reporte: Categoría de Pizza Más Vendida ---

¡La categoría más vendida es "tradicional"!
Con un total de 2 pizzas vendidas.

Presione ENTER para continuar...
```

---

## 👨‍💻 Autores

Este proyecto fue desarrollado por:

| Integrante              | Rol en el proyecto                |
| :---------------------- | :-------------------------------- |
| **Juan Sebastián Gómez** | Desarrollador/Estudiante           |
| **Sergio Liévano** | Desarrollador/Estudiante |
| **Bryan Villabona**| Desarrollador/Estudiante      |
