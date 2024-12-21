import { setActiveLink, toggleNavStartButton  } from "./mobile-navbar.js"
import { loadExercises} from "./exercises.js"
import { initializeAlphabetCards } from "./alphabet.js"

export class Router {
  routes = {}

  add(routeName, linkPage) {
    this.routes[routeName] = linkPage
  }

  route (event) {
    event = event || window.event
    event.preventDefault()
    window.history.pushState({}, "", event.target.href)
    this.handleLocation()
    setActiveLink()
  } 

  async handleLocation() {
    const path = window.location.pathname
    const route = this.getRoute(path)

    const loading = document.querySelector(".loader")
  
    this.showLoader(loading)
    this.clearAppContent()
    this.clearPageCSS()
    toggleNavStartButton(path)
  
    try {
      const [html, pagesContent] = await Promise.all([
        this.fetchPageContent(route),
        this.loadPagesContent(), // Carrega o conteúdo JSON tratado
      ]);
      this.updateAppContent(html)
      this.renderDynamicContent(path, pagesContent)
      this.updatePageCSS(route)
      
      // Chama o conteúdo específico da rota
      this.handleRouteSpecificLogic(path)

    } catch (error) {
      this.handleError(error)
    } finally {
      this.hideLoader(loading)
      setActiveLink()
    }
  }

  handleRouteSpecificLogic(path) {
    // Mapeia rotas para funções específicas
    const routeHandlers = {
      "/to-be": loadExercises,
      "/alphabet": initializeAlphabetCards,
    }

    // Executa a função correspondente à rota, se existir
    if (routeHandlers[path]) {
      routeHandlers[path]() // Executa a função associada à rota
    }
  }

  getRoute(path) {
    return this.routes[path] || this.routes[404]
  }

  showLoader(loading) {
    const loadingDelay = 500; // Tempo para mostrar a animação
    this.loadingTimeout = setTimeout(() => {
      loading.style.display = "block"
    }, loadingDelay)
  }

  hideLoader(loading) {
    clearTimeout(this.loadingTimeout)
    loading.style.display = "none"
  }

  clearAppContent() {
    const appPage = document.getElementById("main-page")
    appPage.innerHTML = ""
  }

  async fetchPageContent(route) {
    return await fetch(route).then((data) => data.text())
  }
  
  updateAppContent(html) {
    const appPage = document.getElementById("main-page")
    appPage.innerHTML = html
  }
  
  handleError(error) {
    console.error(new Error(`404: Page not found "${error}"`))
  }

  updatePageCSS(path) {
    const pageName = path.split('/').pop().replace('.html', '')
    const cssPath = `/src/css/${pageName}.css`
    
    this.clearPageCSS()

    const cssLinkElement = document.createElement("link")
    cssLinkElement.rel = "stylesheet"
    cssLinkElement.href = cssPath
    cssLinkElement.setAttribute("data-page-css", "true")

    document.head.appendChild(cssLinkElement)
  }

  clearPageCSS() {
    const isCurrentPageCSS = document.querySelector('link[data-page-css="true"]')
    if (isCurrentPageCSS) {
      document.head.removeChild(isCurrentPageCSS)
    }
  }

  renderSection(route, contentData) {
    const data = contentData[route]

    if (!data) {
      console.error(`Content not found for route: ${route}`);
      return ""
    }

    const isHomeRoute = route === "/"

    return `
    <section class="${data.sectionClass}">
      <div class="left-content">
        <h1>${data.title}</h1>
        ${
          isHomeRoute ? `<h2>${data.subtitle}</h2>` : `<p>${data.description}</p>` 
        }
      </div>
      <div class="right-content">
        <img src="${data.imgSrc}" width="272px" height="245px" alt="${data.imgAlt}">
      </div>
    </section>
    `
  }

  async loadPagesContent() {
    const response = await fetch("../../data/pagesContent.json"); // Carrega o JSON do arquivo
    
    if (!response.ok) {
      throw new Error(`Failed to load pages content: ${response.statusText}`);
    }
  
    const contentData = await response.json(); // Converte a resposta para JSON
    
    return contentData
  }

  renderDynamicContent(path, pagesContent) {
    const sectionHTML = this.renderSection(path, pagesContent)
    const appPage = document.getElementById("main-page")
    appPage.insertAdjacentHTML("afterbegin", sectionHTML) 
  }

}
