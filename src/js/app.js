import initializeMobileNav from "./mobile-navbar.js"
import { Router } from "./router.js"

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
