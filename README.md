# Reto del Colibrí Dorado - Aventura Urbana Bogotá 🏆

![Bogotá Skyline](images/bogota-skyline-intro.jpg) <!-- Opcional: Puedes usar una imagen representativa aquí -->

Aplicación web interactiva diseñada para enseñar **Habilidades para la Vida de la Organización Mundial de la Salud (OMS)** a adolescentes y jóvenes en Bogotá, Colombia, a través de una emocionante aventura urbana virtual tipo *scavenger hunt*.

**[¡Prueba el Reto Aquí!](YOUR_GITHUB_PAGES_LINK_HERE)** 👈
*(Reemplaza `YOUR_GITHUB_PAGES_LINK_HERE` con tu enlace real de GitHub Pages una vez desplegado)*

---

## 🎯 Propósito y Audiencia

Este proyecto busca desarrollar de forma lúdica, práctica y contextualizada las 10 Habilidades para la Vida esenciales según la OMS, utilizando el rico contexto cultural y geográfico de Bogotá como escenario. Está dirigido principalmente a:

*   Adolescentes y jóvenes.
*   Educadores, psicólogos y facilitadores que trabajen con esta población.
*   Cualquier persona interesada en métodos innovadores de aprendizaje experiencial.

## ✨ Características Principales

*   **Perfil de Agente Inicial:** Permite al jugador reflexionar sobre sus fortalezas, debilidades e intereses (Autoconocimiento).
*   **10 Desafíos Temáticos:** Cada desafío está ambientado en un lugar icónico o representativo de Bogotá y se enfoca en desarrollar una Habilidad para la Vida específica (Empatía, Comunicación Asertiva, Toma de Decisiones, Pensamiento Crítico, Creatividad, etc.).
*   **Progresión Interactiva:** Los desafíos se desbloquean secuencialmente a medida que el jugador envía sus respuestas o completa las tareas.
*   **Integración con Google:**
    *   Los perfiles y el progreso se guardan automáticamente en una **Google Sheet**.
    *   Utiliza **Google Apps Script** como un backend simple para recibir datos del frontend.
    *   Incluye una fórmula en Google Sheets para generar un **"Prompt de Personaje"** basado en el perfil inicial del jugador.
*   **Diseño Atractivo y Responsivo:** Interfaz moderna, colorida y adaptada para funcionar en computadoras de escritorio y dispositivos móviles.
*   **Ambientación Visual:** Uso de imágenes (idealmente generadas por IA o fotografías) para sumergir al jugador en los escenarios bogotanos.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:**
    *   HTML5
    *   CSS3 (con Variables CSS, Flexbox/Grid, Media Queries para responsividad)
    *   JavaScript (Vanilla JS, DOM Manipulation, Fetch API para comunicación con backend)
    *   Google Fonts
*   **Backend & Almacenamiento:**
    *   Google Apps Script (Desplegado como Web App)
    *   Google Sheets
*   **Hosting:**
    *   GitHub Pages
*   **Diseño y Gráficos:**
    *   Prompts diseñados para generación de imágenes con IA.
    *   Iconografía inspirada en estilos de juegos (ej. Hearthstone).

## 📁 Estructura de Archivos

├── index.html # Estructura principal de la página (contenido)
├── style.css # Estilos visuales y diseño responsivo
├── script.js # Lógica del juego, interacción con el usuario y comunicación con Google Apps Script
├── images/ # Carpeta que CONTIENE todas las imágenes de ambiente e iconos
│ ├── bogota-skyline-intro.jpg
│ ├── plaza-bolivar.jpg
│ # ... (todas las demás imágenes .jpg o .png)
│ └── colibri-dorado-icon.png
└── README.md # Este archivo de información

**Importante:** La carpeta `images/` y los nombres de archivo dentro de ella deben coincidir *exactamente* con los usados en `index.html` y `style.css`.

## ⚙️ Cómo Funciona

1.  El usuario interactúa con la página web (`index.html`).
2.  Al enviar el formulario de perfil o las respuestas de los desafíos, JavaScript (`script.js`) captura los datos.
3.  JavaScript utiliza la `Fetch API` para enviar estos datos (en formato JSON) a la URL pública del **Google Apps Script** desplegado como Web App.
4.  El **Google Apps Script** (`Code.gs`) recibe la solicitud POST, procesa los datos JSON y los escribe en las filas correspondientes de la **Google Sheet** configurada.
5.  El script devuelve una respuesta (éxito o error) a JavaScript.
6.  JavaScript actualiza la interfaz de usuario (mostrando mensajes de estado, desbloqueando el siguiente desafío) basándose en la respuesta del script.

## 🚀 Configuración para Desarrollo o Despliegue Propio

Si deseas clonar este repositorio y desplegar tu propia versión:

1.  **Clona el Repositorio:** `git clone https://github.com/<tu-username>/<tu-repositorio>.git`
2.  **Crea una Google Sheet:**
    *   Crea una nueva hoja de cálculo en Google Sheets.
    *   Nómbrala descriptivamente (ej. "Datos Reto Colibri").
    *   Crea dos hojas dentro de ella: `Perfiles` y `Progreso Reto`.
    *   Configura los encabezados de columna en la primera fila de cada hoja como se especifica en el código de `Code.gs` y las instrucciones previas (Timestamp, Nombre, Fortalezas, etc. para Perfiles; Timestamp, Nombre Agente, ID Desafio, etc. para Progreso Reto).
    *   **Importante:** Añade la fórmula para generar el "Prompt Personaje" en la columna correspondiente de la hoja `Perfiles`.
    *   Obtén el **ID de la Hoja de Cálculo** (de la URL: `.../spreadsheets/d/ID_DE_TU_HOJA/edit`).
3.  **Crea y Despliega Google Apps Script:**
    *   Crea un nuevo proyecto en Google Apps Script ([script.google.com](https://script.google.com/)).
    *   Pega el contenido del archivo `Code.gs` proporcionado.
    *   **Reemplaza** `'ID_DE_TU_HOJA_DE_CALCULO'` dentro del script con el ID real de tu Google Sheet.
    *   **Implementa** el script como una **Aplicación Web**:
        *   Ejecutar como: `Yo`
        *   Quién tiene acceso: `Cualquier usuario` (**¡CRUCIAL!**)
    *   Autoriza los permisos necesarios.
    *   Copia la **URL de la Aplicación Web** generada (termina en `/exec`).
4.  **Actualiza el Código Frontend:**
    *   Abre el archivo `script.js`.
    *   Pega la URL de tu Aplicación Web de Google Apps Script en la constante `GOOGLE_APPS_SCRIPT_URL`.
5.  **Añade las Imágenes:** Genera o consigue las imágenes necesarias y colócalas dentro de la carpeta `images/` con los nombres de archivo exactos utilizados en `index.html`.
6.  **Despliega en GitHub Pages (o similar):**
    *   Sube todos los archivos (incluida la carpeta `images/`) a un repositorio público de GitHub.
    *   Ve a `Settings` > `Pages`.
    *   Selecciona `Deploy from a branch`, elige la rama `main` (o `master`) y la carpeta `/ (root)`.
    *   Guarda y espera a que se publique.

## 🤝 Contribuciones

¡Las ideas y mejoras son bienvenidas! Si encuentras un error, tienes una sugerencia o quieres proponer una mejora, por favor abre un **Issue** en este repositorio de GitHub.

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Puedes usar, modificar y distribuir el código libremente, manteniendo la atribución original.

---

*¡Esperamos que disfrutes y aprendas con el Reto del Colibrí Dorado!*
