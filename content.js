const parser = new DOMParser();

const stance_to_colour = {
    "pro":"#33cc33",
    "anti":"#ff5050",
    "neutral":"#ffcc00",
    "unknown":"#999999",
}

let loadTimer = null;
const stories = [];


chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'server-running') {
        const statusText = document.getElementById('overlay-status')
        if (statusText) {
            statusText.innerText = message.msg
        }
    }
})

function injectIcons(Div, circStance, sqrStance, mediaOutlet) {
    const miniDiv = document.createElement('div')

    miniDiv.style.position = "relative"
    miniDiv.style.zIndex = "9999" 
    miniDiv.style.display = "flex"
    miniDiv.style.gap = "5px"   

    let circ = '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#999999"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-42 8-81.5t25-77.5l45 45q-8 28-13 56.48-5 28.48-5 57.52 0 142.37 98.81 241.19Q337.63-140 480-140q142.38 0 241.19-98.81Q820-337.63 820-480q0-142.38-98.9-241.19Q622.21-820 479.71-820q-28.71 0-57.23 4.76Q393.96-810.47 366-802l-46-46q38-14 76.5-23t79.5-9q83.36 0 156.68 31.5Q706-817 760.95-763q54.94 54 87 127Q880-563 880-480t-31.5 156Q817-251 763-197t-127 85.5Q563-80 480-80ZM212.88-699q-20.88 0-35.38-14.62-14.5-14.62-14.5-35.5 0-20.88 14.62-35.38 14.62-14.5 35.5-14.5 20.88 0 35.38 14.62 14.5 14.62 14.5 35.5 0 20.88-14.62 35.38-14.62 14.5-35.5 14.5ZM480-480Z"/></svg>'
    circ = parser.parseFromString(circ, "image/svg+xml").documentElement
    circ.style.width = "20%"
    circ.style.height = "20%"
    circ.style.fill = stance_to_colour[circStance]
    circ.style.cursor = "pointer"
    circ.style.pointerEvents = "auto"
    circ.style.transition = "all 0.2s ease-in-out"
    circ.addEventListener('mouseenter', () => {
        circ.style.transform = "scale(1.1)"
    });
    circ.addEventListener('mouseleave', () => {
        circ.style.transform = "scale(1)"
    })
    circ.addEventListener('click', (e) => {
        e.stopPropagation() 
        e.preventDefault()
    })
    miniDiv.appendChild(circ)

    let sqr = '<svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="#999999"><path d="M200-80q-50 0-85-35t-35-85q0-42 25.5-74t64.5-42v-328q-39-10-64.5-42T80-760q0-50 35-85t85-35q42 0 74 25.5t42 64.5h328q10-39 42.01-64.5T760-880q50 0 85 35t35 85q0 41.98-25.5 73.99T790-644v328q39 10 64.5 42t25.5 74q0 50-35 85t-85 35q-42 0-74-25.5T644-170H316q-10 39-42 64.5T200-80Zm0-620q25.5 0 42.75-17.25T260-760q0-25.5-17.25-42.75T200-820q-25.5 0-42.75 17.25T140-760q0 25.5 17.25 42.75T200-700Zm560 0q25.5 0 42.75-17.25T820-760q0-25.5-17.25-42.75T760-820q-25.5 0-42.75 17.25T700-760q0 25.5 17.25 42.75T760-700ZM316-230h328q8-32 31-55t55-31v-328q-32-8-55-31t-31-55H316q-8 32-31 55t-55 31v328q32 8 55 31t31 55Zm444 90q25.5 0 42.75-17.25T820-200q0-25.5-17.25-42.75T760-260q-25.5 0-42.75 17.25T700-200q0 25.5 17.25 42.75T760-140Zm-560 0q25.5 0 42.75-17.25T260-200q0-25.5-17.25-42.75T200-260q-25.5 0-42.75 17.25T140-200q0 25.5 17.25 42.75T200-140Zm0-620Zm560 0Zm0 560Zm-560 0Z"/></svg>'
    sqr = parser.parseFromString(sqr, "image/svg+xml").documentElement
    sqr.style.width = "20%"
    sqr.style.height = "20%"
    sqr.style.fill = stance_to_colour[sqrStance]
    sqr.style.cursor = "pointer"
    sqr.style.pointerEvents = "auto"
    sqr.style.transition = "all 0.2s ease-in-out"
    sqr.addEventListener('mouseenter', () => {
        sqr.style.transform = "scale(1.1)"
    });
    sqr.addEventListener('mouseleave', () => {
        sqr.style.transform = "scale(1)"
    })

    sqr.addEventListener('click', (e) => {
        e.stopPropagation() 
        e.preventDefault()
        
        chrome.runtime.sendMessage({
            type: 'open-visuals',
            payload: {
                outlet: mediaOutlet,
            }
        })
    })

    miniDiv.appendChild(sqr)
    Div.appendChild(miniDiv)
}

function getStories() {
    const articles = document.querySelectorAll('.MQsxIb')
    articles.forEach(article => {
        if (article.classList.contains('title_extracted')) return
        article.classList.add('title_extracted')
        const mainDiv = article.querySelector('div')
        if (mainDiv) {
            let title = article.querySelector('h4 a').innerText
            let outlet = mainDiv.querySelector('div').querySelector('a').innerText
            let url = article.querySelector('h4 a').href
            stories.push({
                    "title": title,
                    "outlet": outlet,
                    "url": url
                });
        }
    })
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('extension-overlay-root')
    const cssLink = document.getElementById('extension-css-loader')

    if (overlay) {
        overlay.style.transition = 'opacity 0.5s ease'
        overlay.style.opacity = '0'
        
        setTimeout(() => {
            overlay.remove();
            if (cssLink) cssLink.remove()
            document.body.style.overflow = 'auto'
        }, 500)
    }
}

function processArticles() {
    chrome.runtime.sendMessage({
        type: 'get-articles',
        payload: {
            stories: stories,
        }
    }, (response) => {

        if (chrome.runtime.lastError) {
            console.error("Runtime Error:", chrome.runtime.lastError)
            return;
        }
        
        if (response && response.success) {
            console.log(response)
            console.log("Data received gracefully.")
            
            const articles = document.querySelectorAll('.MQsxIb')
            articles.forEach((article) => {
                const mainDiv = article.querySelector('div')
                if (mainDiv) {
                    let title = article.querySelector('h4 a').innerText
                    let outlet = mainDiv.querySelector('div').querySelector('a').innerText
                    
                    let articleData = response.data[title] || {}
                    let hist_est_stance = articleData.historical || "unknown"
                    let curr_est_stance = articleData.current || "unknown"
                    injectIcons(mainDiv, curr_est_stance, hist_est_stance, outlet)
                }
            })
        } else {
            console.error("API Error:", response ? response.error : "Unknown error")
            const statusText = document.getElementById('overlay-status')
            if (statusText) {
                statusText.style.color = '#ff5454'
                statusText.innerText = `${response.error_type || 'Unknown'}: ${response.error || 'Request failed'}`
            }
            
            setTimeout(hideLoadingOverlay, 3000)
        }
        hideLoadingOverlay()
    })
}

async function showLoadingOverlay() {
    if (document.getElementById('extension-overlay-root')) return
    document.body.style.overflow = 'hidden'
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.type = 'text/css'
    cssLink.id = 'extension-css-loader'
    cssLink.href = chrome.runtime.getURL('assets/css/overlay.css')
    document.head.appendChild(cssLink)
    const container = document.createElement('div')
    const url = chrome.runtime.getURL('assets/html/overlay.html')
    const response = await fetch(url)
    const htmlText = await response.text()
    container.innerHTML = htmlText
    document.body.appendChild(container)
}

function finishLoading() {
    mo.disconnect()
    window.scrollTo(0,0)
    processArticles()
}

const onMutation = () => {
    mo.disconnect()
    if (location.href.startsWith('https://news.google.com/stories/')) {
        observe()
        getStories()
        window.scrollTo(0, document.body.scrollHeight)
        clearTimeout(loadTimer)
        loadTimer = setTimeout(finishLoading, 2000)
    }
}

const observe = () => {
    if (location.href.startsWith('https://news.google.com/stories/')) {
        mo.observe(document, {
            subtree: true,
            childList: true,
        })
    }
}

const mo = new MutationObserver(onMutation)

if (location.href.startsWith('https://news.google.com/stories/')) {
    showLoadingOverlay()
    getStories()
    window.scrollTo(0, document.body.scrollHeight)
    loadTimer = setTimeout(finishLoading, 3000)
    observe()
} else {
    observe()
}