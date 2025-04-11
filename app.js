import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

const API_URL = "https://thronesapi.com/api/v2/";
const searchInput = document.getElementById('search');

function showSection(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

async function fetchData(endpoint) {
  const res = await fetch(API_URL + endpoint);
  return await res.json();
}

function createCard(item, type) {
  const div = document.createElement("div");
  div.classList.add("card");
  div.innerHTML = `
    <h3>${item.fullName || item.name}</h3>
    <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="${item.fullName || item.name}" />
    <button onclick="addFavorito('${item.id}', '${type}')">⭐ Favorito</button>
  `;
  return div;
}

async function cargarPersonajes() {
  const container = document.getElementById("personajes");
  container.innerHTML = "";
  const personajes = await fetchData("Characters");
  personajes.forEach(p => container.appendChild(createCard(p, "Characters")));
}

async function cargarCasas() {
  const container = document.getElementById("casas");
  container.innerHTML = "";
  const casas = await fetchData("Houses");
  casas.forEach(c => container.appendChild(createCard(c, "Houses")));
}

function addFavorito(id, tipo) {
  let favs = JSON.parse(localStorage.getItem("favoritos")) || [];
  favs.push({ id, tipo });
  localStorage.setItem("favoritos", JSON.stringify(favs));
  alert("Agregado a favoritos");
}

function cargarFavoritos() {
  const container = document.getElementById("favoritos");
  container.innerHTML = "";
  let favs = JSON.parse(localStorage.getItem("favoritos")) || [];
  favs.forEach(async fav => {
    const data = await fetchData(fav.tipo);
    const item = data.find(d => d.id == fav.id);
    if (item) container.appendChild(createCard(item, fav.tipo));
  });
}

async function cargarLibros() {
  const res = await fetch("https://anapioficeandfire.com/api/books");
  const libros = await res.json();
  const container = document.getElementById("libros");
  container.innerHTML = "<h2>Libros</h2>";
  libros.forEach(libro => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${libro.name}</strong> - ${libro.authors.join(", ")} - ${libro.released}`;
    container.appendChild(div);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  cargarPersonajes();
  cargarCasas();
  cargarFavoritos();
  cargarLibros();
});

window.showSection = showSection;
window.addFavorito = addFavorito;

searchInput.addEventListener("input", e => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(query) ? "" : "none";
  });
});

window.girarRuleta = async function(tipo) {
  const data = await fetchData(tipo === "characters" ? "Characters" : "Houses");
  const random = data[Math.floor(Math.random() * data.length)];
  document.getElementById("resultadoRuleta").innerHTML = `
    <h3>${random.fullName || random.name}</h3>
    <img src="${random.imageUrl || 'https://via.placeholder.com/150'}" />
  `;
};

document.getElementById("registroForm").addEventListener("submit", async e => {
  e.preventDefault();
  const campos = [...e.target.querySelectorAll("input")];
  const datos = {};
  campos.forEach(input => datos[input.placeholder] = input.value);
  await addDoc(collection(db, "usuarios"), datos);
  alert("Usuario registrado con éxito");
  e.target.reset();
});
