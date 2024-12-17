export function loadExercises() {
  // Espera o contêiner estar disponível no DOM
  waitForElement("#exercise-container")
    .then((container) => {
      // Verifica se já existem questões no contêiner
      if (container.dataset.loaded === "true") {
        return // Não carrega novamente as questões
      }

      // Marca o contêiner como carregado para evitar duplicação
      container.dataset.loaded = "true"

      // Agora o contêiner existe, podemos continuar com a lógica
      fetch("../../data/questoes.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Falha ao carregar questões: ${response.statusText}`)
          }
          return response.json();
        })
        .then((questoes) => {
          const selectedQuestions = shuffleArray(questoes).slice(0, 8)

          // Renderiza as questões no contêiner
          selectedQuestions.forEach((question, index) => {
            renderExercicio(container, question, index)
          })

          // Adiciona o ouvinte de evento para o formulário
          container.addEventListener("submit", (event) => {
            event.preventDefault()
            handleFormSubmit(event)
          })
        })
        .catch((error) => {
          console.error("Erro ao carregar questões:", error)
        })
    })
    .catch((error) => {
      console.error("Erro ao esperar o contêiner:", error)
    })
}

// Função para esperar o contêiner estar disponível no DOM
function waitForElement(selector) {
  return new Promise((resolve, reject) => {
    const checkExist = setInterval(() => {
      const element = document.querySelector(selector)
      if (element) {
        clearInterval(checkExist);
        resolve(element); // O contêiner foi encontrado, podemos continuar
      }
    }, 200) // Verifica a cada 200ms
  })
}

function renderExercicio(container, question, index) {
  const shuffledOptions = shuffleArray(question.options) // Embaralha as opções
  const questionHTML = `
    <form class="question-form">
      <fieldset>
        <h2>${String.fromCharCode(97 + index)}&#41; ${question.text}</h2>
        ${shuffledOptions
          .map(
            (option, i) => `
          <p>
            <input type="radio" name="resposta${index}" id="resposta${index}-${i}" value="${option}">
            <label for="resposta${index}-${i}">${option}</label>
          </p>
        `)
          .join("")}
        <p class="answer close">
          Sua resposta: <strong></strong>
        </p>
        <p class="answer close">
          Resposta correta: <strong>${question.answer}</strong>
        </p>
      </fieldset>
      <input type="submit" class="btnDefault btnSubmit" value="Verificar">
    </form>
  `;

  container.insertAdjacentHTML("beforeend", questionHTML)
}

function handleFormSubmit(event) {
  const form = event.target;
  const selectedOption = form.querySelector("input[type='radio']:checked")
  const userAnswer = selectedOption ? selectedOption.value : null

  form.querySelector(".answer strong:first-child").textContent = userAnswer || "Nenhuma resposta"
  
  // Mostra as respostas
  form.querySelectorAll(".answer").forEach((answer) => {
    answer.style.display = "block"
  })

  // Desativa os inputs para evitar novas submissões
  form.querySelectorAll("input").forEach((input) => {
    input.disabled = true
  })

  // Oculta as alternativas de resposta
  form.querySelectorAll("p").forEach((p) => {
    if (!p.classList.contains("answer")) {
      p.style.display = "none"
    }
  })

  // Oculta o botão de submit
  form.querySelector(".btnSubmit").style.display = "none"
}

// Função utilitária para embaralhar um array
function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
