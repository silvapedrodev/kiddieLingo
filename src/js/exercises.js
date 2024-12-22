import { alphabetData } from '../../data/alphabetData.js';
import { numbersData } from "../../data/numbersData.js";
import { shapesData } from '../../data/shapesData.js';

export function loadExercises() {
  Promise.all([
    waitForElement("#exercise-container"),
    waitForElement("#exercise-pair-container"),
    waitForElement("#exercise-input-container"),
    waitForElement("#exercise-interrogative-container"),
  ]).then(([singleContainer, pairContainer, inputContainer, interrogativeContainer]) => {
    if (areContainersLoaded([singleContainer, pairContainer, inputContainer, interrogativeContainer])) {
      return
    }

    markContainersAsLoaded([singleContainer, pairContainer, inputContainer, interrogativeContainer])

    // Carregar questões de múltipla escolha
    fetchQuestions("../../data/questoes.json")
      .then((questions) => {
        const { singleQuestions, pairQuestions } = separateQuestionsByType(questions, "single", "pair")
        renderQuestions(singleQuestions, singleContainer, renderSingleChoiceQuestion)
        renderQuestions(pairQuestions, pairContainer, renderPairQuestion)
        addSubmitListeners([singleContainer, pairContainer], handleMultipleChoiceSubmit)
      })
      .catch((error) => console.error("Erro ao carregar exercícios:", error))

    // Carregar questões de input
    fetchQuestions("../../data/question-input.json")
      .then((inputQuestions) => {
        const { affirmativeQuestions, interrogativeQuestions } = separateQuestionsByType(
          inputQuestions,
          "affirmative",
          "interrogative"
        );

        if (affirmativeQuestions.length > 0) {
          renderQuestions(affirmativeQuestions, inputContainer, renderInputExercise)
        } else {
          console.warn("Nenhuma questão afirmativa encontrada.")
        }

        if (interrogativeQuestions.length > 0) {
          renderQuestions(interrogativeQuestions, interrogativeContainer, renderInterrogativeExercise)
        } else {
          console.warn("Nenhuma questão interrogativa encontrada.")
        }

        addSubmitListeners([inputContainer, interrogativeContainer], handleInputSubmit)
      })
      .catch((error) => console.error("Erro ao carregar questões de input:", error))
  })
}

function waitForElement(selector) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = document.querySelector(selector)
      if (element) {
        clearInterval(interval)
        resolve(element) // O contêiner foi encontrado, podemos continuar
      }
    }, 200) // Verifica a cada 200ms
  });
}

function fetchQuestions(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`Falha ao carregar questões: ${response.statusText}`)
      return response.json()
    })
    .then((questions) => {
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Nenhuma questão encontrada no JSON.")
      }
      return questions
    })
}

function separateQuestionsByType(questions, type1, type2) {
  if (!Array.isArray(questions)) {
    console.error("Formato inválido de questões. Certifique-se de que o JSON contém um array.")
    return { [`${type1}Questions`]: [], [`${type2}Questions`]: [] }
  }

  const type1Questions = shuffleArray(questions.filter((q) => q.type === type1))
  const type2Questions = shuffleArray(questions.filter((q) => q.type === type2))

  // Imprime no console a quantidade de questões de cada tipo
  // console.log(`Questões do tipo "${type1}":`, type1Questions)
  // console.log(`Questões do tipo "${type2}":`, type2Questions)

  return {
    [`${type1}Questions`]: type1Questions.slice(0, 8),
    [`${type2}Questions`]: type2Questions.slice(0, 10),
  }
}

function areContainersLoaded(containers) {
  return containers.every((container) => container.dataset.loaded === "true")
}

function markContainersAsLoaded(containers) {
  containers.forEach((container) => (container.dataset.loaded = "true"))
}

function renderQuestions(questions, container, renderFunction) {
  if (!Array.isArray(questions) || questions.length === 0) {
    console.warn(`Nenhuma questão para renderizar no container: ${container.id}`)
    return
  }
  
  // Remove a linha que salvava no dataset
  // container.dataset.questions = JSON.stringify(questions)

  questions.forEach((question, index) => renderFunction(container, question, index))
}

function renderSingleChoiceQuestion(container, question, index) {
  const shuffledOptions = shuffleArray(question.options)
  const questionHTML = `
    <form class="question-form">
      <fieldset>
        <h2 lang="en-US">${String.fromCharCode(97 + index)}&#41; ${question.text}</h2>
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
        <p class="answer sua-resposta close">
          Sua resposta: <strong></strong>
        </p>
        <p class="answer resposta-correta close">
          Resposta correta: <strong>${question.answer}</strong>
        </p>
      </fieldset>
      <input type="submit" class="btnDefault btnSubmit" value="Verificar">
    </form>
  `

  container.insertAdjacentHTML("beforeend", questionHTML)
}

function renderPairQuestion(container, question, index) {
  renderSingleChoiceQuestion(container, question, index)
}

function renderInputExercise(container, question, index) {
  const parts = question.text.split("____")

  // Adicionando dois inputs em uma única pergunta
  const questionHTML = `
    <form class="question-form">
      <fieldset>
        <p lang="en-US">${String.fromCharCode(97 + index)}&#41;
          ${parts[0]}
          <label for="input01-${index}"></label>
          <input type="text" id="input01-${index}" class="answer-input" maxlength="3">
          ${parts[1] || ""}
          <label for="input02-${index}"></label>
          <input type="text" id="input02-${index}" class="answer-input" maxlength="3">
          ${parts[2] || ""}
        </p>
        
        <p class="answer sua-resposta close">
          Sua resposta: <strong></strong>
        </p>
        <p class="answer resposta-correta close">
          Resposta correta: <strong>${question.answers.join(" e ")}</strong>
        </p>
      </fieldset>
      <input type="submit" class="btnDefault btnSubmit" value="Verificar">
    </form>
  `
  container.insertAdjacentHTML("beforeend", questionHTML)

  formatInputValidation(".answer-input")
}

function renderInterrogativeExercise(container, question, index) {
  const questionHTML = `
    <form class="question-form">
      <fieldset>
        <h2 lang="en-US">${String.fromCharCode(97 + index)}&#41; ${question.text}</h2>
        <p>
          <label for="input01-${index}"></label>
          <input type="text" id="input01-${index}" class="answer-input">
        </p>
        <p class="answer sua-resposta close">
          Sua resposta: <strong></strong>
        </p>
        <p class="answer resposta-correta close">
          Resposta correta: <strong>${question.answers.join(" e ")}</strong>
        </p>
      </fieldset>
      <input type="submit" class="btnDefault btnSubmit" value="Verificar">
    </form>
  `

  container.insertAdjacentHTML("beforeend", questionHTML)
}

export function renderAlphabetCards() {
  const container = document.querySelector("#alphabet-container")

  // Verifica se o container existe antes de continuar
  if (!container) {
    console.error("Container '.alphabet-container' não encontrado!")
    return
  }
  
  const cardsHTML = alphabetData.map(item => `
    <div class="card letter-${item.title[0].toLowerCase()}">
      <h2 class="letter">${item.title}</h2>
      <img src="${item.imgSrc}" width="60px" height="60px" alt="${item.imgAlt}">
      <p lang="en-US" class="word">${item.paragraph}</p>
    </div>
  `).join('')

  // Injeta o HTML no container
  container.innerHTML = cardsHTML
}

export function renderNumbersCards() {
  const container = document.querySelector("#numbers-container")

  // Verifica se o container existe antes de continuar
  if (!container) {
    console.error("Container '#numbers-container' não encontrado!")
    return
  }

  const cardsHTML = numbersData.map((item, index) => 
    `
    <div class="card number-${index}">
      <img src="${item.imgSrc}" width="100px" height="100px" alt="Número ${item.title}">
      <p lang="en-US">&#40;<span class="number-${index}">${index}</span>
        = <span class="number-${index}">${item.title}</span>&#41;</p>
    </div>
    `
  ).join('')

  // Injeta o HTML no container
  container.innerHTML = cardsHTML
}

export function renderShapesCards() {
  const container = document.querySelector("#shapes-container")

  // Verifica se o container existe antes de continuar
  if (!container) {
  console.error("Container '#shapes-container' não encontrado!")
  return
  }

  const cardsHTML = shapesData.map(item => `
    <div class="card ${item.title.toLowerCase()} ${item.color}">
        <img src="${item.imgSrc}" alt="${item.title}">
        <p lang="en-US">${item.title}</p>
      </div>
    `).join('')
  
  container.innerHTML = cardsHTML
}

function addSubmitListeners(containers, submitHandler) {
  containers.forEach((container) => {
    container.addEventListener("submit", (event) => {
      event.preventDefault()
      const form = event.target
      const forms = container.querySelectorAll("form")
      const questionIndex = Array.from(forms).indexOf(form)
      
      // Recria o objeto question baseado nos elementos do form
      const question = {
        text: form.querySelector("h2, p")?.textContent,
        answer: form.querySelector(".resposta-correta strong")?.textContent,
        answers: form.querySelector(".resposta-correta strong")?.textContent.split(" e ") || []
      }

      submitHandler(event, question)
    })
  })
}

function handleInputSubmit(event, question) {
  const form = event.target
  const inputs = form.querySelectorAll("input.answer-input")

  const userAnswers = Array.from(inputs).map((input) => input.value.trim())
  const correctAnswers = question.answers
  const correctAnswerElement = form.querySelector(".answer.resposta-correta strong")

  correctAnswerElement.textContent = correctAnswers.join(" e ")

  inputs.forEach((input, index) => {
    if (userAnswers[index] === correctAnswers[index]) {
      input.classList.add("correct-answer")
    } else {
      input.classList.add("wrong-answer")
    }
  })

  form.querySelector(".answer.sua-resposta strong").textContent = userAnswers.join(" e ")

  form.querySelectorAll(".answer").forEach((answer) => {
    answer.style.display = "block"
  })

  form.querySelectorAll("input").forEach((input) => {
    input.disabled = true
  })

  form.querySelector(".btnSubmit").style.display = "none"
}

function handleMultipleChoiceSubmit(event, question) {
  const form = event.target
  const selectedOption = form.querySelector("input[type='radio']:checked")
  const correctAnswer = question.answer

  if (selectedOption) {
    const userAnswer = selectedOption.value.trim()
    const answerElement = form.querySelector(".answer.sua-resposta strong")
    answerElement.textContent = userAnswer

    if (userAnswer === correctAnswer) {
      selectedOption.classList.add("correct-answer")
    } else {
      selectedOption.classList.add("wrong-answer")
    }
  }

  form.querySelectorAll(".answer").forEach((answer) => {
    answer.style.display = "block"
  })

  form.querySelectorAll("input").forEach((input) => {
    input.disabled = true
  })

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

function shuffleArray(array) {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}
