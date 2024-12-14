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

  loading.style.display = "block";
  appPage.innerHTML = ""

  const html = await fetch(route).then((data) => data.text())
  appPage.innerHTML = html

  loading.style.display = "none"
  setActiveLink()
}


window.onpopstate = () => {
  handleLocation()
  setActiveLink()
} 
window.route = route

handleLocation()