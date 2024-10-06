document.getElementById("addCurrentDomain").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    chrome.storage.sync.get({ domains: {} }, (data) => {
      if (!data.domains[domain]) {
        data.domains[domain] = { overrideWindowOpen: true, removeTargetBlank: true };
        chrome.storage.sync.set({ domains: data.domains }, () => {
          alert(`Domain ${domain} added with default settings.`);
        });
      } else {
        alert(`Domain ${domain} is already in the list.`);
      }
    });
  });
});
