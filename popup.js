// Function to set the button text based on activation status
function setButtonText(isActive) {
  const button = document.getElementById("toggleButton");
  button.textContent = isActive
    ? "Deactivate on this Tab"
    : "Activate on this Tab";
}

document.getElementById("toggleButton").addEventListener("click", function () {
  const delayValue = document.getElementById("heroDelay").value;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let activeTab = tabs[0];
    chrome.storage.local.get("activeTabId", function (data) {
      if (data.activeTabId === activeTab.id) {
        // Deactivate the extension on this tab
        chrome.storage.local.remove("activeTabId", function () {
          setButtonText(false);

          chrome.storage.local.set({ noScrollbar: false });
          // Reload the current tab after deactivation
          chrome.tabs.reload(activeTab.id);
        });
        // Optionally, you can also run a script to undo any changes made by the content script
      } else {
        chrome.storage.local.set({ activeTabId: activeTab.id }, function () {
          setButtonText(true);
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ["content.js"],
          });

          chrome.storage.local.set({ noScrollbar: true });

          const url = new URL(tabs[0].url);
          const domainKey = "heroDelay_" + url.hostname; // e.g., heroDelay_example.com

          chrome.storage.local.set({ [domainKey]: delayValue }, function () {
            window.close();
          });
        });
      }
    });
  });
});

// Set the initial button text on popup load
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  let activeTab = tabs[0];
  chrome.storage.local.get("activeTabId", function (data) {
    setButtonText(data.activeTabId === activeTab.id);
  });
});
