// Override window.open to force opening in the same tab
(function() {
    var originalOpen = window.open;
    window.open = function(url, target) {
        console.log("Intercepted window.open call:", url, target);
        // Force the target to be '_self' (same tab)
        if (target === '_blank' || !target) {
            target = '_self';
        }
        return window.location.href = url;
    };
})();

// Remove target="_blank" from all links to force them to open in the same tab
document.querySelectorAll('a[target="_blank"]').forEach(function(link) {
    link.removeAttribute('target');  // Remove target="_blank"
    console.log("Modified link to open in the same tab:", link.href);
});
