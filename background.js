chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const settings = await getSettings();
  const url = new URL(details.url);
  const domainSettings = settings.domains[url.hostname];

  if (domainSettings) {
    chrome.scripting.executeScript({
      target: { tabId: details.tabId },
      func: applyContentScript,
      args: [domainSettings],
      world: "MAIN",
    });
  }
});

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ domains: {} }, (data) => {
      resolve(data);
    });
  });
}

// Function to be injected into the page
function applyContentScript(domainSettings) {
  // Override window.open
  if (domainSettings.overrideWindowOpen) {
    (function () {
      var originalOpen = window.open;
      window.open = function (url, target, features) {
        if (target === "_blank" || !target) {
          target = "_self";
        }
        return (window.location.href = url);
      };
    })();
  }

  // Remove target="_blank" from links
  if (domainSettings.removeTargetBlank) {
    function removeTargetBlank() {
      document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
        link.removeAttribute("target");
      });
    }

    // Run on initial load
    removeTargetBlank();

    // Observe the DOM for new links
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.matches && node.matches('a[target="_blank"]')) {
              node.removeAttribute("target");
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('a[target="_blank"]').forEach(function (link) {
                link.removeAttribute("target");
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
}
