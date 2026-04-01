const SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbw2zWV9Ry-TYSXIgqz3GFmQb3mCTAqS7cv04FmkROEOlc2AT6E62tQuSIFs8pH1N8iq/exec";

async function fetchCentreData() {
  const response = await fetch(SHEETS_API_URL);
  if (!response.ok) {
    throw new Error("No s'han pogut carregar les dades.");
  }
  return await response.json();
}

function groupBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "Altres";
    if (!acc[value]) acc[value] = [];
    acc[value].push(item);
    return acc;
  }, {});
}

function sortByOrdre(items) {
  return [...items].sort((a, b) => Number(a.ordre || 999) - Number(b.ordre || 999));
}

function getGridClass(groupName) {
  const map = {
    "Equip directiu": "grid-2",
    "CFGM Guia en el medi natural": "grid-2",
    "CFGS": "grid-2",
    "Caps de departament": "grid-3",
    "Tutories ESO": "grid-3",
    "Tutories Batxillerat": "grid-3",
    "Ensenyaments esportius": "grid-3",
    "Coordinacions": "grid-3",
    "Altres": "grid-3"
  };
  return map[groupName] || "grid-3";
}

function renderCardsSection(container, title, items) {
  const section = document.createElement("section");

  const head = document.createElement("div");
  head.className = "section-head";
  head.innerHTML = `<h2>${title}</h2>`;
  section.appendChild(head);

  const grid = document.createElement("div");
  grid.className = getGridClass(title);

  sortByOrdre(items).forEach(item => {
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <h3>${item.carrec || ""}</h3>
      <p><strong>${item.nom || ""}</strong></p>
    `;
    grid.appendChild(article);
  });

  section.appendChild(grid);
  container.appendChild(section);
}

function renderEquipDocent(data) {
  const container = document.getElementById("equip-docent-dynamic");
  if (!container) return;

  const grouped = groupBy(data, "grup");
  container.innerHTML = "";

  Object.keys(grouped).forEach(groupName => {
    renderCardsSection(container, groupName, grouped[groupName]);
  });
}

function renderOrganigrama(data) {
  const container = document.getElementById("organigrama-dynamic");
  if (!container) return;

  const grouped = groupBy(data, "grup");
  container.innerHTML = "";

  Object.keys(grouped).forEach(groupName => {
    renderCardsSection(container, groupName, grouped[groupName]);
  });
}

function renderConsellEscolar(data) {
  const container = document.getElementById("consell-escolar-dynamic");
  if (!container) return;

  const grouped = groupBy(data, "grup");
  container.innerHTML = "";

  Object.keys(grouped).forEach(groupName => {
    renderCardsSection(container, groupName, grouped[groupName]);
  });
}

async function initCentreSheets() {
  try {
    const data = await fetchCentreData();
    renderEquipDocent(data.equip_docent || []);
    renderOrganigrama(data.organigrama || []);
    renderConsellEscolar(data.consell_escolar || []);
  } catch (error) {
    console.error(error);

    const containers = [
      "equip-docent-dynamic",
      "organigrama-dynamic",
      "consell-escolar-dynamic"
    ];

    containers.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `<p>No s'ha pogut carregar la informació en aquest moment.</p>`;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initCentreSheets);