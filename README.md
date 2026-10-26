# 🎵 BeatLine - La Línea del Tiempo Musical

**BeatLine** es un juego de mesa digital interactivo inspirado en la mecánica de adivinanza y cronología musical (estilo Hitster), optimizado para jugarse en **tablets o pantallas táctiles** bajo el formato dinámico **"Pasa y Juega"**.

---

## ✨ Características Principales

* 📱 **Optimizado para Tablets (Pasa y Juega):** Diseñado con botones táctiles generosos, gestos ergonómicos y animaciones fluidas sin distracciones individuales en celulares.
* 🛡️ **Resiliencia Total a Cierres Accidentales:** Si un familiar o niño actualiza la página (`F5`, swipe-to-refresh) o se cierra la pestaña, la sesión se restaura automáticamente en el turno, puntos y canciones exactas donde quedó.
* 🎨 **Sistema de Diseño Tokenizado (`src/index.css`):** Todas las variables visuales (colores primarios, secundarios, éxito, error, superficies, textos, bordes, radios y sombras) están centralizadas mediante CSS Custom Properties para permitir un cambio de tema o estilo inmediato.
* 🎧 **Motor de Audio en Alta Definición:** Integra consultas dinámicas y legales de 30 segundos mediante iTunes Search API, resolviendo carátulas en alta definición y años oficiales sin necesidad de autenticación ni costos de suscripción.
* 📖 **Manual de Instrucciones Integrado:** Pestañas visuales explicativas accesibles en cualquier momento sin pausar ni romper la partida.
* 🎵 **Paquete Oficial de Lanzamiento:** *Aniversario Papás 🎵*, con una selección de 100 éxitos para todas las generaciones, además de soporte para crear o importar cualquier playlist de Spotify o personalizada.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 19 + Vite 8
* **Estilos:** Tailwind CSS v4 + Variables CSS nativas
* **Iconografía:** Lucide React
* **Efectos:** Canvas Confetti
* **Persistencia:** LocalStorage Engine con Auto-Recovery

---

## 🚀 Inicio Rápido

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/CarlosGomezDev/beatline.git
   cd beatline
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor local:
   ```bash
   npm run dev
   ```

4. Para abrirlo en tu tablet:
   Asegúrate de estar en la misma red Wi-Fi y accede a la dirección IP local que muestra la terminal (ejemplo: `http://192.168.1.XX:5173`). Luego pulsa **"Añadir a pantalla de inicio"** para jugarlo en pantalla completa sin barras de navegador.

---

## 📜 Licencia
Proyecto libre para diversión familiar y recreativa.
