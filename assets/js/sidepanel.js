const params = new URLSearchParams(window.location.search)
const title = params.get('title')
const outlet = params.get('outlet')
chrome.storage.local.get('tone_choice', (data) => {
    const toneChoice = data.tone_choice || 'EST'
    console.log(toneChoice)

    if (outlet) {
        document.getElementById('nicegui-frame').src = 
            `https://viewfinder.medialens.dpdns.org/ui/historical/visualization/${encodeURIComponent(outlet)}/${encodeURIComponent(toneChoice)}`
    } else {
        document.getElementById('nicegui-frame').style.display = 'none'
        chrome.storage.session.get(['curr_content'], val => {
            const samples = val.curr_content
            if (!samples) return
            render(title, samples)
            chrome.storage.session.remove('curr_content')
        })
    }
})

function render(title, samples) {
    const container = document.getElementById('samples')
    container.innerHTML = `
    <br>
    <h3>${title}</h3>
    <br><br>
    <div class="legend">
      <span class="dot pro"></span> positive
      <span class="dot neu"></span> neutral
      <span class="dot anti"></span> negative
    </div>
    <br>
    `
    const COLOR_MAP = {pro: "#33cc33", neutral: "#ffcc00", anti: "#ff5050"}
    
    for (const {sentence: [left, entity, right], tone, confidence, vector: [pro_pct, neu_pct, ant_pct]} of samples) {
        const color = COLOR_MAP[tone]

        let displayTone = tone
        if (tone === "pro") {
            displayTone = "positive"
        } else if (tone === "anti") {
            displayTone = "negative"
        }
        
        const row = document.createElement('div')
        row.className = 'row'
        row.innerHTML = `
            <div class="sentence">
                ${left} <b style="color: ${color}">${entity}</b> ${right}
            </div>
            <div class="meta">
                <span>[pos: ${pro_pct}%, neutral: ${neu_pct}%, neg: ${ant_pct}%]
                <br><br>
                Political Tone: <b style="color: ${color}">${displayTone}</b> (confidence: ${confidence}%)
                </span>
            </div>
        `
        container.appendChild(row)
    }

    container.style.display = 'block'
}