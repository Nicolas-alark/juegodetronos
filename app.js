import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxoML4YCtAtcVu51yN379j0Fg7gh4mIiY",
  authDomain: "juegodetronos-dff8d.firebaseapp.com",
  projectId: "juegodetronos-dff8d",
  storageBucket: "juegodetronos-dff8d",
  messagingSenderId: "16676089058",
  appId: "1:16676089058:web:d8423b6df3da72e223c2bb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const apiBase = "https://api.gameofthronesquotes.xyz/v1";

const contenido = document.getElementById('contenido');
const search = document.getElementById('search');

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

function navigate(tab) {
  switch (tab) {
    case 'personajes':
      fetch(`${apiBase}/characters`)
        .then(res => res.json())
        .then(data => mostrarLista(data, 'personaje'));
      break;
    case 'casas':
      fetch(`${apiBase}/houses`)
        .then(res => res.json())
        .then(data => mostrarLista(data, 'casa'));
      break;
    case 'favoritos':
      mostrarFavoritos();
      break;
    case 'registro':
      mostrarFormularioRegistro();
      break;
    case 'libros':
      fetch(`${apiBase}/books`)
        .then(res => res.json())
        .then(data => mostrarLista(data, 'libro'));
      break;
    case 'capitulos':
      fetch(`${apiBase}/random/5`)
        .then(res => res.json())
        .then(data => mostrarLista(data, 'capitulo'));
      break;
    case 'inicio':
    default:
      contenido.innerHTML = `<h2>Bienvenido a Juego de Tronos App</h2>`;
  }
}

function mostrarLista(data, tipo) {
  contenido.innerHTML = `<h2>${tipo.toUpperCase()}S</h2>`;
  data.forEach(item => {
    const nombre = item.name || item;
    const imagen = item.image || "";
    contenido.innerHTML += `
      <div class="card">
        ${imagen ? `<img src="${imagen}" alt="${nombre}">` : ""}
        <div>
          <strong>${nombre}</strong>
          <button onclick="agregarFavorito('${nombre}')">❤️</button>
        </div>
      </div>`;
  });
}

window.agregarFavorito = function(nombre) {
  if (!favoritos.includes(nombre)) {
    favoritos.push(nombre);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    alert('Agregado a favoritos');
  }
};

function mostrarFavoritos() {
  contenido.innerHTML = `<h2>Favoritos</h2>`;
  favoritos.forEach(nombre => {
    contenido.innerHTML += `
      <div class="card">
        <strong>${nombre}</strong>
        <button onclick="eliminarFavorito('${nombre}')">❌</button>
      </div>`;
  });
}

window.eliminarFavorito = function(nombre) {
  favoritos = favoritos.filter(f => f !== nombre);
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
  mostrarFavoritos();
};

function mostrarFormularioRegistro() {
  contenido.innerHTML = `
    <h2>Registro</h2>
    <form id="registroForm">
      ${['Nombre', 'Apellido', 'Email', 'Contraseña', 'Edad', 'País', 'Usuario'].map(campo =>
        `<input name="${campo.toLowerCase()}" placeholder="${campo}" required />`
      ).join('')}
      <button type="submit">Registrar</button>
    </form>`;
  document.getElementById('registroForm').onsubmit = async (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(e.target));
    await addDoc(collection(db, "usuarios"), datos);
    alert('Registrado correctamente');
    e.target.reset();
  };
}

window.verAleatorio = async function () {
  const res = await fetch(`${apiBase}/character/random`);
  const data = await res.json();
  mostrarLista([data], 'personaje');
};

search.addEventListener('input', () => {
  const termino = search.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(termino) ? '' : 'none';
  });
});

navigate('inicio');
