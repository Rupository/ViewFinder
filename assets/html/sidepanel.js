const params = new URLSearchParams(window.location.search)
const outlet = params.get('outlet')
    if (outlet) {
        document.getElementById('nicegui-frame').src = 
        `https://viewfinder.medialens.dpdns.org/ui/historical/visualization/${encodeURIComponent(outlet)}`
    } else {
        document.getElementById('nicegui-frame').style.display = 'none'
        chrome.storage.session.get(['curr_content'], val => {
            const curr_content = val.curr_content
            if (!curr_content) return
            render(curr_content.title, curr_content.samples)
            chrome.storage.session.remove('curr_content')
        })
    }

function render(title, samples) {
    const container = document.getElementById('samples');
    container.innerHTML = `<h3>${title}</h3>`;
    const COLOR_MAP = {pro: "#33cc33", neutral: "#ffcc00", anti: "#ff5050"};
    
    for (const {sentence: [left, entity, right], tone, confidence} of samples) {
        const color = COLOR_MAP[tone];
        const row = document.createElement('div');
        row.className = 'row';
        row.innerHTML = `
            <div class="sentence" style="color: ${color}">
                ${left} <b>${entity}</b> ${right}
            </div>
            <div class="meta">
                <span>Political Tone: <b style="color: ${color}">${tone}</b></span>
                <span class="pct">Confidence: ${confidence_pct}%</span>
            </div>
        `;
        container.appendChild(row);
    }
}