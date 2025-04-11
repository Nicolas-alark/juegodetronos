// Firebase + Thrones App - JS completo
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const personajesEl = document.getElementById('personajes');
const casasEl = document.getElementById('casas');
const librosEl = document.getElementById('libros');
const favoritosEl = document.getElementById('favoritos');
const resultadoRuleta = document.getElementById('resultadoRuleta');
const searchInput = document.getElementById('search');

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

function showSection(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function crearCard(item, esFavorito = false) {
  const div = document.createElement('div');
  div.className = 'card';

  div.innerHTML = `
    <img src="${item.imageUrl ? item.imageUrl : 'https://dummyimage.com/250x350/ccc/000&text=' + encodeURIComponent(item.name || 'Sin imagen')}" 
         alt="${item.fullName || item.name}" 
         onerror="this.onerror=null;this.src='https://dummyimage.com/250x350/ccc/000&text=Sin+imagen';">
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
    console.error("Error guardando en Firestore", error);
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
    console.error("Error eliminando de Firestore", error);
  }
}

async function cargarFavoritos() {
  favoritosEl.innerHTML = '<h2>Favoritos</h2>';

  try {
    const snapshot = await getDocs(collection(db, "favoritos"));
    favoritos = [];
    snapshot.forEach(doc => favoritos.push(doc.data()));
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    favoritos.forEach(f => favoritosEl.appendChild(crearCard(f, true)));
  } catch (error) {
    favoritosEl.innerHTML += '<p>Error cargando favoritos.</p>';
    console.error(error);
  }
}

async function cargarPersonajes() {
  personajesEl.innerHTML = '';
  try {
    const res = await fetch('https://thronesapi.com/api/v2/Characters');
    const data = await res.json();
    data.forEach(p => personajesEl.appendChild(crearCard(p)));
  } catch (error) {
    personajesEl.innerHTML = '<p>Error cargando personajes.</p>';
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
      casasEl.appendChild(crearCard({
        id: `casa-${i}`,
        name: casa,
        imageUrl: 'https://dummyimage.com/250x350/aaa/000&text=' + encodeURIComponent(casa)
      }));
    });
  } catch (error) {
    casasEl.innerHTML = '<p>Error cargando casas.</p>';
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
  libros.forEach(libro => librosEl.appendChild(crearCard(libro)));
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
        imageUrl: 'https://dummyimage.com/250x350/aaa/000&text=' + encodeURIComponent(casa)
      };
    }

    resultadoRuleta.innerHTML = '';
    resultadoRuleta.appendChild(crearCard(item));
  } catch (error) {
    resultadoRuleta.innerHTML = '<p>Error al girar la ruleta.</p>';
    console.error(error);
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('.page.active .card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? '' : 'none';
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
