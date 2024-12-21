// Dados das letras
import { alphabetData } from '../../data/alphabetData.js';

export function initializeAlphabetCards() {
  const container = document.querySelector("#alphabet-container");

  // Verifica se o container existe antes de continuar
  if (!container) {
    console.error("Container '.alphabet-container' não encontrado!");
    return;
  }

  const cardsHTML = alphabetData.map(item => `
    <div class="card letter-${item.title[0].toLowerCase()}">
      <h2 class="letter">${item.title}</h2>
      <img src="${item.imgSrc}" width="60px" height="60px" alt="${item.imgAlt}">
      <p lang="en-US" class="word">${item.paragraph}</p>
    </div>
  `).join('');

  // Injeta o HTML no container
  container.innerHTML = cardsHTML;
}