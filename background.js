// reload
chrome.action.onClicked.addListener((tab) => {
  if (!tab.url || !tab.url.startsWith('https://news.google.com/stories/')) {
    console.log('Site not permitted!')
    return
  }
  chrome.tabs.reload(tab.id)
  const listener = (id, info) => {
    if (id === tab.id && info.status === 'complete') {
      chrome.tabs.onUpdated.removeListener(listener);
      chrome.scripting.executeScript({ target: { tabId: id }, files: ['content.js'] })
    }
  }
  chrome.tabs.onUpdated.addListener(listener)
})

// query server
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-articles') {
    fetch('https://viewfinder.medialens.dpdns.org/api/v0/colour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message.payload)
      }).then(async response => {
        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true){
          const {done, value} = await reader.read()
          if (done) break

          buffer += decoder.decode(value, {stream:true})
          const chunks = buffer.split('\n\n')
          buffer = chunks.pop()

          for (const chunk of chunks) {
            if (chunk.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(chunk.substring(6))

                if (parsed.status === 'running') {
                  chrome.tabs.sendMessage(tabId, {
                    type: 'server-running',
                    msg: parsed.msg
                  })
                } else if (parsed.status === 'finished') {
                  sendResponse({success: true, data: parsed.data})
                } else if (parsed.status === 'error') {
                  sendResponse({ success:false, error_type:parsed.error_type, error: parsed.msg})
                } 
              } catch (e){
              console.error('Error parsing SSE stream', e)
              }
            }
          }
        }
      }
    ).catch(error => {
        console.error('Fetch error.', error)
        sendResponse({ success: false, error_type:'NetworkError', error: error.message })
      });

      return true;
  }
  
  if (message.type === 'open-visuals') {
    const outlet = message.payload.outlet
    const tabId = sender.tab.id

    chrome.sidePanel.setOptions({
        tabId: tabId,
        path: `assets/html/sidepanel.html?outlet=${encodeURIComponent(outlet)}`,
        enabled: true
    });

    chrome.sidePanel.open({ tabId: tabId })
        .catch((error) => console.error("Error opening panel:", error))
    }
})

// sidepanel handling
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({ enabled: false });
});

async function updatePanelState(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const isAllowed = tab.url && tab.url.startsWith('https://news.google.com/stories/');
    if (!isAllowed) {
      await chrome.sidePanel.setOptions({
        tabId,
        enabled: false
      });
    }
  } catch (error) {
  }
}

chrome.tabs.onActivated.addListener((activeInfo) => updatePanelState(activeInfo.tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    updatePanelState(tabId);
  }
});