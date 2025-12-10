# Explicación del Código (Documentación Pedagógica)

Este documento explica **cómo funciona** el sistema "ERP Sales Dashboard", su arquitectura y las decisiones técnicas, pensado para que cualquier desarrollador (o estudiante) pueda comprenderlo.

---

## 🏗 Arquitectura General

El sistema se divide en tres partes principales que trabajan en conjunto:

1.  **Frontend (React)**: Es la "cara" de la aplicación. Lo que ves en el navegador. Se encarga de mostrar los datos, permitir interacciones (botones, formularios) y generar PDFs.
2.  **Backend (Python + FastAPI)**: Es el "cerebro" intermedio. Recibe las peticiones del Frontend (ej. "dame los leads") y se comunica con la base de datos (Notion).
3.  **Base de Datos (Notion)**: Es donde **realmente** se guardan los datos. Usamos Notion como si fuera una base de datos SQL, pero con una interfaz visual amigable.

### 🔄 Flujo de Datos

1.  El usuario abre la web -> **Frontend** carga.
2.  El Frontend pide datos a `/api/leads` -> **Backend** recibe la petición.
3.  El **Backend** usa sus credenciales para preguntar a **Notion** -> Notion responde con datos crudos.
4.  El **Backend** "limpia" esos datos (los hace fáciles de leer) y se los da al Frontend.
5.  El **Frontend** "pinta" las tarjetas de clientes en la pantalla.

---

## 📂 Estructura del Proyecto

### `backend_python/` (El Servidor)

Aquí vive toda la lógica de servidor en Python.

*   **`main.py`**: Es la puerta de entrada. Aquí se inicia `FastAPI`, se configuran los permisos (CORS) para que el frontend pueda hablarle, y se conecta la base de datos temporal (SQLite con Tortoise ORM).
*   **`api/endpoints.py`**: Define las "rutas" o URLs.
    *   `GET /api/leads`: "Dame todos los clientes".
    *   `POST /api/history`: "Guarda esta nota en el historial".
*   **`services/notion_service.py`**: Es el "traductor" de Notion. Notion devuelve datos muy complejos (anidados en objetos como `properties -> Name -> title -> plain_text`). Este archivo toma ese caos y lo convierte en un objeto simple (`{ name: "Juan", id: "123" }`).
    *   *Curiosidad*: Usa una lógica "fuzzy" (borrosa) para encontrar columnas. Si en Notion la columna se llama "Dirección", "Address" o "Ubicación", el código es listo y sabe que es lo mismo.
*   **`models/models.py`**: Define cómo se guardan los datos si usáramos una base de datos local (SQLite).

### `src/` (El Frontend)

Aquí está la aplicación React.

*   **`App.tsx`**: El componente principal. Decide qué mostrar. Antes tenía un login de Google, pero lo quitamos para que sea de acceso directo.
*   **`components/`**: Piezas de Lego de la interfaz.
    *   `MainContent.tsx`: La columna central con las tarjetas de clientes (Kanban).
    *   `RightSidebar.tsx`: La barra derecha con el historial (notas, correos).
    *   `QuotesView.tsx`: La vista para crear cotizaciones.
*   **`services/`**: Funciones para hacer cosas específicas.
    *   `notionService.ts`: Llama al backend (no a Notion directamente).
    *   `pdfService.ts`: Genera los PDFs de las cotizaciones usando una librería llamada `jspdf`. Dibuja línea por línea el PDF en el navegador.

---

## 🎓 ¿Por qué hicimos esto?

### 1. ¿Por qué Python y FastAPI?
Node.js es genial, pero **Python** es excelente para manejo de datos y lógica. **FastAPI** es un framework moderno que es muy rápido y te ayuda a documentar tu API automáticamente (si entras a `/docs` en el backend verás un mapa interactivo).

### 2. ¿Por qué Notion como Base de Datos?
Porque permite a los usuarios "no técnicos" ver y editar los datos en la app de Notion, y esos cambios se reflejan en el Dashboard. Es una forma fácil de tener un "panel de administración" sin programarlo desde cero.

### 3. ¿Cómo funciona la "Sincronización"?
El sistema intenta ser "optimista". Cuando editas algo en el frontend (ej. cambias un cliente de columna), el frontend lo actualiza **inmediatamente** en pantalla para que se sienta rápido. *Luego*, por detrás, envía la petición al servidor. Si falla, te avisaría, pero para el usuario la experiencia es fluida.

---

## 🚀 Guía Rápida para Desarrolladores

Si quieres cambiar algo:

*   **¿Cambiar un color o estilo?** -> Busca en `index.css` o las clases de Tailwind en los componentes (`components/`).
*   **¿Añadir un dato nuevo al cliente?**
    1.  Agrega la columna en **Notion**.
    2.  Modifica `backend_python/services/data_processing.py` para leer esa nueva columna.
    3.  Modifica `src/types.ts` para agregar el campo al tipo `Lead`.
    4.  Úsalo en tu componente React.

¡Esperamos que esto te ayude a entender y mejorar el sistema! 🤓
