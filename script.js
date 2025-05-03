// Importar categorías de frases
import { quotesCategories } from './quotes.js';

let startTime, timer, currentQuote;
let errors = 0;
let currentCategory = 'simple'; // Categoría por defecto

// Elementos del DOM
const quoteElement = document.getElementById("quote");
const inputElement = document.getElementById("input");
const timeElement = document.getElementById("time");
const speedElement = document.getElementById("speed");
const errorsElement = document.getElementById("errors");
const restartBtn = document.getElementById("restart");
const messageElement = document.getElementById("message");

// Botones de categoría
const btnSimple = document.getElementById("btn-simple");
const btnCompleja = document.getElementById("btn-compleja");
const btnPalabras = document.getElementById("btn-palabras");

// Botón de más opciones y contenedor
const toggleMoreBtn = document.getElementById("toggle-more");
const moreCategoriesContainer = document.getElementById("more-categories");

// Iniciar juego
function init() {
    // Seleccionar una frase aleatoria de la categoría actual
    const categoryQuotes = quotesCategories[currentCategory];
    currentQuote = categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)];
    
    // Si es código Python, añadir clase 'code'
    if (currentCategory === 'codigoPython') {
        quoteElement.textContent = currentQuote;
        quoteElement.classList.add('code');
    } else {
        quoteElement.textContent = currentQuote;
        quoteElement.classList.remove('code');
    }
    
    inputElement.value = "";
    timeElement.textContent = 0;
    speedElement.textContent = 0;
    errorsElement.textContent = 0;
    errors = 0;
    inputElement.disabled = false;
    inputElement.focus();
    startTime = null;
    if (timer) clearInterval(timer);
    messageElement.textContent = "Pulsa Shift + Enter para saltar a nueva frase";
}

// Calcular estadísticas
function updateStats() {
    const currentTime = Math.floor((Date.now() - startTime) / 1000);
    timeElement.textContent = currentTime;
    
    const wordsTyped = inputElement.value.split(" ").length;
    const speed = Math.floor((wordsTyped / currentTime) * 60) || 0;
    speedElement.textContent = speed;
}

// Función para cambiar la categoría activa
function changeCategory(category) {
    currentCategory = category;
    
    // Actualiza clases de los botones principales
    btnSimple.classList.remove('active');
    btnCompleja.classList.remove('active');
    btnPalabras.classList.remove('active');
    
    // Desactiva todos los botones adicionales
    document.querySelectorAll('#more-categories .category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activa el botón correspondiente
    if (category === 'simple') btnSimple.classList.add('active');
    else if (category === 'compleja') btnCompleja.classList.add('active');
    else if (category === 'palabras') btnPalabras.classList.add('active');
    else {
        // Activar botón de categoría adicional si corresponde
        const additionalBtn = document.querySelector(`#more-categories [data-cat="${category}"]`);
        if (additionalBtn) additionalBtn.classList.add('active');
    }
    
    // Reiniciar con nueva categoría
    init();
}

// Toggle para mostrar/ocultar categorías adicionales
toggleMoreBtn.addEventListener('click', () => {
    const isVisible = moreCategoriesContainer.style.display === 'flex';
    
    if (isVisible) {
        moreCategoriesContainer.style.display = 'none';
        toggleMoreBtn.textContent = 'Más opciones ▾';
        toggleMoreBtn.classList.remove('active');
    } else {
        moreCategoriesContainer.style.display = 'flex';
        toggleMoreBtn.textContent = 'Más opciones ▴';
        toggleMoreBtn.classList.add('active');
    }
});

// Event listeners para botones de categoría principales
btnSimple.addEventListener('click', () => changeCategory('simple'));
btnCompleja.addEventListener('click', () => changeCategory('compleja'));
btnPalabras.addEventListener('click', () => changeCategory('palabras'));

// Event listeners para botones de categorías adicionales
document.querySelectorAll('#more-categories .category-btn').forEach(btn => {
    btn.addEventListener('click', () => changeCategory(btn.dataset.cat));
});

// Verificar errores
inputElement.addEventListener("input", () => {
    if (!startTime) {
        startTime = Date.now();
        timer = setInterval(updateStats, 1000);
    }
    
    // Contar errores
    errors = 0;
    const typedText = inputElement.value;
    let highlightedQuote = ''; // Inicializa una nueva variable para la cita resaltada

    for (let i = 0; i < typedText.length; i++) {
        if (i < currentQuote.length) { // Verifica que el índice esté dentro del rango de currentQuote
            if (typedText[i] === currentQuote[i]) {
                highlightedQuote += currentQuote[i]; // letra correcta
            } else {
                highlightedQuote += `<span style="color: red;">${currentQuote[i]}</span>`; // letra incorrecta
                errors++;
            }
        }
    }

    // Si el texto escrito es más corto que la cita, agrega el resto de la cita sin cambios
    if (typedText.length < currentQuote.length) {
        highlightedQuote += currentQuote.slice(typedText.length);
    }

    errorsElement.textContent = errors;
    quoteElement.innerHTML = highlightedQuote; // Actualiza el HTML del elemento de la cita

    // Mostrar mensaje adaptado según la longitud del texto
    if (typedText.length >= currentQuote.length) {
        messageElement.textContent = "Pulsa Enter o Shift + Enter para saltar a nueva frase";
    } else {
        messageElement.textContent = "Pulsa Shift + Enter para saltar a nueva frase";
    }

    // Comprobar si se completó
    if (typedText === currentQuote) {
        clearInterval(timer);
        inputElement.disabled = true;
        messageElement.textContent = "¡Muy bien! Cargando nueva frase...";
        setTimeout(init, 1000);
    }
});

// Manejar eventos de teclado
inputElement.addEventListener("keydown", (event) => {
    // Si se presiona Tab en modo código Python
    if (event.key === "Tab" && currentCategory === 'codigoPython') {
        event.preventDefault(); // Evita el comportamiento predeterminado de Tab
        const start = inputElement.selectionStart;
        const end = inputElement.selectionEnd;

        // Inserta 4 espacios en la posición actual del cursor
        inputElement.value = inputElement.value.substring(0, start) + '    ' + inputElement.value.substring(end);
        
        // Mueve el cursor a la posición correcta después de insertar los espacios
        inputElement.selectionStart = inputElement.selectionEnd = start + 4;
    }
    // Si se presiona Enter normal y el texto está completo y correcto
    else if (event.key === "Enter" && !event.shiftKey && inputElement.value.length >= currentQuote.length) {
        event.preventDefault();
        init();
    }
    // Si se presiona Shift + Enter en cualquier momento
    else if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        init();
    }
});

// Iniciar al cargar la página
init();