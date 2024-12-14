import { setActiveLink } from "./mobile-navbar.js"

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
  
    try {
      const html = await this.fetchPageContent(route)
      this.updateAppContent(html)
      this.updatePageCSS(route)
    } catch (error) {
      this.handleError(error)
    } finally {
      this.hideLoader(loading)
      setActiveLink()
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
    const appPage = document.getElementById("app")
    appPage.innerHTML = ""
  }

  async fetchPageContent(route) {
    return await fetch(route).then((data) => data.text())
  }
  
  updateAppContent(html) {
    const appPage = document.getElementById("app")
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
}
