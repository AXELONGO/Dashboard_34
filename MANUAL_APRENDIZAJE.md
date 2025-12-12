# Manual de Aprendizaje Cognitivo: ERP Sales Dashboard

> **Bienvenido, Arquitecto de Ventas.**
> Este documento no es un manual técnico. Es tu mapa para dominar el sistema que actúa como el "Cerebro Digital" de tu negocio. Aquí no solo aprenderás *qué* botones presionar, sino *por qué* lo haces y *qué* sucede detrás de escena.

---

## 🌎 1. La Visión Panorámica (¿Por qué?)

Imagina que tu negocio es un organismo vivo.
- **Tus Leads (clientes potenciales)** son el oxígeno.
- **Tus Ventas** son la energía.
- **Este Dashboard** es el sistema nervioso que coordina todo.

**Tu Objetivo:** Pasar de reaccionar ante el caos a orquestar el crecimiento. Al dominar esta herramienta, ganarás tres superpoderes:
1.  **Visión de Rayos X:** Verás el estado de cada cliente sin preguntar.
2.  **Memoria Infinita:** Recordarás cada conversación y detalle.
3.  **Velocidad IA:** Generarás oportunidades más rápido que cualquier humano.

---

## 🧠 2. El Modelo Mental (¿Cómo funciona?)

Para operar el sistema, primero debes entender cómo "piensa". Imagínalo en tres capas:

### Capa 1: Tus Ojos y Manos (Frontend)
Es lo que ves en la pantalla.
- **Dashboard Principal**: Tu cabina de mando.
- **Pestañas (Ventas, Clientes, etc.)**: Diferentes "lentes" para ver tus datos.
- **Acción**: Aquí es donde haces clic, escribes notas y seleccionas fichas.

### Capa 2: El Procesador Invisible (Backend)
Es el cerebro oculto.
- Cuando haces clic en "Guardar", este cerebro despierta.
- **Valida**: "¿Es esto una nota válida?".
- **Calcula**: "¿Quién es el cliente?".
- **Conecta**: Llama a la IA para generar leads o procesar texto.

### Capa 3: La Memoria Eterna (Notion)
Es la biblioteca donde se guarda todo.
- Nada se pierde. Si el sistema se apaga, Notion recuerda.
- El Dashboard lee de Notion y escribe en Notion.

> **Analogía de Aprendizaje:** Tú eres el conductor (Frontend), el motor es el código (Backend) y el combustible se guarda en el tanque (Notion).

---

## 🛤️ 3. Rutas de Aprendizaje (Guías paso a paso)

Elige tu nivel actual para comenzar tu viaje.

### 🌱 Nivel Novato: "Preparando el Terreno"
**Objetivo:** Tener el sistema listo para operar.

1.  **El Entorno (.env)**: Como configurar las coordenadas de tu mapa.
    - Necesitas las claves de Notion y Gemini. Sin ellas, el cerebro no despierta.
2.  **El Lanzamiento (Docker)**: Como encender el motor.
    - Ejecuta `docker-compose up`.
    - *Señal de éxito:* Verás mensajes de "Ready" en la terminal.
3.  **Primer Acceso**: Abre tu navegador en `http://localhost:8080`.
    - *Reto:* ¿Ves tus leads cargados? Si sí, has completado el nivel.

### 🌿 Nivel Aprendiz: "El Jardinero Diario"
**Objetivo:** Cultivar relaciones con clientes.

#### Flujo: Gestión de Leads
1.  **Selección**: Haz clic en una tarjeta de Lead.
    - *Observa:* El panel lateral izquierdo se abre automáticamente. Es tu "asistente" mostrándote el historial.
2.  **La Conversación**: Escribe una nota en el área de texto.
    - *Tip:* Sé específico. "Llamada de seguimiento" es mejor que "Hablé con él".
3.  **Guardado Inteligente**: Al dar enter, verás una notificación "Toast".
    - *Feedback:* Verde = Éxito. Rojo = Algo falló (revisa tu conexión).
4.  **Confirmación Visual**: Tu nota aparece inmediatamente en la lista (Optimismo) y segundos después se confirma en la base de datos (Realismo).

#### Flujo: Generación con IA
1.  Ve a la pestaña "Masivos" o usa el botón de IA.
2.  Pide: "Empresas de software en Madrid".
3.  *Magia:* El sistema "piensa" (barra de carga) y te devuelve datos estructurados.

### 🌳 Nivel Maestro: "El Sanador del Sistema"
**Objetivo:** Mantener el ecosistema sano.

- **¿Algo falló?**: No entres en pánico. Busca la notificación roja.
- **¿Datos desactualizados?**: Recuerda que Notion es la verdad. Si Notion está bien, recarga la página para que el Dashboard "lea" de nuevo.
- **Logs**: Si eres valiente, mira la consola del servidor. Ahí el sistema te "habla" sobre sus dolores (errores).

---

## 📖 4. Glosario Cognitivo

| Término Técnico | Traducción Mental |
| :--- | :--- |
| **API Key** | La llave maestra para entrar a una casa (Notion o Google). |
| **Docker** | Un contenedor hermético donde vive tu programa, seguro y aislado. |
| **Frontend** | La cara del programa (lo que ves). |
| **Backend** | El cerebro del programa (lo que piensa). |
| **Lead** | Una semilla (cliente potencial) que quieres que crezca. |
| **Toast** | Un mensajito emergente que te "susurra" si algo salió bien o mal. |

---

> **Recuerda:** La tecnología es solo una herramienta. Tu intuición y estrategia son lo que realmente cierra las ventas.
