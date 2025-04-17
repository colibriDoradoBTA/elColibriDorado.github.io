document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURACIÓN ---
    // !! IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script desplegado !!
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzrzs1DI5qe5NdFtJ1eKe2AvEpw7RD3RqhEZ93Eh6SDPPrnyDg2fOh3IRPA6YbWxinq/exec'; // Pega aquí tu URL /exec
    // Número total de desafíos (sin contar la intro)
    const TOTAL_CHALLENGES = 10;
    const CHALLENGE_10_TIMER_DURATION_SECONDS = 15 * 60; // 15 minutos para el desafío 10

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const introSection = document.getElementById('intro-section');
    const profilingForm = document.getElementById('profiling-form');
    const profilingStatus = document.getElementById('profiling-status');
    const challengesSection = document.getElementById('challenges-section');
    const challengeCards = document.querySelectorAll('.challenge-card'); // Todas las tarjetas
    // const challengeForms = document.querySelectorAll('.challenge-form'); // No se usa directamente con delegación
    const completionMessage = document.getElementById('completion-message');

    let currentChallenge = 0; // Rastrea el desafío actual (0 = perfil inicial)
    let timerInterval = null; // Para el temporizador del desafío 10
    let agentName = ''; // Para guardar el nombre/alias del agente

    // --- LÓGICA DE EVENTOS ---

    // Manejar envío del formulario de perfil
    if (profilingForm) {
        profilingForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Evitar envío tradicional
            const submitButton = profilingForm.querySelector('.submit-button');
            submitButton.disabled = true;
            showStatus(profilingStatus, 'Procesando perfil...', 'loading');

            const formData = new FormData(profilingForm);
            const data = Object.fromEntries(formData.entries());
            data.formType = 'profiling'; // Añadir identificador para el script de Google
            agentName = data.nombre || 'Agente Desconocido'; // Guarda el nombre para usarlo después

            try {
                const response = await sendDataToGAS(data);
                if (response.status === 'success') {
                    showStatus(profilingStatus, '¡Perfil guardado! Iniciando Reto...', 'success');
                    // Ocultar intro y mostrar primer desafío después de un breve retraso
                    setTimeout(() => {
                        introSection.classList.remove('visible');
                        currentChallenge = 1;
                        unlockChallenge(currentChallenge);
                    }, 1500);
                } else {
                    // El error viene procesado desde sendDataToGAS
                    throw new Error(response.message || 'Error desconocido al guardar perfil.');
                }
            } catch (error) {
                console.error('Error en profiling:', error);
                // Muestra el error procesado por sendDataToGAS o el error capturado aquí
                showStatus(profilingStatus, error.message || 'Error al procesar el perfil.', 'error');
                 submitButton.disabled = false; // Rehabilitar si hubo error
            }
            // No se rehabilita el botón en caso de éxito, porque la sección se oculta
        });
    } else {
        console.error("Elemento #profiling-form no encontrado.");
    }

    // Manejar envío de formularios de desafío usando delegación de eventos en la sección principal
    if (challengesSection) {
        challengesSection.addEventListener('submit', async (event) => {
            // Asegurarse que el evento viene de un form con la clase correcta DENTRO de la sección de desafíos
            if (!event.target.classList.contains('challenge-form')) {
                return;
            }
            event.preventDefault(); // Evitar envío tradicional

            const form = event.target;
            const statusElement = form.querySelector('.status-message');
            const submitButton = form.querySelector('.submit-button');
            const challengeIdInput = form.querySelector('input[name="challengeId"]');

            if (!challengeIdInput || !statusElement || !submitButton) {
                 console.error("Formulario de desafío incompleto (falta challengeId, status o botón).", form);
                 showStatus(statusElement || form, 'Error interno del formulario.', 'error'); // Intenta mostrar error
                 return;
            }

            const challengeId = parseInt(challengeIdInput.value);

            // Validar que sea el desafío actual el que se envía
            if (challengeId !== currentChallenge) {
                showStatus(statusElement, 'Aún no puedes enviar este desafío.', 'error');
                return;
            }

            submitButton.disabled = true; // Deshabilitar botón mientras se envía
            showStatus(statusElement, 'Enviando respuesta...', 'loading');

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.formType = 'challenge'; // Identificador para GAS
            data.nombreAgente = agentName || 'Agente Desconocido'; // Usa el nombre guardado

            try {
                const response = await sendDataToGAS(data);

                if (response.status === 'success') {
                    showStatus(statusElement, '¡Respuesta registrada! Desbloqueando siguiente...', 'success');

                    // Si era el desafío 10, detener el temporizador
                    if (challengeId === 10 && timerInterval) {
                        clearInterval(timerInterval);
                        timerInterval = null; // Limpiar referencia
                    }

                    // Avanzar al siguiente desafío o mostrar mensaje final
                    currentChallenge++;
                    if (currentChallenge <= TOTAL_CHALLENGES) {
                        setTimeout(() => {
                            // Ocultar el desafío actual antes de mostrar el siguiente
                             form.closest('.challenge-card').classList.remove('visible');
                             setTimeout(() => unlockChallenge(currentChallenge), 300); // Pequeño delay para animación
                        }, 1500); // Retraso para leer el mensaje
                    } else {
                        // Juego completado
                        setTimeout(() => {
                            form.closest('.challenge-card').classList.remove('visible'); // Ocultar último desafío
                            if(completionMessage) {
                                completionMessage.classList.add('visible');
                            } else {
                                console.error("Elemento #completion-message no encontrado.");
                            }
                        }, 1500);
                    }
                } else {
                     // El error viene procesado desde sendDataToGAS
                     throw new Error(response.message || 'Error al registrar la respuesta.');
                }
            } catch (error) {
                console.error(`Error en desafío ${challengeId}:`, error);
                // Muestra el error procesado por sendDataToGAS o el error capturado aquí
                showStatus(statusElement, error.message || `Error en el desafío ${challengeId}.`, 'error');
                submitButton.disabled = false; // Rehabilitar botón en caso de error
            }
            // No se rehabilita en caso de éxito, porque se avanza al siguiente
        });
    } else {
         console.error("Elemento #challenges-section no encontrado.");
    }


    // --- FUNCIONES AUXILIARES ---

    /**
     * Envía datos al Google Apps Script desplegado.
     * Maneja errores de red y respuestas del servidor.
     * @param {object} data - El objeto con los datos a enviar.
     * @returns {Promise<object>} - La respuesta JSON del script.
     * @throws {Error} - Lanza un error si la conexión falla o la respuesta no es exitosa.
     */
    async function sendDataToGAS(data) {
        if (GOOGLE_APPS_SCRIPT_URL === 'URL_DE_TU_WEB_APP_AQUI' || !GOOGLE_APPS_SCRIPT_URL) {
             console.error("¡ALERTA! Debes configurar 'GOOGLE_APPS_SCRIPT_URL' en script.js.");
             // Lanzamos error para detener el flujo y notificar al usuario
             throw new Error("El servidor del reto no está configurado. Contacta al administrador.");
        }

        try {
            const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors', // Asegúrate que GAS esté desplegado para permitir CORS ('Anyone')
                cache: 'no-cache',
                headers: {
                     'Content-Type': 'text/plain;charset=utf-8', // GAS prefiere esto para e.postData.contents
                },
                 redirect: 'follow',
                 body: JSON.stringify(data) // Siempre enviamos JSON
            });

            // Verificar si la respuesta HTTP fue exitosa (ej: 2xx)
            if (!response.ok) {
                 // Intentar obtener más detalles del error si es posible
                 let errorText = response.statusText;
                 try {
                    const errorBody = await response.text(); // Puede ser HTML de error de GAS
                    console.error("Respuesta de error de GAS (texto):", errorBody);
                    // No incluir errorBody directamente en el mensaje al usuario por seguridad
                 } catch (textError) {
                    // No se pudo leer el cuerpo del error
                 }
                 throw new Error(`Error del servidor (${response.status}). Inténtalo de nuevo.`);
            }

            // Intentar parsear la respuesta JSON del script GAS
            try {
                 const result = await response.json();
                 // Asumimos que el script GAS devuelve { status: 'success' } o { status: 'error', message: '...' }
                 if (!result || (result.status !== 'success' && result.status !== 'error')) {
                     console.error("Respuesta JSON inesperada de GAS:", result);
                     throw new Error("Respuesta inválida del servidor del reto.");
                 }
                 return result; // Devuelve el objeto { status: '...', message: '...' }
            } catch (jsonError) {
                console.error("Error al parsear respuesta JSON de GAS:", jsonError);
                const textResponse = await response.text(); // Intentar leer como texto para depurar
                console.error("Respuesta de GAS como texto:", textResponse);
                throw new Error("Error al interpretar la respuesta del servidor.");
            }

        } catch (networkError) {
            console.error('Error de red o CORS al conectar con Google Apps Script:', networkError);
            // Distinguir entre errores de red y otros errores
            if (networkError.message.includes('Failed to fetch')) {
                 throw new Error('No se pudo conectar con el servidor del reto. Verifica tu conexión a internet o la configuración CORS.');
            } else {
                // Re-lanzar otros errores (como los lanzados desde el bloque try anterior)
                throw networkError;
            }
        }
    }

    /**
     * Muestra un mensaje de estado en el elemento especificado.
     * @param {HTMLElement | null} element - El elemento donde mostrar el mensaje.
     * @param {string} message - El texto del mensaje.
     * @param {'loading'|'success'|'error'} type - El tipo de mensaje para estilizar.
     */
    function showStatus(element, message, type) {
        if (!element) {
            console.warn("Intento de mostrar status en elemento nulo:", message);
            return;
        }
        element.textContent = message;
        // Clases base + clase específica del tipo
        element.className = `status-message ${type}`; // Asegura que la clase base esté y añade la de tipo
        element.style.display = 'block'; // Asegura que sea visible
    }

    /**
     * Muestra el desafío especificado y oculta los demás.
     * @param {number} challengeNumber - El número del desafío a mostrar (1-10).
     */
    function unlockChallenge(challengeNumber) {
        const challengeElement = document.getElementById(`challenge-${challengeNumber}`);

        if (challengeElement) {
            // Ocultar todos los demás desafíos por si acaso (aunque el flujo normal oculta el anterior)
            // challengeCards.forEach(card => {
            //     if (card.id !== `challenge-${challengeNumber}` && card.id !== 'intro-section') {
            //         card.classList.remove('visible');
            //     }
            // });

            // Mostrar el nuevo desafío con animación
            challengeElement.classList.add('visible');

             // Si es el desafío 10, iniciar el temporizador
            if (challengeNumber === 10) {
                 const timerDisplay = document.getElementById('timer-10');
                startTimer(CHALLENGE_10_TIMER_DURATION_SECONDS, timerDisplay);
            }

        } else {
            console.error(`Elemento del desafío #${challengeNumber} no encontrado.`);
            // Considerar mostrar un error al usuario aquí si el juego no puede continuar
             if (challengesSection) { // Intentar mostrar error en la sección principal
                const errorP = document.createElement('p');
                showStatus(errorP, `Error crítico: No se pudo cargar el desafío ${challengeNumber}.`, 'error');
                challengesSection.appendChild(errorP);
            }
        }
    }

    /**
     * Inicia un temporizador de cuenta regresiva.
     * @param {number} duration - Duración en segundos.
     * @param {HTMLElement | null} displayElement - Elemento donde mostrar el tiempo.
     */
    function startTimer(duration, displayElement) {
        if (!displayElement) {
            console.error("Elemento de visualización del temporizador no encontrado.");
            return;
        }

        clearInterval(timerInterval); // Limpiar cualquier intervalo anterior
        let timer = duration;

       timerInterval = setInterval(() => {
            let minutes = parseInt(timer / 60, 10);
            let seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            displayElement.textContent = `Tiempo Restante: ${minutes}:${seconds}`;

            if (--timer < 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                displayElement.textContent = "¡Tiempo Agotado!";
                // Deshabilitar el formulario del desafío 10
                const form10 = document.querySelector('#challenge-10 .challenge-form');
                if(form10) {
                     form10.querySelector('.submit-button').disabled = true;
                     const status10 = form10.querySelector('.status-message');
                     showStatus(status10, 'El tiempo ha terminado. No puedes enviar.', 'error');
                }
            }
        }, 1000);
    }

    // --- Inicialización del Juego ---
    function initializeGame() {
         // Ocultar todos los desafíos y mensaje final, mostrar solo intro
         challengeCards.forEach(card => {
            if (card.id === 'intro-section') {
                card.classList.add('visible');
            } else {
                card.classList.remove('visible');
            }
        });
         // Asegurarse que el mensaje de completado esté oculto
         if(completionMessage) completionMessage.classList.remove('visible');
         currentChallenge = 0; // Reiniciar estado
         agentName = '';
         // Limpiar temporizador si existe de una ejecución anterior
         if (timerInterval) {
             clearInterval(timerInterval);
             timerInterval = null;
         }
         // Limpiar mensajes de estado residuales (opcional, pero más limpio)
         document.querySelectorAll('.status-message').forEach(el => {
             el.textContent = '';
             el.style.display = 'none';
             el.className = 'status-message';
         });
         // Rehabilitar botones que pudieran haber quedado deshabilitados
         document.querySelectorAll('.submit-button').forEach(btn => btn.disabled = false);
    }

    initializeGame(); // Ejecutar al cargar la página

}); // Fin de DOMContentLoaded
