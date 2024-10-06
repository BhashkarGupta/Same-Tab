// Inject code into the page context to override window.open
(function () {
  var script = document.createElement("script");
  script.textContent = `
    (function() {
      var originalOpen = window.open;
      window.open = function(url, target, features) {
        if (target === "_blank" || !target) {
          target = "_self";
        }
        return window.location.href = url;
      };

      // Remove target="_blank" from links
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
    })();
  `;
  (document.head || document.documentElement).appendChild(script);
  script.parentNode.removeChild(script);
})();
