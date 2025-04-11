const apiBase = 'https://anapioficeandfire.com/api/';
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
  div.textContent = tipo === 'personaje' ? item.name || '(Sin nombre)' : item.name;
  const btn = document.createElement('button');
  btn.textContent = '❌';
  btn.onclick = () => {
    favoritos = favoritos.filter(f => f.url !== item.url);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    cargarFavoritos();
  };
  div.appendChild(btn);
  return div;
}

function agregarAFavoritos(item) {
  if (!favoritos.find(f => f.url === item.url)) {
    favoritos.push(item);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    cargarFavoritos();
  }
}

function cargarFavoritos() {
  favoritosEl.innerHTML = '<h2>Favoritos</h2>';
  favoritos.forEach(fav => {
    const el = crearElementoFavorito(fav, fav.url.includes('characters') ? 'personaje' : 'casa');
    favoritosEl.appendChild(el);
  });
}

async function cargarDatos(endpoint, container, tipo) {
  container.innerHTML = `<h2>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}</h2>`;
  const res = await fetch(apiBase + endpoint + '?page=1&pageSize=10');
  const data = await res.json();
  data.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item.name || '(Sin nombre)';
    const btn = document.createElement('button');
    btn.textContent = '⭐';
    btn.onclick = () => agregarAFavoritos(item);
    div.appendChild(btn);
    container.appendChild(div);
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
  cargarDatos('books', librosEl, 'libros');
}

function init() {
  cargarDatos('characters', personajesEl, 'personajes');
  cargarDatos('houses', casasEl, 'casas');
  cargarLibros();
  cargarFavoritos();
  showSection('personajes');
}

function mostrarRuleta() {
  showSection('ruleta');
  document.getElementById('resultadoRuleta').innerHTML = '';
}

async function girarRuleta(tipo) {
  const endpoint = tipo === 'characters' ? 'characters' : 'houses';
  const randomPage = Math.floor(Math.random() * 20) + 1;
  const res = await fetch(`${apiBase}${endpoint}?page=${randomPage}&pageSize=10`);
  const data = await res.json();
  const item = data[Math.floor(Math.random() * data.length)];
  const resultado = document.getElementById('resultadoRuleta');

  const detalles = [
    `<strong>Nombre:</strong> ${item.name || '(Sin nombre)'}`,
    item.region ? `<strong>Región:</strong> ${item.region}` : '',
    item.titles?.length ? `<strong>Títulos:</strong> ${item.titles.filter(Boolean).join(', ')}` : '',
    item.words ? `<strong>Lema:</strong> ${item.words}` : ''
  ].filter(Boolean).join('<br>');

  resultado.innerHTML = `
    <h3>${tipo === 'characters' ? 'Personaje' : 'Casa'} Seleccionado</h3>
    <p>${detalles}</p>
    <button onclick='agregarAFavoritos(${JSON.stringify(item).replace(/'/g, "\'")})'>⭐ Agregar a favoritos</button>
  `;
}

init();