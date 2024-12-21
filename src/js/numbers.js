import { numbersData } from "../../data/numbersData.js";

export function initializeNumbersCards() {
  const container = document.querySelector("#numbers-container");

  // Verifica se o container existe antes de continuar
  if (!container) {
    console.error("Container '#numbers-container' não encontrado!");
    return;
  }

  const cardsHTML = numbersData.map((item, index) => 
    `
    <div class="card number-${index}">
      <img src="${item.imgSrc}" width="100px" height="100px" alt="Número ${item.title}">
      <p lang="en-US">&#40;<span class="number-${index}">${index}</span>
        = <span class="number-${index}">${item.title}</span>&#41;</p>
    </div>
    `
  ).join('');

  // Injeta o HTML no container
  container.innerHTML = cardsHTML;
}