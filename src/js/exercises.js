export function loadExercises() {
  // Espera ambos os contêineres estarem disponíveis no DOM
  Promise.all([
    waitForElement("#exercise-container"), // Contêiner para questões únicas
    waitForElement("#exercise-pair-container"), // Contêiner para questões pares
    waitForElement("#exercise-input-container") // Contêiner para questões de input
  ]).then(([singleContainer, pairContainer, inputContainer]) => {
    // Verifica se já foram carregadas questões nesses contêineres
    if (
      singleContainer.dataset.loaded === "true" &&
      pairContainer.dataset.loaded === "true" &&
      inputContainer.dataset.loaded === "true"
    ) {
      return; // Não carrega novamente as questões
    }

    // Marca os contêineres como carregados para evitar duplicação
    singleContainer.dataset.loaded = "true";
    pairContainer.dataset.loaded = "true";
    inputContainer.dataset.loaded = "true";

    // Carregar questões para múltipla escolha (single) e pares (pair)
    fetch("../../data/questoes.json")
      .then((response) => {
        if (!response.ok)
          throw new Error(`Falha ao carregar questões: ${response.statusText}`);
        return response.json();
      })
      .then((questoes) => {
        if (!Array.isArray(questoes) || questoes.length === 0) {
          throw new Error("Nenhuma questão encontrada no JSON.");
        }

        // Separa as questões por tipo
        const singleQuestions = questoes.filter((q) => q.type === "single")
        const pairQuestions = questoes.filter((q) => q.type === "pair")

        // Seleciona até 8 questões de cada tipo
        const selectedSingleQuestions = shuffleArray(singleQuestions).slice(0, 8)
        const selectedPairQuestions = shuffleArray(pairQuestions).slice(0, 8);

        // Embaralha todas as questões selecionadas para garantir aleatoriedade
        const allQuestions = shuffleArray([
          ...selectedSingleQuestions,
          ...selectedPairQuestions,
        ]);

        // Renderiza as questões nos contêineres apropriados
        let singleIndex = 0;
        let pairIndex = 0;

        allQuestions.forEach((question) => {
          if (question.type === "single") {
            renderExercicio(singleContainer, question, singleIndex++);
          } else if (question.type === "pair") {
            renderExercicio(pairContainer, question, pairIndex++);
          }
        });

        // Adiciona ouvintes de evento aos dois contêineres
        [singleContainer, pairContainer].forEach((container) => {
          container.addEventListener("submit", (event) => {
            event.preventDefault();
            handleMultipleChoiceSubmit(event);
          });
        });
      })
      .catch((error) => console.error("Erro ao carregar questões:", error));

    // Carregar questões de input
    loadInputExercises(inputContainer);
  });
}

// Função para esperar o contêiner estar disponível no DOM
function waitForElement(selector) {
  return new Promise((resolve, reject) => {
    const checkExist = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(checkExist);
        resolve(element); // O contêiner foi encontrado, podemos continuar
      }
    }, 200); // Verifica a cada 200ms
  });
}

function loadInputExercises(inputContainer) {
  fetch("../../data/question-input.json")
    .then((response) => {
      if (!response.ok)
        throw new Error(`Falha ao carregar questões de input: ${response.statusText}`);
      return response.json();
    })
    .then((inputQuestions) => {
      if (!Array.isArray(inputQuestions) || inputQuestions.length === 0) {
        throw new Error("Nenhuma questão de input encontrada no JSON.");
      }

      inputQuestions = shuffleArray(inputQuestions).slice(0, 10);

      inputQuestions.forEach((question, index) => {
        renderInputExercise(inputContainer, question, index);
      });

      // Mudança principal está aqui ↓
      inputContainer.addEventListener("submit", (event) => {
        event.preventDefault();
        
        // Encontra a questão correspondente ao formulário submetido
        const form = event.target;
        const formIndex = Array.from(inputContainer.querySelectorAll('form')).indexOf(form);
        const correspondingQuestion = inputQuestions[formIndex];
        
        // Passa as respostas corretas para a função
        handleInputSubmit(event, correspondingQuestion.answers);
      });
    })
    .catch((error) => console.error("Erro ao carregar questões de input:", error));
}

function renderExercicio(container, question, index) {
  const shuffledOptions = shuffleArray(question.options); // Embaralha as opções
  const questionHTML = `
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
  `;
  container.insertAdjacentHTML("beforeend", questionHTML);
}

function renderInputExercise(container, question, index) {
  const parts = question.text.split('____');
  
  const questionHTML = `
    <form class="question-form">
      <fieldset>
        <p lang="en-us">${String.fromCharCode(97 + index)}&#41;
          ${parts[0]}
          <label for="input01-${index}"></label>
          <input type="text" id="input01-${index}" class="answer-input" maxlength="3">
          ${parts[1]}
          <label for="input02-${index}"></label>
          <input type="text" id="input02-${index}" class="answer-input" maxlength="3">
          ${parts[2] || ''}
        </p>
        <p class="answer close">
          Sua resposta: <strong></strong>
        </p>
        <p class="answer close">
          Resposta correta: <strong>${question.answers.join(" e ")}</strong>
        </p>
      </fieldset>
      <input type="submit" class="btnDefault btnSubmit" value="Verificar">
    </form>
  `;
  container.insertAdjacentHTML("beforeend", questionHTML);

  // Configura restrições para os inputs recém-criados
  formatInputValidation(".answer-input");
}

function handleMultipleChoiceSubmit(event) {
  const form = event.target;
  const selectedOption = form.querySelector("input[type='radio']:checked");
  const correctAnswer = form.querySelector(".answer strong:last-child").textContent.trim();

  if (selectedOption) {
    const userAnswer = selectedOption.value.trim() 
    const answerElement = form.querySelector(".answer strong")
    answerElement.textContent = userAnswer

    if (userAnswer === correctAnswer) {
      selectedOption.classList.add("correct-answer")
      selectedOption.classList.remove("wrong-answer")
    } else {
      selectedOption.classList.add("wrong-answer")
      selectedOption.classList.remove("correct-answer")
    }
  }

  // Exibe as respostas
  form.querySelectorAll(".answer").forEach((answer) => {
    answer.style.display = "block";
  });

  // Desativa os inputs para evitar novas submissões
  form.querySelectorAll("input").forEach((input) => {
    input.disabled = true;
  });

  form.querySelector(".btnSubmit").style.display = "none";
}

function handleInputSubmit(event, correctAnswers) {
  const form = event.target
  const inputs = form.querySelectorAll("input.answer-input")

  // Verifica se correctAnswers foi passado
  if (!correctAnswers) {
    console.error("Respostas corretas não fornecidas!")
    return
  }

  // Processando respostas corretas
  const processedCorrectAnswers = correctAnswers
    .map(answer => answer.trim())

  if (inputs.length > 0) {
    const userAnswerElement = form.querySelector(".answer strong:first-child")
    const userAnswers = Array.from(inputs).map(input => input.value.trim())

    // Verifica cada resposta do usuário
    inputs.forEach((input, index) => {
      const userAnswer = input.value.trim()
      const correctAnswer = processedCorrectAnswers[index]

      // Remove classes anteriores
      input.classList.remove("correct-answer", "wrong-answer")

      // Adiciona a classe correta baseado na comparação
      if (userAnswer === correctAnswer) {
        input.classList.add("correct-answer")
      } else {
        input.classList.add("wrong-answer")
      }
    })

    // Atualiza as respostas corretas 
    const correctAnswerElement = form.querySelector(".answer strong:last-child")
    correctAnswerElement.textContent = processedCorrectAnswers.join(" e ")
    
    // Exibe as respostas do usuário no primeiro <strong>
    userAnswerElement.textContent = userAnswers.join(" e ")
  }

  // Exibe as respostas
  form.querySelectorAll(".answer").forEach((answer) => {
    answer.style.display = "block"
  });

  // Desativa os inputs para evitar novas submissões
  form.querySelectorAll("input").forEach((input) => {
    input.disabled = true
  });

  // Esconde o botão de "Verificar"
  form.querySelector(".btnSubmit").style.display = "none"
}

function formatInputValidation(inputSelector) {
  document.querySelectorAll(inputSelector).forEach((input) => {
    input.addEventListener("input", () => {
      // Remove caracteres não alfabéticos e transforma em minúsculas
      input.value = input.value.replace(/[^a-z]/gi, "").toLowerCase()
    })
  })
}

// Função utilitária para embaralhar um array
function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
