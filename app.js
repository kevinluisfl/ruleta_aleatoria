/**
 * ==============================================================================
 * RULETA DE PARTICIPACIÓN ESCOLAR - MOTOR PRINCIPAL
 * ==============================================================================
 * Sistema interactivo para la dinamización del aula de clases con soporte
 * para doble ruleta sincronizada, síntesis de voz configurable, efectos de sonido
 * por Web Audio API, modo claro/oscuro, soporte bilingüe (ES/EN) y persistencia.
 */

// Paleta de colores vibrantes para los sectores del Canvas
const SECTOR_COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#f43f5e',
    '#0ea5e9', '#8b5cf6', '#ec4899', '#14b8a6'
];

/* --------------------------------------------------------------------------
   0. INTERNACIONALIZACIÓN (ES / EN) Y TEMA CLARO / OSCURO
   -------------------------------------------------------------------------- */
const I18N = {
    es: {
        mainTitle: "Ruleta de Participación",
        badgeInteractive: "Interactivo",
        mainSubtitle: "Organizador y selector interactivo para el aula de clase",
        btnSettings: "Configuración",
        settingsTitle: "Ajustes de Voz y Sonido",
        btnTestVoice: "Probar",
        testVoiceSample: " Ruleta lista para participar",
        labelVoiceRate: "Velocidad de habla",
        rateSlow: "Lento (0.75x)",
        rateNormal: "Normal (1.0x)",
        rateFast: "Rápido (1.25x)",
        labelNarrator: "Narrador del navegador",
        defaultNarrator: "Predeterminado del navegador",
        labelMuteNarrator: "Silenciar narrador",
        labelWheelSound: "Sonido de ruleta al girar",
        labelRemovalMode: "Al seleccionar:",
        modeManual: "Preguntar (Manual)",
        modeAuto: "Eliminar automático",
        modeKeep: "Mantener siempre",
        labelAutoWait: "Espera:",
        labelSeconds: "seg",
        addWheel2: "+ Añadir Segunda Ruleta",
        removeWheel2: "✕ Quitar Ruleta 2",
        btnSpinAll: "Girar Ambas a la Vez",
        wheel1Title: "Ruleta 1",
        wheel2Title: "Ruleta 2",
        btnImport: "Pegar de Plataforma",
        btnClear: "Vaciar",
        labelPrefix: "Anunciar con:",
        defaultPrefix1: "Turno de",
        defaultPrefix2: "Tema",
        placeholderInput1: "Pega los nombres aquí...",
        placeholderInput2: "Tema 1\nTema 2\nTema 3\nTema 4",
        statusSynced: "Sincronizado",
        statusSaved: "Guardado",
        totalPrefix: "Total:",
        canvasEmpty: "Sin elementos suficientes",
        canvasTooltip: "Haz clic sobre la ruleta para girar",
        btnSpin1: "¡Girar Ruleta 1!",
        btnSpin2: "¡Girar Ruleta 2!",
        modalSingleTitle: "¡Resultado Seleccionado!",
        modalDualTitle: "¡Resultados del Giro Simultáneo!",
        btnKeep: "Mantener",
        btnRemove: "Eliminar",
        statusKeptInList: "Se conserva en lista",
        statusAutoRemove: "Se eliminará automáticamente",
        statusRemovedBadge: "Eliminado",
        statusKeptBadge: "Conservado",
        timerRemovingIn: "Eliminando automáticamente en",
        btnCloseModal: "Listo / Continuar",
        confirmTitle: "¿Vaciar lista?",
        confirmClearWheel: "¿Seguro que deseas vaciar la lista de",
        btnCancel: "Cancelar",
        btnAcceptClear: "Sí, vaciar",
        cleanerImportIn: "Importar en",
        cleanerDesc: "Pega abajo el texto copiado de la plataforma (incluso con notas, correos y faltas). Se extraerán los nombres automáticamente:",
        cleanerPlaceholder: "Pega aquí todo el texto copiado de la plataforma...",
        labelInvertOrder: "Invertir a formato natural (\"Danna Sofia Amaris Camargo\") para pronunciación fluida",
        labelTitleCase: "Convertir a tipo Título (Mayúsculas y minúsculas)",
        btnProcessCleaner: "Procesar e Insertar",
        cleanerErrorEmpty: "❌ No se detectaron nombres. Asegúrate de incluir comas (ej. APELLIDOS, NOMBRES)."
    },
    en: {
        mainTitle: "Participation Wheel",
        badgeInteractive: "Interactive",
        mainSubtitle: "Interactive classroom selector and activity organizer",
        btnSettings: "Settings",
        settingsTitle: "Voice & Sound Settings",
        btnTestVoice: "Test",
        testVoiceSample: " Wheel ready for the classroom",
        labelVoiceRate: "Speech speed",
        rateSlow: "Slow (0.75x)",
        rateNormal: "Normal (1.0x)",
        rateFast: "Fast (1.25x)",
        labelNarrator: "Browser narrator",
        defaultNarrator: "System default voice",
        labelMuteNarrator: "Mute narrator",
        labelWheelSound: "Wheel spinning sound",
        labelRemovalMode: "On selection:",
        modeManual: "Ask (Manual)",
        modeAuto: "Auto remove",
        modeKeep: "Always keep",
        labelAutoWait: "Wait:",
        labelSeconds: "sec",
        addWheel2: "+ Add Second Wheel",
        removeWheel2: "✕ Remove Wheel 2",
        btnSpinAll: "Spin Both Together",
        wheel1Title: "Wheel 1",
        wheel2Title: "Wheel 2",
        btnImport: "Paste from Platform",
        btnClear: "Clear",
        labelPrefix: "Announce with:",
        defaultPrefix1: "Turn for",
        defaultPrefix2: "Topic",
        placeholderInput1: "Paste names here...",
        placeholderInput2: "Topic 1\nTopic 2\nTopic 3\nTopic 4",
        statusSynced: "Synced",
        statusSaved: "Saved",
        totalPrefix: "Total:",
        canvasEmpty: "Not enough items",
        canvasTooltip: "Click on the wheel to spin",
        btnSpin1: "Spin Wheel 1!",
        btnSpin2: "Spin Wheel 2!",
        modalSingleTitle: "Selected Result!",
        modalDualTitle: "Simultaneous Spin Results!",
        btnKeep: "Keep",
        btnRemove: "Remove",
        statusKeptInList: "Kept in the list",
        statusAutoRemove: "Will be removed automatically",
        statusRemovedBadge: "Removed",
        statusKeptBadge: "Kept",
        timerRemovingIn: "Automatically removing in",
        btnCloseModal: "Done / Continue",
        confirmTitle: "Clear list?",
        confirmClearWheel: "Are you sure you want to clear the list for",
        btnCancel: "Cancel",
        btnAcceptClear: "Yes, clear",
        cleanerImportIn: "Import into",
        cleanerDesc: "Paste the text copied from your school platform below (even with grades, emails, and absences). Names will be extracted automatically:",
        cleanerPlaceholder: "Paste all text copied from the platform here...",
        labelInvertOrder: "Invert to natural order (\"Danna Sofia Amaris Camargo\") for fluent pronunciation",
        labelTitleCase: "Convert to Title Case",
        btnProcessCleaner: "Process & Insert",
        cleanerErrorEmpty: "❌ No names detected. Make sure lines include commas (e.g. LASTNAME, FIRSTNAME)."
    }
};

let currentLang = localStorage.getItem('ruleta_lang') || 'es';
let currentTheme = localStorage.getItem('ruleta_theme') || 'light';

// Configuración de Audio y Voz con persistencia
let audioConfig = {
    rate: parseFloat(localStorage.getItem('ruleta_voice_rate')) || 0.95,
    voiceURI: localStorage.getItem('ruleta_voice_uri') || 'default',
    muteNarrator: localStorage.getItem('ruleta_mute_narrator') === 'true',
    wheelSound: localStorage.getItem('ruleta_wheel_sound') !== 'false' // true por defecto
};

function t(key) {
    return I18N[currentLang][key] || I18N.es[key] || key;
}

/* --------------------------------------------------------------------------
   MOTOR ACÚSTICO NATIVO (WEB AUDIO API PARA TICKS DE LA RULETA)
   -------------------------------------------------------------------------- */
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/**
 * Reproduce un clic mecánico corto cuando una línea divisoria pasa por la aguja
 */
function playWheelTickSound() {
    if (!audioConfig.wheelSound) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pulso percusivo corto de madera/plástico
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.028);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
}

/**
 * Reproduce un acorde suave de campana al finalizar el giro
 */
function playWinnerChimeSound() {
    if (!audioConfig.wheelSound) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // Do - Mi - Sol
    notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    });
}

/* --------------------------------------------------------------------------
   REFERENCIAS AL DOM
   -------------------------------------------------------------------------- */
const removalModeSelect = document.getElementById('removalMode');
const autoTimeWrapper = document.getElementById('autoTimeWrapper');
const autoTimeInput = document.getElementById('autoTimeInput');
const toggleWheel2Btn = document.getElementById('toggleWheel2Btn');
const spinAllBtn = document.getElementById('spinAllBtn');
const unit2 = document.getElementById('unit2');

// Controles de Cabecera y Menú Configuración
const btnLangToggle = document.getElementById('btnLangToggle');
const langLabel = document.getElementById('langLabel');
const btnThemeToggle = document.getElementById('btnThemeToggle');
const themeIcon = document.getElementById('themeIcon');
const btnSettingsToggle = document.getElementById('btnSettingsToggle');
const settingsMenu = document.getElementById('settingsMenu');
const voiceRateSelect = document.getElementById('voiceRateSelect');
const voiceNarratorSelect = document.getElementById('voiceNarratorSelect');
const muteNarratorToggle = document.getElementById('muteNarratorToggle');
const wheelSoundToggle = document.getElementById('wheelSoundToggle');
const btnTestVoice = document.getElementById('btnTestVoice');

// Modal de Resultados
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const resultsContainer = document.getElementById('resultsContainer');
const modalTimerElem = document.getElementById('modalTimer');
const closeAllBtn = document.getElementById('closeAllBtn');

// Modal de Confirmación
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmTitle = document.getElementById('confirmTitle');
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
let availableVoices = [];

/* --------------------------------------------------------------------------
   UTILIDADES DE TEXTO Y LIMPIEZA
   -------------------------------------------------------------------------- */
function capitalizeWord(str) {
    return str.toLowerCase().replace(/(?:^|\s|[-'])\S/g, (char) => char.toUpperCase());
}

function extractNamesFromRawText(rawText, shouldInvert, shouldTitleCase) {
    const lines = rawText.split('\n');
    const foundNames = [];
    const seen = new Set();

    const noiseWords = [
        'FALTA', 'FALTAS', 'PRESENTE', 'NOTAS', 'ESTUDIANTE',
        'CALIFICACIONES', 'ASISTENCIA', 'BUENAS TARDES', 'DOCENTE',
        'GRUPO', 'TECNOLOGÍA'
    ];

    for (let line of lines) {
        let clean = line
            .replace(/["'“”«»]/g, '')
            .replace(/^[\s\-\*•—\t]+/, '')
            .trim();

        if (!clean || clean.includes('@') || /^\d+/.test(clean)) continue;
        if (!clean.includes(',')) continue;

        let upperClean = clean.toUpperCase();
        if (noiseWords.some((noise) => upperClean.includes(noise))) continue;

        let commaIndex = clean.indexOf(',');
        let part1 = clean.substring(0, commaIndex).trim();
        let part2 = clean.substring(commaIndex + 1).trim();

        if (part1.length < 2 || part2.length < 2) continue;

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
   MOTOR DE SÍNTESIS DE VOZ (SPEECH SYNTHESIS CONFIGURABLE)
   -------------------------------------------------------------------------- */
function populateVoiceList() {
    if (!('speechSynthesis' in window)) return;
    availableVoices = window.speechSynthesis.getVoices();

    const currentSelection = audioConfig.voiceURI;
    voiceNarratorSelect.innerHTML = `<option value="default">${t('defaultNarrator')}</option>`;

    // Ordenar voces priorizando el idioma actual (es o en)
    const sortedVoices = [...availableVoices].sort((a, b) => {
        const aMatches = a.lang.toLowerCase().startsWith(currentLang);
        const bMatches = b.lang.toLowerCase().startsWith(currentLang);
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return a.name.localeCompare(b.name);
    });

    sortedVoices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.voiceURI;
        option.textContent = `${voice.name} (${voice.lang})`;
        if (voice.voiceURI === currentSelection) {
            option.selected = true;
        }
        voiceNarratorSelect.appendChild(option);
    });
}

if ('speechSynthesis' in window) {
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
}

function buildSpeechPhrase(rawPrefix, winner) {
    if (!rawPrefix || !rawPrefix.trim()) {
        return winner;
    }
    let cleanPrefix = rawPrefix.trim().replace(/[:\-\/,]+\$/, '').trim();
    return `${cleanPrefix}, ${winner}`;
}

function speakSequence(phrases, forcePlay = false) {
    if (!('speechSynthesis' in window) || phrases.length === 0) return;
    if (audioConfig.muteNarrator && !forcePlay) return;

    window.speechSynthesis.cancel();

    const selectedVoiceObj = availableVoices.find(v => v.voiceURI === audioConfig.voiceURI);

    phrases.forEach((phrase) => {
        if (!phrase.trim()) return;
        const utterance = new SpeechSynthesisUtterance(phrase);

        if (selectedVoiceObj) {
            utterance.voice = selectedVoiceObj;
            utterance.lang = selectedVoiceObj.lang;
        } else {
            utterance.lang = currentLang === 'es' ? 'es-ES' : 'en-US';
        }

        utterance.rate = audioConfig.rate || 0.95;
        window.speechSynthesis.speak(utterance);
    });
}

/* --------------------------------------------------------------------------
   GESTIÓN DE MODALES AUXILIARES
   -------------------------------------------------------------------------- */
function showCustomConfirm(message, onAccept) {
    confirmTitle.textContent = t('confirmTitle');
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

function openCleanerModal(wheelInstance) {
    targetWheelForImport = wheelInstance;
    cleanerTitle.textContent = `${t('cleanerImportIn')} ${wheelInstance.getDisplayTitle()}`;
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
        cleanerFeedback.textContent = t('cleanerErrorEmpty');
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
    constructor(id, canvasId, inputId, counterId, statusId, prefixId, spinBtnId, clearBtnId, importBtnId, defaultText, defaultPrefix) {
        this.id = id;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.input = document.getElementById(inputId);
        this.counter = document.getElementById(counterId);
        this.status = document.getElementById(statusId);
        this.prefixInput = document.getElementById(prefixId);
        this.spinBtn = document.getElementById(spinBtnId);
        this.clearBtn = document.getElementById(clearBtnId);
        this.importBtn = document.getElementById(importBtnId);

        this.storageKeyNames = `ruleta_nombres_${id}`;
        this.storageKeyPrefix = `ruleta_prefijo_${id}`;
        this.defaultText = defaultText;
        this.defaultPrefix = defaultPrefix;

        this.names = [];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.selectedWinnerIndex = -1;
        this.lastTickSector = -1;

        this.init();
    }

    getDisplayTitle() {
        return this.id === 1 ? t('wheel1Title') : t('wheel2Title');
    }

    init() {
        const savedNames = localStorage.getItem(this.storageKeyNames);
        this.input.value = (savedNames !== null) ? savedNames : this.defaultText;

        const savedPrefix = localStorage.getItem(this.storageKeyPrefix);
        this.prefixInput.value = (savedPrefix !== null) ? savedPrefix : this.defaultPrefix;

        this.input.addEventListener('input', () => {
            this.saveToStorage();
            this.updateNames();
        });

        this.prefixInput.addEventListener('input', () => {
            localStorage.setItem(this.storageKeyPrefix, this.prefixInput.value);
        });

        this.clearBtn.addEventListener('click', () => {
            showCustomConfirm(`${t('confirmClearWheel')} ${this.getDisplayTitle()}?`, () => {
                this.input.value = '';
                this.saveToStorage();
                this.updateNames();
            });
        });

        this.importBtn.addEventListener('click', () => {
            openCleanerModal(this);
        });

        this.spinBtn.addEventListener('click', () => this.spin());

        this.canvas.addEventListener('click', () => {
            if (!this.isSpinning && this.names.length >= 2) {
                this.spin();
            }
        });

        this.updateNames();
    }

    saveToStorage() {
        localStorage.setItem(this.storageKeyNames, this.input.value);
        this.status.textContent = t('statusSaved');
        this.status.style.opacity = '1';
        setTimeout(() => {
            this.status.style.opacity = '0.55';
        }, 1200);
    }

    getNames() {
        return this.input.value
            .split('\n')
            .map((n) => n.trim())
            .filter((n) => n.length > 0);
    }

    updateNames() {
        this.names = this.getNames();
        this.counter.textContent = `${t('totalPrefix')} ${this.names.length}`;
        this.spinBtn.disabled = this.names.length < 2 || this.isSpinning;
        this.draw();
        checkGlobalSpinState();
    }

    draw() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = this.canvas.width / 2 - 10;
        const isDark = currentTheme === 'dark';

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Estado vacío adaptado al tema claro/oscuro
        if (this.names.length === 0) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
            this.ctx.fill();
            this.ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '600 14px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(t('canvasEmpty'), centerX, centerY);
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
            this.ctx.strokeStyle = isDark ? '#0f172a' : '#ffffff';
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();

            // Renderizado del texto del sector
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + arcSize / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 13px Inter, sans-serif';
            this.ctx.shadowColor = 'rgba(0,0,0,0.45)';
            this.ctx.shadowBlur = 4;

            let label = this.names[i];
            if (label.length > 16) label = label.substring(0, 14) + '...';
            this.ctx.fillText(label, radius - 20, 5);
            this.ctx.restore();
        }

        // Eje circular central
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
        this.ctx.fillStyle = isDark ? '#0f172a' : '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#4f46e5';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    spin() {
        if (this.isSpinning || this.names.length < 2) return;

        // Desbloquear contexto de audio tras gesto del usuario
        getAudioContext();

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.lastTickSector = -1;
        checkGlobalSpinState();

        const fullSpins = 5 + Math.floor(Math.random() * 4);
        const randomExtraAngle = Math.random() * (2 * Math.PI);
        const totalRotation = fullSpins * 2 * Math.PI + randomExtraAngle;

        const duration = 4000;
        const startAngleInitial = this.currentAngle;
        const startTime = performance.now();
        const arcSize = (2 * Math.PI) / this.names.length;
        const pointerAngle = 1.5 * Math.PI;

        const animate = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.currentAngle = startAngleInitial + totalRotation * easeOut;

            // Detectar cambio de sector bajo la aguja para emitir sonido "tick"
            const normalizedAngle = (this.currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const relativeAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
            const currentSector = Math.floor(relativeAngle / arcSize);

            if (currentSector !== this.lastTickSector) {
                this.lastTickSector = currentSector;
                playWheelTickSound();
            }

            this.draw();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finishSpin();
            }
        };

        requestAnimationFrame(animate);
    }

    finishSpin() {
        this.isSpinning = false;
        const arcSize = (2 * Math.PI) / this.names.length;

        const pointerAngle = 1.5 * Math.PI;
        const normalizedAngle = (this.currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        let relativeAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);

        this.selectedWinnerIndex = Math.floor(relativeAngle / arcSize);
        const winner = this.names[this.selectedWinnerIndex];

        handleSpinFinished(this, winner);
        this.updateNames();
    }

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
const defaultList1 = 'Maria\nSofia\nLuis\nDaniel\nDavid';
const defaultList2 = 'Tema 1\nTema 2\nTema 3\nTema 4';

const wheel1 = new Wheel(1, 'canvas1', 'input1', 'counter1', 'saveStatus1', 'voicePrefix1', 'spinBtn1', 'clearBtn1', 'importBtn1', defaultList1, 'Turno de');
const wheel2 = new Wheel(2, 'canvas2', 'input2', 'counter2', 'saveStatus2', 'voicePrefix2', 'spinBtn2', 'clearBtn2', 'importBtn2', defaultList2, 'Tema');

/* --------------------------------------------------------------------------
   CONTROL GLOBAL Y SINCRONIZACIÓN DUAL
   -------------------------------------------------------------------------- */
function checkGlobalSpinState() {
    if (!wheel2Active || !wheel1 || !wheel2) {
        spinAllBtn.disabled = true;
        return;
    }
    const canSpin1 = wheel1.names.length >= 2 && !wheel1.isSpinning;
    const canSpin2 = wheel2.names.length >= 2 && !wheel2.isSpinning;
    spinAllBtn.disabled = !(canSpin1 && canSpin2);
}

function handleSpinFinished(wheelInstance, winner) {
    pendingWinners.push({
        wheel: wheelInstance,
        winner: winner,
        index: wheelInstance.selectedWinnerIndex
    });

    if (isDualSpinning && (wheel1.isSpinning || wheel2.isSpinning)) {
        return;
    }

    isDualSpinning = false;
    playWinnerChimeSound();
    renderUnifiedModal();
}

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
          <button class="btn btn-keep" onclick="keepItem(${i})">${t('btnKeep')}</button>
          <button class="btn btn-remove" onclick="removeItem(${i})">${t('btnRemove')}</button>
        </div>
      `;
        } else if (mode === 'keep') {
            actionHtml = `<div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">${t('statusKeptInList')}</div>`;
        } else if (mode === 'auto') {
            actionHtml = `<div style="font-size:0.75rem; color:var(--warning); font-weight:600;">${t('statusAutoRemove')}</div>`;
        }

        card.innerHTML = `
      <div class="winner-card-title">${item.wheel.getDisplayTitle()}</div>
      <div class="winner-card-name">${item.winner}</div>
      ${actionHtml}
    `;
        resultsContainer.appendChild(card);
    });

    modalTitle.textContent = pendingWinners.length > 1
        ? t('modalDualTitle')
        : t('modalSingleTitle');
    modalOverlay.classList.add('active');

    speakSequence(speechPhrases);

    if (mode === 'auto') {
        let waitSeconds = parseInt(autoTimeInput.value, 10);
        if (isNaN(waitSeconds) || waitSeconds < 2) waitSeconds = 4;

        let remaining = waitSeconds;
        modalTimerElem.textContent = `${t('timerRemovingIn')} ${remaining}s...`;

        autoDismissInterval = setInterval(() => {
            remaining--;
            if (remaining > 0) {
                modalTimerElem.textContent = `${t('timerRemovingIn')} ${remaining}s...`;
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

window.removeItem = function (index) {
    const item = pendingWinners[index];
    if (item) {
        item.wheel.removeWinnerIndex(item.index);
        const card = document.getElementById(`winner-card-${index}`);
        if (card) {
            card.style.opacity = '0.45';
            card.querySelector('.winner-card-actions').innerHTML =
                `<span style="color:var(--danger);font-size:0.8rem;font-weight:800;">${t('statusRemovedBadge')}</span>`;
        }
    }
};

window.keepItem = function (index) {
    const card = document.getElementById(`winner-card-${index}`);
    if (card) {
        card.querySelector('.winner-card-actions').innerHTML =
            `<span style="color:var(--success);font-size:0.8rem;font-weight:800;">${t('statusKeptBadge')}</span>`;
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
   TEMA CLARO/OSCURO, IDIOMA Y MENÚ DE CONFIGURACIÓN
   -------------------------------------------------------------------------- */
function applyTheme() {
    const htmlEl = document.documentElement;
    if (currentTheme === 'dark') {
        htmlEl.classList.add('dark');
        htmlEl.classList.remove('light');
        themeIcon.className = 'fa-solid fa-sun';
        themeIcon.style.color = '#fbbf24';
    } else {
        htmlEl.classList.remove('dark');
        htmlEl.classList.add('light');
        themeIcon.className = 'fa-solid fa-moon text-indigo';
        themeIcon.style.color = '';
    }
    wheel1.draw();
    wheel2.draw();
}

btnThemeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ruleta_theme', currentTheme);
    applyTheme();
});

function applyTranslations() {
    langLabel.textContent = currentLang.toUpperCase();
    document.documentElement.lang = currentLang;

    document.getElementById('uiMainTitle').textContent = t('mainTitle');
    document.getElementById('uiBadgeInteractive').textContent = t('badgeInteractive');
    document.getElementById('uiMainSubtitle').textContent = t('mainSubtitle');
    document.getElementById('uiBtnSettings').textContent = t('btnSettings');
    document.getElementById('uiSettingsTitle').textContent = t('settingsTitle');
    document.getElementById('uiBtnTestVoice').textContent = t('btnTestVoice');
    document.getElementById('uiLabelVoiceRate').textContent = t('labelVoiceRate');
    document.getElementById('optRateSlow').textContent = t('rateSlow');
    document.getElementById('optRateNormal').textContent = t('rateNormal');
    document.getElementById('optRateFast').textContent = t('rateFast');
    document.getElementById('uiLabelNarrator').textContent = t('labelNarrator');
    document.getElementById('uiLabelMuteNarrator').textContent = t('labelMuteNarrator');
    document.getElementById('uiLabelWheelSound').textContent = t('labelWheelSound');
    document.getElementById('uiLabelRemovalMode').textContent = t('labelRemovalMode');
    document.getElementById('optModeManual').textContent = t('modeManual');
    document.getElementById('optModeAuto').textContent = t('modeAuto');
    document.getElementById('optModeKeep').textContent = t('modeKeep');
    document.getElementById('uiLabelAutoWait').textContent = t('labelAutoWait');
    document.getElementById('uiLabelSeconds').textContent = t('labelSeconds');
    document.getElementById('uiBtnSpinAll').textContent = t('btnSpinAll');

    document.querySelector('#uiWheel1Title span').textContent = t('wheel1Title');
    document.querySelector('#uiWheel2Title span').textContent = t('wheel2Title');
    document.getElementById('uiBtnImport1').textContent = t('btnImport');
    document.getElementById('uiBtnImport2').textContent = t('btnImport');
    document.getElementById('uiBtnClear1').textContent = t('btnClear');
    document.getElementById('uiBtnClear2').textContent = t('btnClear');
    document.getElementById('uiLabelPrefix1').textContent = t('labelPrefix');
    document.getElementById('uiLabelPrefix2').textContent = t('labelPrefix');
    document.getElementById('input1').placeholder = t('placeholderInput1');
    document.getElementById('input2').placeholder = t('placeholderInput2');
    document.getElementById('saveStatus1').textContent = t('statusSynced');
    document.getElementById('saveStatus2').textContent = t('statusSynced');
    document.getElementById('canvas1').title = t('canvasTooltip');
    document.getElementById('canvas2').title = t('canvasTooltip');
    document.getElementById('uiBtnSpin1').textContent = t('btnSpin1');
    document.getElementById('uiBtnSpin2').textContent = t('btnSpin2');

    closeAllBtn.textContent = t('btnCloseModal');
    confirmTitle.textContent = t('confirmTitle');
    cancelConfirmBtn.textContent = t('btnCancel');
    acceptConfirmBtn.textContent = t('btnAcceptClear');
    document.getElementById('uiCleanerDesc').textContent = t('cleanerDesc');
    rawInput.placeholder = t('cleanerPlaceholder');
    document.getElementById('uiLabelInvertOrder').textContent = t('labelInvertOrder');
    document.getElementById('uiLabelTitleCase').textContent = t('labelTitleCase');
    cancelCleanerBtn.textContent = t('btnCancel');
    processCleanerBtn.textContent = t('btnProcessCleaner');

    toggleWheel2Btn.textContent = wheel2Active ? t('removeWheel2') : t('addWheel2');

    populateVoiceList();
    wheel1.updateNames();
    wheel2.updateNames();
}

btnLangToggle.addEventListener('click', () => {
    currentLang = currentLang === 'es' ? 'en' : 'es';
    localStorage.setItem('ruleta_lang', currentLang);
    applyTranslations();
});

// Menú desplegable de Configuración
btnSettingsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!settingsMenu.classList.contains('hidden') && !settingsMenu.contains(e.target) && e.target !== btnSettingsToggle) {
        settingsMenu.classList.add('hidden');
    }
});

// Inicializar valores de configuración en el menú
voiceRateSelect.value = String(audioConfig.rate);
muteNarratorToggle.checked = audioConfig.muteNarrator;
wheelSoundToggle.checked = audioConfig.wheelSound;

voiceRateSelect.addEventListener('change', () => {
    audioConfig.rate = parseFloat(voiceRateSelect.value) || 0.95;
    localStorage.setItem('ruleta_voice_rate', audioConfig.rate);
});

voiceNarratorSelect.addEventListener('change', () => {
    audioConfig.voiceURI = voiceNarratorSelect.value;
    localStorage.setItem('ruleta_voice_uri', audioConfig.voiceURI);
});

muteNarratorToggle.addEventListener('change', () => {
    audioConfig.muteNarrator = muteNarratorToggle.checked;
    localStorage.setItem('ruleta_mute_narrator', audioConfig.muteNarrator ? 'true' : 'false');
    if (audioConfig.muteNarrator && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
});

wheelSoundToggle.addEventListener('change', () => {
    audioConfig.wheelSound = wheelSoundToggle.checked;
    localStorage.setItem('ruleta_wheel_sound', audioConfig.wheelSound ? 'true' : 'false');
});

btnTestVoice.addEventListener('click', () => {
    speakSequence([t('testVoiceSample')], true);
});

/* --------------------------------------------------------------------------
   PERSISTENCIA DE CONFIGURACIONES GLOBALES
   -------------------------------------------------------------------------- */
function applyWheel2Visibility(active) {
    wheel2Active = active;
    localStorage.setItem('ruleta_visible_ruleta_2', active ? 'true' : 'false');

    if (active) {
        unit2.classList.remove('hidden');
        spinAllBtn.classList.remove('hidden');
        toggleWheel2Btn.textContent = t('removeWheel2');
        wheel2.draw();
    } else {
        unit2.classList.add('hidden');
        spinAllBtn.classList.add('hidden');
        toggleWheel2Btn.textContent = t('addWheel2');
    }
    checkGlobalSpinState();
}

toggleWheel2Btn.addEventListener('click', () => {
    applyWheel2Visibility(!wheel2Active);
});

if (localStorage.getItem('ruleta_visible_ruleta_2') === 'true') {
    applyWheel2Visibility(true);
}

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

spinAllBtn.addEventListener('click', () => {
    if (wheel1.names.length >= 2 && wheel2.names.length >= 2 && !wheel1.isSpinning && !wheel2.isSpinning) {
        isDualSpinning = true;
        pendingWinners = [];
        wheel1.spin();
        wheel2.spin();
    }
});

// Inicializar Tema e Idioma al cargar
applyTheme();
applyTranslations();