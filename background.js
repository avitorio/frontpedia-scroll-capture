chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.local.get("activeTabId", function (data) {
      if (data.activeTabId === tabId) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ["content.js"],
          },
          (injectionResults) => {
            for (const frameResult of injectionResults) {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              } else {
                console.log(
                  `Injected content.js into frame ${frameResult.frameId}`
                );
              }
            }
          }
        );
      }
    });
  }
});
