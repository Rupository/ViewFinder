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