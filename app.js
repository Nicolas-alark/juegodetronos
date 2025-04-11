import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxoML4YCtAtcVu51yN379j0Fg7gh4mIiY",
  authDomain: "juegodetronos-dff8d.firebaseapp.com",
  projectId: "juegodetronos-dff8d",
  storageBucket: "juegodetronos-dff8d.firebasestorage.app",
  messagingSenderId: "16676089058",
  appId: "1:16676089058:web:d8423b6df3da72e223c2bb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const personajesEl = document.getElementById('personajes');
const casasEl = document.getElementById('casas');
const librosEl = document.getElementById('libros');
const favoritosEl = document.getElementById('favoritos');
const searchInput = document.getElementById('search');
const resultadoRuleta = document.getElementById('resultadoRuleta');

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

function showSection(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function crearCard(item, esFavorito = false) {
  const div = document.createElement('div');
  div.className = 'card';

  div.innerHTML = `
    <img src="${item.imageUrl || 'https://via.placeholder.com/250x350?text=Sin+imagen'}" alt="${item.fullName || item.name}">
    <h3>${item.fullName || item.name}</h3>
    ${item.title ? `<p>${item.title}</p>` : ''}
    ${item.family ? `<p><strong>Casa:</strong> ${item.family}</p>` : ''}
    <button class="fav">${esFavorito ? '❌' : '⭐'}</button>
  `;

  div.querySelector('button').onclick = async () => {
    if (esFavorito) {
      favoritos = favoritos.filter(f => f.id !== item.id);
      await eliminarFavoritoFirestore(item.id);
    } else if (!favoritos.find(f => f.id === item.id)) {
      favoritos.push(item);
      await guardarFavoritoFirestore(item);
    }
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    cargarFavoritos();
  };

  return div;
}

async function guardarFavoritoFirestore(item) {
  try {
    await addDoc(collection(db, "favoritos"), item);
  } catch (error) {
    console.error("Error al guardar en Firestore", error);
  }
}

async function eliminarFavoritoFirestore(id) {
  try {
    const snapshot = await getDocs(collection(db, "favoritos"));
    snapshot.forEach(docu => {
      if (docu.data().id === id) {
        deleteDoc(doc(db, "favoritos", docu.id));
      }
    });
  } catch (error) {
    console.error("Error al eliminar de Firestore", error);
  }
}

async function cargarFavoritos() {
  favoritosEl.innerHTML = '<h2>Favoritos</h2>';

  try {
    const snapshot = await getDocs(collection(db, "favoritos"));
    favoritos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      favoritos.push(data);
    });
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    favoritos.forEach(f => {
      const card = crearCard(f, true);
      favoritosEl.appendChild(card);
    });
  } catch (error) {
    favoritosEl.innerHTML += '<p>Error al cargar favoritos desde Firestore.</p>';
    console.error(error);
  }
}

async function cargarPersonajes() {
  personajesEl.innerHTML = '';
  try {
    const res = await fetch('https://thronesapi.com/api/v2/Characters');
    const data = await res.json();
    data.forEach(p => {
      const card = crearCard(p);
      personajesEl.appendChild(card);
    });
  } catch (error) {
    personajesEl.innerHTML = '<p>Error al cargar personajes.</p>';
    console.error(error);
  }
}

async function cargarCasas() {
  casasEl.innerHTML = '';
  try {
    const res = await fetch('https://thronesapi.com/api/v2/Characters');
    const data = await res.json();
    const casasUnicas = [...new Set(data.map(c => c.family).filter(Boolean))];
    casasUnicas.forEach((casa, i) => {
      const casaItem = {
        id: `casa-${i}`,
        name: casa,
        imageUrl: 'https://via.placeholder.com/250x350?text=' + encodeURIComponent(casa)
      };
      const card = crearCard(casaItem);
      casasEl.appendChild(card);
    });
  } catch (error) {
    casasEl.innerHTML = '<p>Error al cargar casas.</p>';
    console.error(error);
  }
}

function cargarLibros() {
  librosEl.innerHTML = '';
  const libros = [
    { id: 1, name: "Juego de Tronos", imageUrl: "https://m.media-amazon.com/images/I/91JgkRAqNEL.jpg" },
    { id: 2, name: "Choque de Reyes", imageUrl: "https://m.media-amazon.com/images/I/81ndLw7ZVXL.jpg" },
    { id: 3, name: "Tormenta de Espadas", imageUrl: "https://m.media-amazon.com/images/I/91GGDFXNGhL.jpg" },
  ];
  libros.forEach(libro => {
    const card = crearCard(libro);
    librosEl.appendChild(card);
  });
}

function mostrarRuleta() {
  showSection('ruleta');
  resultadoRuleta.innerHTML = '';
}

async function girarRuleta(tipo) {
  resultadoRuleta.innerHTML = '<p>Cargando...</p>';
  try {
    const res = await fetch('https://thronesapi.com/api/v2/Characters');
    const data = await res.json();

    let item;
    if (tipo === 'characters') {
      item = data[Math.floor(Math.random() * data.length)];
    } else {
      const casas = [...new Set(data.map(c => c.family).filter(Boolean))];
      const casa = casas[Math.floor(Math.random() * casas.length)];
      item = {
        id: `casa-${casa}`,
        name: casa,
        imageUrl: 'https://via.placeholder.com/250x350?text=' + encodeURIComponent(casa)
      };
    }

    resultadoRuleta.innerHTML = '';
    const card = crearCard(item);
    resultadoRuleta.appendChild(card);

  } catch (error) {
    resultadoRuleta.innerHTML = '<p>Error al girar la ruleta.</p>';
    console.error(error);
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('.page.active .card').forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
});

function init() {
  cargarPersonajes();
  cargarCasas();
  cargarLibros();
  cargarFavoritos();
  showSection('personajes');
}

init();

// ✅ Hacer funciones globales para que funcionen los botones del HTML
window.showSection = showSection;
window.mostrarRuleta = mostrarRuleta;
window.girarRuleta = girarRuleta;
