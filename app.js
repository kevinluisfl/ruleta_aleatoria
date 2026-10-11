/**
 * ==============================================================================
 * RULETA DE PARTICIPACIÓN ESCOLAR - MOTOR PRINCIPAL
 * ==============================================================================
 * Sistema interactivo para la dinamización del aula de clases con soporte
 * para doble ruleta sincronizada, síntesis de voz natural y persistencia local.
 */

// Paleta de colores vibrantes para los sectores del Canvas
const SECTOR_COLORS = [
    '#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981',
    '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'
];

/* --------------------------------------------------------------------------
   REFERENCIAS AL DOM
   -------------------------------------------------------------------------- */
const removalModeSelect = document.getElementById('removalMode');
const autoTimeWrapper = document.getElementById('autoTimeWrapper');
const autoTimeInput = document.getElementById('autoTimeInput');
const toggleWheel2Btn = document.getElementById('toggleWheel2Btn');
const spinAllBtn = document.getElementById('spinAllBtn');
const unit2 = document.getElementById('unit2');

// Modal de Resultados
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const resultsContainer = document.getElementById('resultsContainer');
const modalTimerElem = document.getElementById('modalTimer');
const closeAllBtn = document.getElementById('closeAllBtn');

// Modal de Confirmación
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmMessage = document.getElementById('confirmMessage');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const acceptConfirmBtn = document.getElementById('acceptConfirmBtn');
let onConfirmCallback = null;

// Modal de Importación / Limpieza
const cleanerOverlay = document.getElementById('cleanerOverlay');
const cleanerTitle = document.getElementById('cleanerTitle');
const rawInput = document.getElementById('rawInput');
const invertNameOrder = document.getElementById('invertNameOrder');
const toTitleCase = document.getElementById('toTitleCase');
const cleanerFeedback = document.getElementById('cleanerFeedback');
const cancelCleanerBtn = document.getElementById('cancelCleanerBtn');
const processCleanerBtn = document.getElementById('processCleanerBtn');
let targetWheelForImport = null;

// Control de estados de giro y tiempo
let autoDismissTimeout = null;
let autoDismissInterval = null;
let pendingWinners = [];
let isDualSpinning = false;
let wheel2Active = false;

/* --------------------------------------------------------------------------
   UTILIDADES DE TEXTO Y LIMPIEZA
   -------------------------------------------------------------------------- */

/**
 * Convierte un texto a formato Título (Capitalize en cada palabra)
 * @param {string} str - Texto original
 * @returns {string} Texto formateado
 */
function capitalizeWord(str) {
    return str.toLowerCase().replace(/(?:^|\s|[-'])\S/g, (char) => char.toUpperCase());
}

/**
 * Extrae nombres de estudiantes a partir de volcados de plataformas educativas.
 * Filtra correos institucionales, faltas, notas y botones de navegación.
 *
 * @param {string} rawText - Texto copiado en bruto
 * @param {boolean} shouldInvert - Si debe invertir de 'APELLIDOS, NOMBRES' a 'Nombres Apellidos'
 * @param {boolean} shouldTitleCase - Si debe formatear a minúsculas con mayúscula inicial
 * @returns {string[]} Lista de nombres filtrados
 */
function extractNamesFromRawText(rawText, shouldInvert, shouldTitleCase) {
    const lines = rawText.split('\n');
    const foundNames = [];
    const seen = new Set();

    // Vocabulario común de la interfaz escolar a descartar
    const noiseWords = [
        'FALTA', 'FALTAS', 'PRESENTE', 'NOTAS', 'ESTUDIANTE',
        'CALIFICACIONES', 'ASISTENCIA', 'BUENAS TARDES', 'DOCENTE',
        'GRUPO', 'TECNOLOGÍA'
    ];

    for (let line of lines) {
        // 1. Remueve comillas, viñetas, guiones y tabulaciones invisibles
        let clean = line
            .replace(/["'“”«»]/g, '')
            .replace(/^[\s\-\*•—\t]+/, '')
            .trim();

        // 2. Descarta líneas vacías, correos o números de faltas
        if (!clean || clean.includes('@') || /^\d+/.test(clean)) continue;

        // 3. Debe poseer una coma que separe apellidos de nombres
        if (!clean.includes(',')) continue;

        // 4. Descarta términos que coincidan con la navegación
        let upperClean = clean.toUpperCase();
        if (noiseWords.some((noise) => upperClean.includes(noise))) continue;

        // 5. Separa en [apellidos, nombres]
        let commaIndex = clean.indexOf(',');
        let part1 = clean.substring(0, commaIndex).trim();
        let part2 = clean.substring(commaIndex + 1).trim();

        if (part1.length < 2 || part2.length < 2) continue;

        // 6. Verifica que la gran mayoría sean caracteres en mayúsculas
        let lettersOnly = (part1 + part2).replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
        if (lettersOnly.length < 4) continue;

        let upperCount = 0;
        for (let ch of lettersOnly) {
            if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) upperCount++;
        }

        if (upperCount / lettersOnly.length >= 0.8) {
            let finalName = shouldInvert ? `${part2} ${part1}` : `${part1}, ${part2}`;

            if (shouldTitleCase) {
                finalName = capitalizeWord(finalName);
            }

            if (!seen.has(finalName)) {
                seen.add(finalName);
                foundNames.push(finalName);
            }
        }
    }

    return foundNames;
}

/* --------------------------------------------------------------------------
   MOTOR DE SÍNTESIS DE VOZ (SPEECH SYNTHESIS)
   -------------------------------------------------------------------------- */

/**
 * Normaliza signos de puntuación del prefijo para forzar una pausa
 * prosódica natural en lugar de que el motor lea "dos puntos" o deletree.
 *
 * @param {string} rawPrefix - Prefijo configurado por el usuario
 * @param {string} winner - Nombre o tema seleccionado
 * @returns {string} Frase prosódicamente limpia
 */
function buildSpeechPhrase(rawPrefix, winner) {
    if (!rawPrefix || !rawPrefix.trim()) {
        return winner;
    }
    let cleanPrefix = rawPrefix.trim().replace(/[:\-\/,]+\$/, '').trim();
    return `${cleanPrefix}, ${winner}`;
}

/**
 * Encola la lectura por voz de una o varias frases en español
 * @param {string[]} phrases - Arreglo de frases a reproducir
 */
function speakSequence(phrases) {
    if (!('speechSynthesis' in window) || phrases.length === 0) return;
    window.speechSynthesis.cancel();

    phrases.forEach((phrase) => {
        if (!phrase.trim()) return;
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.lang = 'es-ES';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    });
}

/* --------------------------------------------------------------------------
   GESTIÓN DE MODALES AUXILIARES
   -------------------------------------------------------------------------- */

/**
 * Muestra el modal de confirmación visual en lugar de alert/confirm nativo
 */
function showCustomConfirm(message, onAccept) {
    confirmMessage.textContent = message;
    onConfirmCallback = onAccept;
    confirmOverlay.classList.add('active');
}

cancelConfirmBtn.addEventListener('click', () => {
    confirmOverlay.classList.remove('active');
    onConfirmCallback = null;
});

acceptConfirmBtn.addEventListener('click', () => {
    if (onConfirmCallback) onConfirmCallback();
    confirmOverlay.classList.remove('active');
    onConfirmCallback = null;
});

/**
 * Abre el modal para importar y limpiar texto sucio
 */
function openCleanerModal(wheelInstance) {
    targetWheelForImport = wheelInstance;
    cleanerTitle.textContent = `Importar en ${wheelInstance.title}`;
    rawInput.value = '';
    cleanerFeedback.style.display = 'none';
    cleanerOverlay.classList.add('active');
    rawInput.focus();
}

cancelCleanerBtn.addEventListener('click', () => {
    cleanerOverlay.classList.remove('active');
    targetWheelForImport = null;
});

processCleanerBtn.addEventListener('click', () => {
    if (!targetWheelForImport) return;

    const extracted = extractNamesFromRawText(
        rawInput.value,
        invertNameOrder.checked,
        toTitleCase.checked
    );

    if (extracted.length === 0) {
        cleanerFeedback.style.display = 'block';
        cleanerFeedback.style.color = '#ef4444';
        cleanerFeedback.textContent = '❌ No se detectaron nombres. Asegúrate de incluir comas (ej. APELLIDOS, NOMBRES).';
        return;
    }

    targetWheelForImport.input.value = extracted.join('\n');
    targetWheelForImport.saveToStorage();
    targetWheelForImport.updateNames();

    cleanerOverlay.classList.remove('active');
    targetWheelForImport = null;
});

/* --------------------------------------------------------------------------
   CLASE PRINCIPAL: WHEEL (RULETA INDIVIDUAL)
   -------------------------------------------------------------------------- */
class Wheel {
    constructor(id, canvasId, inputId, counterId, statusId, prefixId, spinBtnId, clearBtnId, importBtnId, title, defaultText, defaultPrefix) {
        this.id = id;
        this.title = title;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.input = document.getElementById(inputId);
        this.counter = document.getElementById(counterId);
        this.status = document.getElementById(statusId);
        this.prefixInput = document.getElementById(prefixId);
        this.spinBtn = document.getElementById(spinBtnId);
        this.clearBtn = document.getElementById(clearBtnId);
        this.importBtn = document.getElementById(importBtnId);

        // Claves independientes para persistencia
        this.storageKeyNames = `ruleta_nombres_${id}`;
        this.storageKeyPrefix = `ruleta_prefijo_${id}`;
        this.defaultText = defaultText;
        this.defaultPrefix = defaultPrefix;

        this.names = [];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.selectedWinnerIndex = -1;

        this.init();
    }

    /**
     * Carga estados iniciales y registra eventos del DOM
     */
    init() {
        // Restaurar desde localStorage o asignar predeterminado
        const savedNames = localStorage.getItem(this.storageKeyNames);
        this.input.value = (savedNames !== null) ? savedNames : this.defaultText;

        const savedPrefix = localStorage.getItem(this.storageKeyPrefix);
        this.prefixInput.value = (savedPrefix !== null) ? savedPrefix : this.defaultPrefix;

        // Escuchadores de eventos
        this.input.addEventListener('input', () => {
            this.saveToStorage();
            this.updateNames();
        });

        this.prefixInput.addEventListener('input', () => {
            localStorage.setItem(this.storageKeyPrefix, this.prefixInput.value);
        });

        this.clearBtn.addEventListener('click', () => {
            showCustomConfirm(`¿Seguro que deseas vaciar la lista de ${this.title}?`, () => {
                this.input.value = '';
                this.saveToStorage();
                this.updateNames();
            });
        });

        this.importBtn.addEventListener('click', () => {
            openCleanerModal(this);
        });

        this.spinBtn.addEventListener('click', () => this.spin());

        // Giro al hacer clic directamente sobre el disco
        this.canvas.addEventListener('click', () => {
            if (!this.isSpinning && this.names.length >= 2) {
                this.spin();
            }
        });

        this.updateNames();
    }

    /**
     * Guarda la lista actual en localStorage con retroalimentación visual
     */
    saveToStorage() {
        localStorage.setItem(this.storageKeyNames, this.input.value);
        this.status.textContent = 'Guardado';
        this.status.style.opacity = '1';
        setTimeout(() => {
            this.status.style.opacity = '0.5';
        }, 1200);
    }

    /**
     * Retorna los nombres limpios ingresados en el textarea
     */
    getNames() {
        return this.input.value
            .split('\n')
            .map((n) => n.trim())
            .filter((n) => n.length > 0);
    }

    /**
     * Sincroniza nombres, actualiza contadores y redibuja
     */
    updateNames() {
        this.names = this.getNames();
        this.counter.textContent = `Total: ${this.names.length}`;
        this.spinBtn.disabled = this.names.length < 2 || this.isSpinning;
        this.draw();
        checkGlobalSpinState();
    }

    /**
     * Dibuja los sectores circulares y textos en el Canvas
     */
    draw() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.canvas.width / 2 - 10;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Estado vacío
        if (this.names.length === 0) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fill();
            this.ctx.strokeStyle = '#334155';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Sin elementos suficientes', centerX, centerY);
            return;
        }

        const arcSize = (2 * Math.PI) / this.names.length;

        // Dibujo de sectores
        for (let i = 0; i < this.names.length; i++) {
            const startAngle = this.currentAngle + i * arcSize;
            const endAngle = startAngle + arcSize;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.fillStyle = SECTOR_COLORS[i % SECTOR_COLORS.length];
            this.ctx.fill();
            this.ctx.strokeStyle = '#0f172a';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Renderizado del texto del sector
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + arcSize / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 13px sans-serif';
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = 4;

            let label = this.names[i];
            if (label.length > 15) label = label.substring(0, 13) + '...';
            this.ctx.fillText(label, radius - 20, 5);
            this.ctx.restore();
        }

        // Eje circular central
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    /**
     * Ejecuta la animación de rotación con desaceleración cúbica (ease-out)
     */
    spin() {
        if (this.isSpinning || this.names.length < 2) return;

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        checkGlobalSpinState();

        const fullSpins = 5 + Math.floor(Math.random() * 4);
        const randomExtraAngle = Math.random() * (2 * Math.PI);
        const totalRotation = fullSpins * 2 * Math.PI + randomExtraAngle;

        const duration = 4000;
        const startAngleInitial = this.currentAngle;
        const startTime = performance.now();

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Curva de desaceleración cúbica
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.currentAngle = startAngleInitial + totalRotation * easeOut;

            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finishSpin();
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Determina matemáticamente qué sector quedó bajo la aguja superior (270 grados)
     */
    finishSpin() {
        this.isSpinning = false;
        const arcSize = (2 * Math.PI) / this.names.length;

        // Aguja situada en la parte superior: 1.5 * PI (270°)
        const pointerAngle = 1.5 * Math.PI;
        const normalizedAngle = (this.currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        let relativeAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);

        this.selectedWinnerIndex = Math.floor(relativeAngle / arcSize);
        const winner = this.names[this.selectedWinnerIndex];

        handleSpinFinished(this, winner);
        this.updateNames();
    }

    /**
     * Elimina un elemento seleccionado de la lista y actualiza el almacenamiento
     * @param {number} idx - Índice del elemento a remover
     */
    removeWinnerIndex(idx) {
        if (idx >= 0 && idx < this.names.length) {
            this.names.splice(idx, 1);
            this.input.value = this.names.join('\n');
            this.saveToStorage();
            this.updateNames();
        }
    }
}

/* --------------------------------------------------------------------------
   INSTANCIACIÓN DE LAS RULETAS
   -------------------------------------------------------------------------- */
const defaultList1 = 'Danna Sofia Amaris Camargo\nIvanna Arias Terán\nHannah Lucia Ariza Navarro\nYorgelis Arrieta Garcia\nSara Sofia Avila Cardenas';
const defaultList2 = 'Tema 1\nTema 2\nTema 3\nTema 4';

const wheel1 = new Wheel(1, 'canvas1', 'input1', 'counter1', 'saveStatus1', 'voicePrefix1', 'spinBtn1', 'clearBtn1', 'importBtn1', 'Ruleta 1', defaultList1, 'Turno de');
const wheel2 = new Wheel(2, 'canvas2', 'input2', 'counter2', 'saveStatus2', 'voicePrefix2', 'spinBtn2', 'clearBtn2', 'importBtn2', 'Ruleta 2', defaultList2, 'Tema');

/* --------------------------------------------------------------------------
   CONTROL GLOBAL Y SINCRONIZACIÓN DUAL
   -------------------------------------------------------------------------- */

/**
 * Valida si el botón "Girar Ambas" puede habilitarse
 */
function checkGlobalSpinState() {
    if (!wheel2Active || !wheel1 || !wheel2) {
        spinAllBtn.disabled = true;
        return;
    }
    const canSpin1 = wheel1.names.length >= 2 && !wheel1.isSpinning;
    const canSpin2 = wheel2.names.length >= 2 && !wheel2.isSpinning;
    spinAllBtn.disabled = !(canSpin1 && canSpin2);
}

/**
 * Maneja el fin de giro evitando colisiones en giros dobles
 */
function handleSpinFinished(wheelInstance, winner) {
    pendingWinners.push({
        wheel: wheelInstance,
        winner: winner,
        index: wheelInstance.selectedWinnerIndex
    });

    // Si ambas estaban girando y la otra aún no frena, esperamos
    if (isDualSpinning && (wheel1.isSpinning || wheel2.isSpinning)) {
        return;
    }

    isDualSpinning = false;
    renderUnifiedModal();
}

/**
 * Muestra los resultados en el modal unificado y gestiona el modo de eliminación
 */
function renderUnifiedModal() {
    resultsContainer.innerHTML = '';
    clearInterval(autoDismissInterval);
    clearTimeout(autoDismissTimeout);
    modalTimerElem.textContent = '';

    const mode = removalModeSelect.value;
    const speechPhrases = [];

    pendingWinners.forEach((item, i) => {
        const spokenPhrase = buildSpeechPhrase(item.wheel.prefixInput.value, item.winner);
        speechPhrases.push(spokenPhrase);

        const card = document.createElement('div');
        card.className = 'winner-card';
        card.id = `winner-card-${i}`;

        let actionHtml = '';
        if (mode === 'manual') {
            actionHtml = `
        <div class="winner-card-actions">
          <button class="btn btn-keep" onclick="keepItem(${i})">Mantener</button>
          <button class="btn btn-remove" onclick="removeItem(${i})">Eliminar</button>
        </div>
      `;
        } else if (mode === 'keep') {
            actionHtml = `<div style="font-size:0.75rem; color:#94a3b8;">Se conserva en lista</div>`;
        } else if (mode === 'auto') {
            actionHtml = `<div style="font-size:0.75rem; color:#f59e0b;">Se eliminará automáticamente</div>`;
        }

        card.innerHTML = `
      <div class="winner-card-title">${item.wheel.title}</div>
      <div class="winner-card-name">${item.winner}</div>
      ${actionHtml}
    `;
        resultsContainer.appendChild(card);
    });

    modalTitle.textContent = pendingWinners.length > 1
        ? '¡Resultados del Giro Simultáneo!'
        : '¡Resultado Seleccionado!';
    modalOverlay.classList.add('active');

    // Reproducir voz
    speakSequence(speechPhrases);

    // Modo eliminación automática con temporizador visible
    if (mode === 'auto') {
        let waitSeconds = parseInt(autoTimeInput.value, 10);
        if (isNaN(waitSeconds) || waitSeconds < 2) waitSeconds = 4;

        let remaining = waitSeconds;
        modalTimerElem.textContent = `Eliminando automáticamente en ${remaining}s...`;

        autoDismissInterval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                modalTimerElem.textContent = `Eliminando automáticamente en ${remaining}s...`;
            }
        }, 1000);

        autoDismissTimeout = setTimeout(() => {
            clearInterval(autoDismissInterval);
            pendingWinners.forEach((item) => {
                item.wheel.removeWinnerIndex(item.index);
            });
            closeModal();
        }, waitSeconds * 1000);
    }
}

// Acciones manuales de los botones dentro del modal
window.removeItem = function (index) {
    const item = pendingWinners[index];
    if (item) {
        item.wheel.removeWinnerIndex(item.index);
        const card = document.getElementById(`winner-card-${index}`);
        if (card) {
            card.style.opacity = '0.4';
            card.querySelector('.winner-card-actions').innerHTML =
                '<span style="color:#ef4444;font-size:0.8rem;font-weight:bold;">Eliminado</span>';
        }
    }
};

window.keepItem = function (index) {
    const card = document.getElementById(`winner-card-${index}`);
    if (card) {
        card.querySelector('.winner-card-actions').innerHTML =
            '<span style="color:#10b981;font-size:0.8rem;font-weight:bold;">Conservado</span>';
    }
};

function closeModal() {
    clearInterval(autoDismissInterval);
    clearTimeout(autoDismissTimeout);
    modalOverlay.classList.remove('active');
    pendingWinners = [];
    isDualSpinning = false;
    checkGlobalSpinState();
}

closeAllBtn.addEventListener('click', closeModal);

/* --------------------------------------------------------------------------
   PERSISTENCIA DE CONFIGURACIONES GLOBALES
   -------------------------------------------------------------------------- */

/**
 * Control de visibilidad de la Ruleta 2
 */
function applyWheel2Visibility(active) {
    wheel2Active = active;
    localStorage.setItem('ruleta_visible_ruleta_2', active ? 'true' : 'false');

    if (active) {
        unit2.classList.remove('hidden');
        spinAllBtn.classList.remove('hidden');
        toggleWheel2Btn.textContent = '✕ Quitar Ruleta 2';
        wheel2.draw();
    } else {
        unit2.classList.add('hidden');
        spinAllBtn.classList.add('hidden');
        toggleWheel2Btn.textContent = '+ Añadir Segunda Ruleta';
    }
    checkGlobalSpinState();
}

toggleWheel2Btn.addEventListener('click', () => {
    applyWheel2Visibility(!wheel2Active);
});

// Restaurar visibilidad de Ruleta 2
if (localStorage.getItem('ruleta_visible_ruleta_2') === 'true') {
    applyWheel2Visibility(true);
}

/**
 * Control del modo de eliminación y temporizador
 */
function updateModeVisibility() {
    if (removalModeSelect.value === 'auto') {
        autoTimeWrapper.classList.remove('hidden');
    } else {
        autoTimeWrapper.classList.add('hidden');
    }
}

const savedMode = localStorage.getItem('ruleta_config_mode');
if (savedMode) {
    removalModeSelect.value = savedMode;
}
updateModeVisibility();

removalModeSelect.addEventListener('change', () => {
    localStorage.setItem('ruleta_config_mode', removalModeSelect.value);
    updateModeVisibility();
});

const savedWaitTime = localStorage.getItem('ruleta_auto_time');
if (savedWaitTime) {
    autoTimeInput.value = savedWaitTime;
}

autoTimeInput.addEventListener('input', () => {
    let val = parseInt(autoTimeInput.value, 10);
    if (val > 0) {
        localStorage.setItem('ruleta_auto_time', val);
    }
});

/**
 * Disparador del Giro Simultáneo
 */
spinAllBtn.addEventListener('click', () => {
    if (wheel1.names.length >= 2 && wheel2.names.length >= 2 && !wheel1.isSpinning && !wheel2.isSpinning) {
        isDualSpinning = true;
        pendingWinners = [];
        wheel1.spin();
        wheel2.spin();
    }
});