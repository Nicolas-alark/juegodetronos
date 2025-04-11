// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxoML4YCtAtcVu51yN379j0Fg7gh4mIiY",
  authDomain: "juegodetronos-dff8d.firebaseapp.com",
  projectId: "juegodetronos-dff8d",
  storageBucket: "juegodetronos-dff8d.firebasestorage.app",
  messagingSenderId: "16676089058",
  appId: "1:16676089058:web:d8423b6df3da72e223c2bb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Navegación
function navigateTo(tabId) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');
}

// Cargar datos
const charactersURL = 'https://thronesapi.com/api/v2/Characters';
const housesURL = 'https://thronesapi.com/api/v2/House';
const booksURL = 'https://anapioficeandfire.com/api/books';
const episodes = ['S01E01', 'S01E02', 'S01E03']; // Simulado

const fetchData = async (url, containerId, isCharacter = false) => {
  const container = document.getElementById(containerId);
  const res = await fetch(url);
  const data = await res.json();

  container.innerHTML = '';
  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.fullName || item.name}</h3>
      ${item.imageUrl ? `<img src=\"${item.imageUrl}\" alt=\"${item.fullName}\">` : ''}
      <button onclick=\"addToFavorites(${JSON.stringify(item).replace(/\"/g, '&quot;')})\">Añadir a favoritos</button>
    `;
    container.appendChild(card);
  });
};

function addToFavorites(item) {
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  favs.push(item);
  localStorage.setItem('favorites', JSON.stringify(favs));
  alert('Agregado a favoritos');
}

function loadFavorites() {
  const container = document.getElementById('favorites');
  const favs = JSON.parse(localStorage.getItem('favorites')) || [];
  container.innerHTML = '<h2>Favoritos</h2>';
  favs.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.fullName || item.name}</h3>
      ${item.imageUrl ? `<img src=\"${item.imageUrl}\" alt=\"${item.fullName}\">` : ''}
      <button onclick=\"removeFavorite('${item.id || item.name}')\">Eliminar</button>
    `;
    container.appendChild(card);
  });
}

function removeFavorite(id) {
  let favs = JSON.parse(localStorage.getItem('favorites')) || [];
  favs = favs.filter(item => (item.id || item.name) !== id);
  localStorage.setItem('favorites', JSON.stringify(favs));
  loadFavorites();
}

function loadBooks() {
  fetch(booksURL)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('books');
      container.innerHTML = '<h2>Libros</h2>';
      data.forEach(book => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<h3>${book.name}</h3><p>${book.released}</p>`;
        container.appendChild(div);
      });
    });
}

function loadEpisodes() {
  const container = document.getElementById('episodes');
  container.innerHTML = '<h2>Capítulos</h2>';
  episodes.forEach(ep => {
    const div = document.createElement('div');
    div.className = 'card';
    div.textContent = ep;
    container.appendChild(div);
  });
}

function randomRoulette() {
  const choice = Math.random() < 0.5 ? 'character' : 'house';
  const url = choice === 'character' ? charactersURL : housesURL;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const item = data[Math.floor(Math.random() * data.length)];
      document.getElementById('rouletteResult').innerHTML = `
        <h3>${item.fullName || item.name}</h3>
        ${item.imageUrl ? `<img src=\"${item.imageUrl}\" alt=\"${item.fullName}\">` : ''}
      `;
    });
}

// Búsqueda
document.getElementById('searchBar').addEventListener('input', function () {
  const value = this.value.toLowerCase();
  document.querySelectorAll('.card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(value) ? 'block' : 'none';
  });
});

// Inicialización
window.onload = () => {
  fetchData(charactersURL, 'characters');
  fetchData(housesURL, 'houses');
  loadFavorites();
  loadBooks();
  loadEpisodes();
};
