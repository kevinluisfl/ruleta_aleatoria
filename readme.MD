# 🎡 UparWheel Studio — Ruleta de Participación Escolar Pro

Una aplicación web interactiva, moderna y ligera diseñada para docentes y facilitadores[cite: 8]. Permite realizar selecciones aleatorias de estudiantes y asignación simultánea de temas, preguntas o grupos en el aula de clases, incorporando síntesis de voz nativa configurable, efectos de sonido en tiempo real, soporte bilingüe, tema claro/oscuro y persistencia de datos.

---

## ✨ Características Principales

### 🎯 Dinámica de Juego y Aula
- **Doble Ruleta Independiente o Simultánea:** Usa una ruleta para estudiantes y una segunda para temas/preguntas[cite: 8]. Puedes girarlas por separado o ambas a la vez con un solo clic[cite: 8].
- **Interacción Directa:** Gira la ruleta presionando el botón de acción o haciendo clic directo sobre el disco[cite: 8].
- **Importador Inteligente de Plataformas Educativas:** Limpia volcados de texto complejos copiados directamente desde portales académicos (como UparSchool o similares)[cite: 8]. Filtra automáticamente correos institucionales, faltas, notas y guiones, permitiendo ordenar los nombres en formato natural (*Nombres Apellidos*) y convertirlos a tipo Título[cite: 5, 7, 8].
- **3 Modos de Eliminación de Ganadores[cite: 8]:**
  1. **Manual:** Pregunta si deseas conservar o retirar al estudiante tras el giro.
  2. **Automático:** Retira al estudiante de la lista tras una cuenta regresiva configurable (2 a 30 segundos).
  3. **Mantener Siempre:** No retira a los participantes de la lista.

### 🔊 Menú de Configuración de Voz y Sonido (Nuevo)
- **Anuncio por Voz Personalizable (`SpeechSynthesis`):** Lee en voz alta al ganador (y el tema asignado en giros dobles). Permite personalizar la frase inicial de cada ruleta (ej. *"Turno de"*, *"Tema"* o dejarla en blanco)[cite: 5, 8].
- **Velocidad de Habla:** Ajusta la cadencia del narrador en tres niveles: *Lento (0.75x)*, *Normal (1.0x)* o *Rápido (1.25x)*.
- **Selector de Narrador y Prueba en Vivo:** Detecta y lista automáticamente todas las voces instaladas en el navegador o sistema operativo, priorizando las del idioma activo e incluyendo un botón para probar la voz al instante.
- **Opción de Silenciar Narrador:** Interruptor rápido para desactivar la lectura por voz sin afectar los demás efectos de la aplicación.
- **Sonido de Ruleta en Tiempo Real (`Web Audio API`):** Sintetiza de forma nativa (sin archivos `.mp3` externos) el clásico sonido mecánico de *"clic/tick"* cada vez que una división de la ruleta pasa por la aguja superior, desacelerando junto con el giro y reproduciendo un acorde de campana al anunciar el resultado (activable/desactivable).

### 🎨 Interfaz, Personalización y Persistencia
- **Diseño Moderno Indigo Studio:** Estética limpia y adaptable con tipografía `Inter` e iconografía `Font Awesome`.
- **Tema Claro / Oscuro:** Selector en la barra superior que adapta toda la interfaz y el renderizado del `canvas` de las ruletas a entornos iluminados u oscuros.
- **Soporte Bilingüe (Español / Inglés):** Cambio instantáneo de idioma (`ES` / `EN`) en todos los textos, botones, modales y avisos.
- **Barra Superior Fija (`Sticky Controls`):** Los controles de selección y el botón de giro dual permanecen siempre a la vista al hacer scroll.
- **Persistencia Total con `localStorage`:** Los nombres, configuraciones de eliminación, frases de voz, estado de la segunda ruleta, tema visual, idioma y preferencias de audio permanecen guardados en el navegador aunque se recargue o cierre la pestaña.

---

## 🚀 Instalación y Uso

La aplicación funciona de forma **100% cliente** (sin servidores, dependencias de Node ni bases de datos)[cite: 8]:

1. Clona este repositorio o descarga los archivos (`index.html`, `styles.css`, `app.js`):
   ```bash
   git clone [https://github.com/kevinluisfl/ruleta_aleatoria.git](https://github.com/kevinluisfl/ruleta_aleatoria.git)
