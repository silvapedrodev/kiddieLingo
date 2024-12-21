import initializeMobileNav from "./mobile-navbar.js"
import { setActiveLink } from "./mobile-navbar.js"
import { Router } from "./router.js"
import { loadExercises} from "./exercises.js";

const router = new Router()
router.add(404, "/src/pages/404.html")
router.add('/', "/src/pages/home.html")
router.add('/alphabet', "/src/pages/alphabet.html")
router.add('/to-be', "/src/pages/to-be.html")
router.add('/to-be/learn-more', "/src/pages/learn-more.html")
router.add('/shapes', "/src/pages/shapes.html")
router.add('/numbers', "/src/pages/numbers.html")

initializeMobileNav()

window.onpopstate = () => {
  router.handleLocation()
  setActiveLink()
}

router.handleLocation()

window.route = (event) => router.route(event)

document.addEventListener("click", (event) => {
  const link = event.target.closest("a")
  const externalLink = event.target.closest("footer a")
  
  // Para link externo, não faz nada
  if (externalLink) {
    return 
  }
  
  if (link) {
    route(event)
  }
})

// Executa a lógica dos exercícios ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  loadExercises()
})
