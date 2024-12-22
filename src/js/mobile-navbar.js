export default function initializeMobileNav() {

  // ------ Componentes --------- 
  const menuButtons = document.querySelectorAll(".mobile-menu, .btnClose")
  const nav = document.querySelector(".nav-menu")
  const menuItems = document.querySelectorAll('.nav-list li')
  const menuLinks = document.querySelectorAll(".nav-list a")

  // Variáveis de largura da janela
  const mobileBreakpoint = 798
  let windowWidth = window.innerWidth

  // ----- Mapeamento de classes para ícones ------ 
  const iconMapping = {
    "home": ['fa-solid', 'fa-house'],
    "alphabet": ['fa-solid', 'fa-book'],
    "tobe": ['fa-solid', 'fa-chalkboard-user'],
    "shapes": ['fa-solid', 'fa-shapes'],
    "numbers": ['fa-solid', 'fa-arrow-down-1-9']
  }

  // ---------- Funções -------------- 
  function updateWindowWidth() {
    windowWidth = window.innerWidth
  }

  function toggleMenuMobile(event) {
    if (event.type === "touchstart") {
      event.preventDefault()
    }

    nav.classList.toggle("active")

    updateMenuVisibility()
    updateAriaExpanded()
  }

  function updateAriaExpanded() {
    const isActive = nav.classList.contains("active")
    menuButtons.forEach(button => {
      button.setAttribute("aria-expanded", isActive ? "true" : "false")
    })
  }

  function updateMenuVisibility() {
    const isNavActive = nav.classList.contains("active")

    // Se a tela for menor que mobileBreakpoint
    if (windowWidth < mobileBreakpoint) {
      toggleBodyScroll(isNavActive)
      updateTabIndex(isNavActive)
    } else {
      // Para telas maiores que mobileBreakpoint, os links devem sempre ser acessíveis via Tab
      document.body.classList.remove("no-scroll")
      updateTabIndex(true)
    }

    setTimeout(() => handleOutsideClickListener(isNavActive), 500);

  }

  function toggleBodyScroll(isActive) {
    if(isActive) {
      document.body.classList.add("no-scroll")
    } else {
      document.body.classList.remove("no-scroll")
    }
  }

  function updateTabIndex(isActive) {
    const tabindexValue = isActive ? "0" : "-1"
    menuLinks.forEach(link => {
      link.setAttribute("tabindex", tabindexValue)
    })
  }

  function addIconToItem(item) {
    const link = item.querySelector("a")
    const icon = item.querySelector("i")

    if(!icon) {
      const iconElement = document.createElement("i")
      const className = item.classList[0]

      if(iconMapping[className]) {
        iconElement.classList.add(...iconMapping[className])
        iconElement.style.pointerEvents = "none"
        link.insertBefore(iconElement, link.firstChild)
      }
    }
  }

  function removeIcons() {
    menuItems.forEach(item => {
      const icon = item.querySelector("i")
      if(icon) {
        icon.remove()
      }
    })
  }

  function updateMenuItems() {

    if(windowWidth < mobileBreakpoint) {
      menuItems.forEach(addIconToItem)
    } else {
      removeIcons()
    }
  }

  function toggleLogoMenu() {
    const menu = document.querySelector(".modal-wrapper")

    const existingImg = menu.querySelector('img')

    if (windowWidth < mobileBreakpoint) {
  
      if (!existingImg) {
        const imgElement = document.createElement('img')
        imgElement.src = '/src/public/img/logo.svg'
        imgElement.alt = 'Logo menu';
        imgElement.classList.add('logoMenu')

        menu.insertBefore(imgElement, menu.firstChild)
      }
    } else {

      if (existingImg) {
        existingImg.remove()
      }
    }
  }
  
  function handleOutsideClickListener(isActive) {
    document.removeEventListener("click", handleClickOutside)

    if (isActive) {
      document.addEventListener("click", handleClickOutside)
    }
  }

  function handleClickOutside(event) {
    const elemento = document.querySelector(".modal-wrapper")

    // Verifica se o clique ocorreu fora do elemento e se o menu está ativo
    if (!elemento.contains(event.target) && nav.classList.contains("active")) {
      toggleMenuMobile(new Event("touchstart"))
    }
  }

  // ---- Gerenciamento de eventos de interação e atualização do menu ---
  menuButtons.forEach(button => {
    button.addEventListener("click", toggleMenuMobile)
    button.addEventListener("touchstart", toggleMenuMobile)
  })

  // ----- Fecha o menu ao clicar em um link/rota
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("active")) {
        toggleMenuMobile(new Event("click")) // Reutiliza a função existente para fechar o menu
      }
    })
  })

  // Atualiza a visibilidade do menu, a largura da janela e a exibição dos ícones ao redimensionar
  window.addEventListener("resize", () => {
    updateWindowWidth()
    updateMenuVisibility()
    updateMenuItems()
    toggleLogoMenu()  
  })

  // Define o link ativo ao carregar a página e ao navegar no histórico
  window.addEventListener("load", () => {
    updateMenuItems()
    toggleLogoMenu()
  })

}

export function setActiveLink() { 
  const currentPath = window.location.pathname
  const menuLinks = document.querySelectorAll(".nav-list a")

  menuLinks.forEach(link => {
    const href = link.getAttribute("href")
    
    const isActive = currentPath === href || currentPath.startsWith(`${href}/`) || (currentPath === "/" && href === "/")
    link.classList.toggle("active", isActive)
  })
}

export function toggleNavStartButton(path) {
  const startButton = document.querySelector(".btnStart")
  const nav = document.querySelector("nav")

  if(path == "/") {
    if (!startButton) {  
      const button = document.createElement("a")
      button.href = "/to-be"
      button.classList.add("btnStart", "btnDefault")
      button.textContent = "comece agora"

      nav.appendChild(button);  
    }
  } else {
    
    if (startButton) {
      startButton.remove(); 
    }
  }
}
