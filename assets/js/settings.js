document.querySelectorAll('input[name="tone_choice"]').forEach(radio => {
  radio.addEventListener('change', () => {
    chrome.storage.local.set({ tone_choice: radio.value })
  })
})

chrome.storage.local.get('tone_choice', (data) => {
  if (data.tone_choice) {
    document.querySelector(`input[value="${data.tone_choice}"]`).checked = true
  }
})

const btn = document.getElementById('analyze-btn')

async function sync() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  btn.disabled = !tab?.url?.startsWith('https://news.google.com/stories/')
}

btn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  chrome.runtime.sendMessage({
    type: 'trigger-analysis',
    payload: { id: tab.id, url: tab.url }
  })
  window.close()
})

sync()