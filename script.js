const personajesEl = document.getElementById('personajes');
const casasEl = document.getElementById('casas');
const librosEl = document.getElementById('libros');
const favoritosEl = document.getElementById('favoritos');
const searchInput = document.getElementById('search');

let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

function showSection(id) {
  document.querySelectorAll('.page').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function crearElementoFavorito(item, tipo) {
  const div = document.createElement('div');
  div.textContent = item.fullName || item.title || item.name || '(Sin nombre)';
  const btn = document.createElement('button');
  btn.textContent = '❌';
  btn.onclick = () => {
    favoritos = favoritos.filter(f => f.id !== item.id);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    cargarFavoritos();
  };
  div.appendChild(btn);
  return div;
}

function agregarAFavoritos(item) {
  if (!favoritos.find(f => f.id === item.id)) {
    favoritos.push(item);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    cargarFavoritos();
  }
}

function cargarFavoritos() {
  favoritosEl.innerHTML = '<h2>Favoritos</h2>';
  favoritos.forEach(fav => {
    const el = crearElementoFavorito(fav, fav.house ? 'casa' : 'personaje');
    favoritosEl.appendChild(el);
  });
}

async function cargarPersonajes() {
  personajesEl.innerHTML = '<h2>Personajes</h2>';
  const res = await fetch('https://thronesapi.com/api/v2/Characters');
  const data = await res.json();
  data.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.fullName || item.title || '(Sin nombre)';
    const btn = document.createElement('button');
    btn.textContent = '⭐';
    btn.onclick = () => agregarAFavoritos(item);
    div.appendChild(btn);
    personajesEl.appendChild(div);
  });
}

async function cargarCasas() {
  casasEl.innerHTML = '<h2>Casas</h2>';
  const res = await fetch('https://thronesapi.com/api/v2/Characters');
  const data = await res.json();
  const casas = [...new Set(data.map(c => c.family).filter(Boolean))];
  casas.forEach((casa, index) => {
    const item = { id: index, name: casa };
    const div = document.createElement('div');
    div.textContent = casa;
    const btn = document.createElement('button');
    btn.textContent = '⭐';
    btn.onclick = () => agregarAFavoritos(item);
    div.appendChild(btn);
    casasEl.appendChild(div);
  });
}

document.getElementById('registroForm').addEventListener('submit', e => {
  e.preventDefault();
  alert('Registro exitoso');
  e.target.reset();
});

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  document.querySelectorAll('main .page.active div').forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(query) ? '' : 'none';
  });
});

function cargarLibros() {
  librosEl.innerHTML = '<h2>Libros</h2><p>Funcionalidad pendiente.</p>';
}

function init() {
  cargarPersonajes();
  cargarCasas();
  cargarLibros();
  cargarFavoritos();
  showSection('personajes');
}

function mostrarRuleta() {
  showSection('ruleta');
  document.getElementById('resultadoRuleta').innerHTML = '';
}

async function girarRuleta(tipo) {
  const res = await fetch('https://thronesapi.com/api/v2/Characters');
  const data = await res.json();

  let item;
  if (tipo === 'characters') {
    item = data[Math.floor(Math.random() * data.length)];
  } else {
    const casas = [...new Set(data.map(c => c.family).filter(Boolean))];
    const casa = casas[Math.floor(Math.random() * casas.length)];
    item = { name: casa, id: casa };
  }

  const resultado = document.getElementById('resultadoRuleta');
  const detalles = [
    `<strong>Nombre:</strong> ${item.fullName || item.name || '(Sin nombre)'}`,
    item.title ? `<strong>Título:</strong> ${item.title}` : '',
    item.family ? `<strong>Casa:</strong> ${item.family}` : ''
  ].filter(Boolean).join('<br>');

  resultado.innerHTML = `
    <h3>${tipo === 'characters' ? 'Personaje' : 'Casa'} Seleccionado</h3>
    <p>${detalles}</p>
    <button onclick='agregarAFavoritos(${JSON.stringify(item).replace(/'/g, "\'")})'>⭐ Agregar a favoritos</button>
  `;
}

init();
