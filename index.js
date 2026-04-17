// --- Dark mode toggle logic ---
function setDarkMode(enabled) {
    const body = document.body;
    const toggleBtn = document.getElementById('dark-mode-toggle');
    const icon = document.querySelector('#dark-mode-toggle i');
    const label = document.querySelector('.theme-toggle-label');

    if (enabled) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        if (icon) icon.className = 'bi bi-brightness-high';
        if (label) label.textContent = 'Light';
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-label', 'Switch to light mode');
            toggleBtn.setAttribute('title', 'Switch to light mode');
        }
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        if (icon) icon.className = 'bi bi-moon';
        if (label) label.textContent = 'Dark';
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
            toggleBtn.setAttribute('title', 'Switch to dark mode');
        }
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.contains('dark-mode');
    setDarkMode(!isDark);
}

window.addEventListener('DOMContentLoaded', () => {
    // Restore dark mode preference
    const darkPref = localStorage.getItem('darkMode') === 'true';
    setDarkMode(darkPref);
    // Add event listener to toggle button
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleDarkMode);
    }
});
// initialization
const sideBarContent = document.querySelector("#sidebar-content")
const content = document.querySelector("#content")

const searchBGContainer = document.querySelector("#search-bg-container")
const searchContainer = document.querySelector("#search-container")
const searchInput = document.querySelector("#search-input")
const searchDropDown = document.querySelector("#search-dropdown")


function initializeDfkiSlideshow() {
    // DFKI Slideshow Logic
    let dfkiSlideIndex = 0;
    const dfkiSlides = document.querySelectorAll('.dfki-slide');
    const dfkiPrevBtn = document.getElementById('dfki-prev');
    const dfkiNextBtn = document.getElementById('dfki-next');
    // Get the new dots container
    const dotsContainer = document.getElementById('dfki-dots-container');

    // Check if all slideshow elements exist on the page
    if (dfkiSlides.length > 0 && dfkiPrevBtn && dfkiNextBtn && dotsContainer) {
        
        // --- Create Dots ---
        dfkiSlides.forEach((slide, index) => {
            const dot = document.createElement('span');
            dot.classList.add('slideshow-dot');
            
            // Add click event to navigate to the slide
            dot.addEventListener('click', () => {
                showDfkiSlide(index);
            });
            
            dotsContainer.appendChild(dot);
        });
        // --- End of Dot Creation ---

        // Store all created dots in a variable
        const dots = dotsContainer.querySelectorAll('.slideshow-dot');

        function showDfkiSlide(n) {
            // Loop slides
            if (n >= dfkiSlides.length) {
                dfkiSlideIndex = 0;
            } else if (n < 0) {
                dfkiSlideIndex = dfkiSlides.length - 1;
            } else {
                dfkiSlideIndex = n;
            }

            // Hide all slides
            dfkiSlides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Deactivate all dots
            dots.forEach(dot => {
                dot.classList.remove('active');
            });

            // Show the active slide
            dfkiSlides[dfkiSlideIndex].classList.add('active');
            // Activate the corresponding dot
            dots[dfkiSlideIndex].classList.add('active');
        }

        // Button Listeners
        dfkiNextBtn.addEventListener('click', () => {
            console.log("Next button clicked");
            showDfkiSlide(dfkiSlideIndex + 1);
        });

        dfkiPrevBtn.addEventListener('click', () => {
            console.log("Previous button clicked");
            showDfkiSlide(dfkiSlideIndex - 1);
        });

        // Show the first slide and activate the first dot initially
        showDfkiSlide(dfkiSlideIndex);
    }
}

const md = window.markdownit({
    breaks: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return `<pre><code class="hljs language-${lang}">` +
                   hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                   '</code></pre>';
          } catch (__) {}
        }
    
        return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
    }
})
md.use(centerImagesPlugin)
md.use(externalLinksPlugin)

let dataCache = {'pages': []}

/**
 * Fetches the json db
 * @returns JS object
 */
async function fetchDB(){

    try{
        const response = await fetch(`data.json`)

        return await response.json()
    }catch(e){
        return 
    }
}


async function fetchContent(path){
    
    try{
        const response = await fetch(path)
        return await response.text()

    }catch(e){
        console.error(e)
        return ""
    }
}


fetchDB().then((data) => {
    for (let x of data['pages']){
        buildSideBar(x.icon, x.name, x.link, x.content)
    }
    dataCache = data
    loadSearchResults(data['pages'])
    loadPage('/about')
})


// Build an icon node safely using DOM APIs so that values coming from
// data.json cannot inject arbitrary HTML/attributes. Pass wrapImg=true to
// wrap the <img> in the sidebar's <div class="icon"> container.
function buildIconNode(icon, wrapImg){
    if (isFileOrLink(icon)){
        const safeSrc = sanitizeUrl(icon)
        const img = document.createElement("img")
        if (safeSrc) img.setAttribute("src", safeSrc)
        img.className = "tw-object-contain"
        img.style.width = "80%"
        if (!wrapImg) return img
        const wrapper = document.createElement("div")
        wrapper.className = "icon"
        wrapper.appendChild(img)
        return wrapper
    }
    if (isEmoji(icon)){
        const p = document.createElement("p")
        p.className = ""
        p.textContent = icon
        return p
    }
    const i = document.createElement("i")
    i.className = (typeof icon === "string" && icon) ? icon : "bi bi-file-earmark"
    return i
}

function buildSideBar(icon, name, link, content){

    const btn = document.createElement("button")
    btn.id = link
    btn.className = "page-link tw-text-base tw-flex tw-flex-gap-1"
    btn.addEventListener("click", () => updateContent(content, icon, name, link))

    btn.appendChild(buildIconNode(icon, true))

    const label = document.createElement("div")
    label.className = ""
    label.textContent = name
    btn.appendChild(label)

    sideBarContent.appendChild(btn)
}

// Ensure content is loaded only from the repo's own content/ directory to
// prevent a malicious data.json from pointing the main view at an arbitrary
// (possibly cross-origin) URL whose HTML would be injected via innerHTML.
function isSafeContentPath(path){
    if (typeof path !== "string") return false
    if (path.includes("\0") || path.includes("..")) return false
    return /^(\.\/)?content\/[A-Za-z0-9._\-\/]+\.(md|html?)$/.test(path)
}

async function updateContent(path, icon, title, link){

    if (!isSafeContentPath(path)){
        console.warn("Refusing to load content from unsafe path:", path)
        return
    }

    const body = await fetchContent(path)

    const iconContainer = document.querySelector("#content-icon")
    iconContainer.replaceChildren(buildIconNode(icon, false))

    if (path.endsWith(".md")){
        // markdown-it is configured with html:false (default), so the rendered
        // output is already escaped; assign as innerHTML to render the result.
        content.innerHTML = md.render(body)
    } else {
        // .html content files are part of this repo (validated above) and are
        // trusted, so we render them as-is.
        content.innerHTML = body
    }

    document.querySelectorAll(".page-link").forEach((ele) => {
        ele.classList.remove("active")
    })

    const activeEl = document.getElementById(link)
    if (activeEl) activeEl.classList.add("active")

    initializeDfkiSlideshow();

    setTimeout(() => {
        const scrollContainer = document.querySelector(".tw-overflow-auto");
        if (scrollContainer) {
            scrollContainer.scrollTop = 0;
        }
    }, 50);
    
}

function loadPage(pageLink){

    const item = dataCache['pages'].find(obj => obj.link === pageLink)

    if (!item){
        console.warn([`Page not found for: ${pageLink}`])
        return
    }

    updateContent(item.content, item.icon, item.name, item.link)
}

function searchOnClick(link){
    loadPage(link)
    setTimeout(closeSearch, 100)
}

function updateSearch(event){

    let searchResults = []

    dataCache['pages'].forEach(item => {
        if (item.name.toLowerCase().startsWith(event.target.value.toLowerCase())){
            searchResults.push(item)
        }
    })

    loadSearchResults(searchResults)

}

function loadSearchResults(data){

    if (data.length === 0){
        return
    }
    searchDropDown.replaceChildren()

    data.forEach((item) => {
        const btn = document.createElement("button")
        btn.className = "tw-flex tw-text-base tw-place-items-center tw-gap-2 tw-rounded-sm tw-cursor-pointer tw-p-2 tw-px-3 tw-w-full hover:tw-bg-[#f1f0ef]"
        btn.addEventListener("click", () => searchOnClick(item.link))

        const iconWrap = document.createElement("div")
        iconWrap.className = "tw-w-[20px] tw-text-sm tw-h-[20px] tw-overflow-hidden tw-rounded-sm"
        iconWrap.appendChild(buildIconNode(item.icon, false))
        btn.appendChild(iconWrap)

        btn.appendChild(document.createTextNode(item.name))

        searchDropDown.appendChild(btn)
    })

}

function searchClickOutside(event){

    if (!searchContainer.contains(event.target)){
        closeSearch()
    }


}

function openSearch(){

    searchBGContainer.classList.remove("tw-hidden")
    setTimeout(() => {
        searchInput.focus()
    }, 1)

    setTimeout(() => window.document.addEventListener("click", searchClickOutside), 100)

}


function closeSearch(){

    searchBGContainer.classList.add("tw-hidden")
    window.document.removeEventListener("click", searchClickOutside)

}

window.addEventListener("keydown", (event) => {
    console.log("press")
    if (event.key === 'Escape'){
        closeSearch()
    }

})
