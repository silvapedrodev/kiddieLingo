export function loadExercises() {
  // Espera ambos os contêineres estarem disponíveis no DOM
  Promise.all([
    waitForElement("#exercise-container"), // Contêiner para questões únicas
    waitForElement("#exercise-pair-container"), // Contêiner para questões pares
  ]).then(([singleContainer, pairContainer]) => {
    // Verifica se já foram carregadas questões nesses contêineres
    if (singleContainer.dataset.loaded === "true" && pairContainer.dataset.loaded === "true") {
      return // Não carrega novamente as questões
    }

    // Marca os contêineres como carregados para evitar duplicação
    singleContainer.dataset.loaded = "true"
    pairContainer.dataset.loaded = "true"

    fetch("../../data/questoes.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Falha ao carregar questões: ${response.statusText}`);
        return response.json();
      })
      .then((questoes) => {
        if (!Array.isArray(questoes) || questoes.length === 0) {
          throw new Error("Nenhuma questão encontrada no JSON.")
        }

        // Separa as questões por tipo
        const singleQuestions = questoes.filter((q) => q.type === "single")
        const pairQuestions = questoes.filter((q) => q.type === "pair")

        // Seleciona até 8 questões de cada tipo
        const selectedSingleQuestions = shuffleArray(singleQuestions).slice(0, 8)
        const selectedPairQuestions = shuffleArray(pairQuestions).slice(0, 8)

        // Embaralha todas as questões selecionadas para garantir aleatoriedade
        const allQuestions = shuffleArray([...selectedSingleQuestions, ...selectedPairQuestions])

        // Renderiza as questões nos contêineres apropriados
        let singleIndex = 0
        let pairIndex = 0

        allQuestions.forEach((question) => {
          if (question.type === "single") {
            renderExercicio(singleContainer, question, singleIndex++)
          } else if (question.type === "pair") {
            renderExercicio(pairContainer, question, pairIndex++)
          }
        });

        // Adiciona ouvintes de evento aos dois contêineres
        [singleContainer, pairContainer].forEach((container) => {
          container.addEventListener("submit", (event) => {
            event.preventDefault()
            handleFormSubmit(event)
          })
        })
      })
      .catch((error) => console.error("Erro ao carregar questões:", error))
  })
}

// Função para esperar o contêiner estar disponível no DOM
function waitForElement(selector) {
  return new Promise((resolve, reject) => {
    const checkExist = setInterval(() => {
      const element = document.querySelector(selector)
      if (element) {
        clearInterval(checkExist)
        resolve(element) // O contêiner foi encontrado, podemos continuar
      }
    }, 200) // Verifica a cada 200ms
  })
}

function renderExercicio(container, question, index) {
  const shuffledOptions = shuffleArray(question.options) // Embaralha as opções
  const questionHTML = 
  `
    <form class="question-form">
      <fieldset>
        <h2 lang="en-us">${String.fromCharCode(97 + index)}&#41; ${question.text}</h2>
        ${shuffledOptions
          .map(
            (option, i) => `
          <p>
            <input type="radio" name="resposta${index}" id="resposta${index}-${i}" value="${option}">
            <label for="resposta${index}-${i}">${option}</label>
          </p>
        `
          )
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
  `

  container.insertAdjacentHTML("beforeend", questionHTML);
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
