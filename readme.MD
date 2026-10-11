# 🎡 Ruleta de Participación Escolar Pro

Una aplicación web interactiva, moderna y ligera diseñada para docentes y facilitadores. Permite realizar selecciones aleatorias de estudiantes y asignación simultánea de temas, preguntas o grupos en el aula de clases, incorporando síntesis de voz nativa y persistencia de datos.

---

## ✨ Características Principales

- **Doble Ruleta Independiente o Simultánea:** Usa una ruleta para estudiantes y una segunda para temas/preguntas. Puedes girarlas por separado o ambas a la vez con un solo clic.
- **Interacción Directa:** Gira la ruleta presionando el botón de acción o haciendo clic directo sobre el disco.
- **Anuncio por Voz Configurable:** Utiliza la API nativa `SpeechSynthesis` para leer en voz alta al ganador en español. Puedes personalizar la frase inicial (ej. *"Turno de"*, *"Tema:"* o dejarla en blanco).
- **Importador Inteligente de Plataformas Educativas:** Limpia volcados de texto complejos copiados directamente desde portales académicos (como UparSchool o similares). Filtra automáticamente correos institucionales, faltas, notas y guiones, permitiendo ordenar los nombres en formato natural (*Nombres Apellidos*).
- **Persistencia con `localStorage`:** Los nombres, configuraciones de eliminación, frases de voz y el estado de la segunda ruleta permanecen guardados en el navegador aunque se recargue o cierre la pestaña accidentalmente.
- **3 Modos de Eliminación de Ganadores:**
  1. **Manual:** Pregunta si deseas conservar o retirar al estudiante tras el giro.
  2. **Automático:** Retira al estudiante de la lista tras una cuenta regresiva configurable (2 a 30 segundos).
  3. **Mantener Siempre:** No retira a los participantes de la lista.
- **Barra Superior Fija (`Sticky Header`):** Los controles globales y el botón de giro dual permanecen siempre a la vista al hacer scroll en listas extensas.

---

## 🚀 Instalación y Uso

La aplicación funciona de forma **100% cliente** (sin servidores, dependencias externas ni bases de datos):

1. Clona este repositorio o descarga los archivos:
   ```bash
   git clone [https://github.com/kevinluisfl/ruleta_aleatoria.git](https://github.com/kevinluisfl/ruleta_aleatoria.git)