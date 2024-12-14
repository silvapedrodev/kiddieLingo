import { setActiveLink } from "./mobile-navbar.js"

const route = (event) => {
  event = event || window.event
  event.preventDefault()
  window.history.pushState({}, "", event.target.href)
  handleLocation()
  setActiveLink()
} 

const routes = {
  404: "/src/pages/404.html",
  "/": "/src/pages/home.html",
  "/alphabet": "/src/pages/alphabet.html",
  "/to-be": "/src/pages/to-be.html",
  "/to-be/learn-more": "/src/pages/learn-more.html",
  "/shapes": "/src/pages/shapes.html",
  "/numbers": "/src/pages/numbers.html",
  "/learn-more": "/src/pages/learn-more.html"
}

const handleLocation = async () => {
  const loading = document.querySelector(".loader")
  const appPage = document.getElementById("app")
  const path = window.location.pathname
  const route = routes[path] || routes[404]

  const loadingDelay = 500; // Exemplo: 500ms de espera antes de mostrar a animação
  let loadingTimeout;

  // Inicia o timeout para mostrar a animação de carregamento após o tempo configurado
  loadingTimeout = setTimeout(() => {
    loading.style.display = "block"
  }, loadingDelay);

  appPage.innerHTML = ""

  try {
    const html = await fetch(route).then((data) => data.text());
    appPage.innerHTML = html
  } catch (error) {
    console.error("Erro ao carregar a página:", error)
  } finally {
    clearTimeout(loadingTimeout)
    loading.style.display = "none"
    setActiveLink()
  }
}


window.onpopstate = () => {
  handleLocation()
  setActiveLink()
} 
window.route = route

handleLocation()