document.addEventListener("DOMContentLoaded", () => {
  const domainInput = document.getElementById("domainInput");
  const addDomainButton = document.getElementById("addDomain");
  const domainList = document.getElementById("domainList");
  const checkAllOverride = document.getElementById("checkAllOverride");
  const uncheckAllOverride = document.getElementById("uncheckAllOverride");
  const checkAllTarget = document.getElementById("checkAllTarget");
  const uncheckAllTarget = document.getElementById("uncheckAllTarget");

  function loadDomains() {
    chrome.storage.sync.get({ domains: {} }, (data) => {
      domainList.innerHTML = "";
      for (const [domain, settings] of Object.entries(data.domains)) {
        addDomainRow(domain, settings);
      }
    });
  }

  function addDomainRow(domain, settings) {
    // Ensure settings are initialized
    if (!settings) {
      settings = { overrideWindowOpen: true, removeTargetBlank: true };
    } else {
      // Handle cases where settings properties might be undefined
      if (typeof settings.overrideWindowOpen !== 'boolean') {
        settings.overrideWindowOpen = true;
      }
      if (typeof settings.removeTargetBlank !== 'boolean') {
        settings.removeTargetBlank = true;
      }
    }

    const tr = document.createElement("tr");

    // Domain Cell
    const tdDomain = document.createElement("td");
    tdDomain.textContent = domain;
    tr.appendChild(tdDomain);

    // Override window.open Checkbox
    const tdOverride = document.createElement("td");
    const checkboxOverride = document.createElement("input");
    checkboxOverride.type = "checkbox";
    checkboxOverride.className = "checkbox";
    checkboxOverride.checked = settings.overrideWindowOpen;
    checkboxOverride.addEventListener("change", () =>
      updateDomainSettings(domain, { overrideWindowOpen: checkboxOverride.checked })
    );
    tdOverride.appendChild(checkboxOverride);
    tr.appendChild(tdOverride);

    // Remove target="_blank" Checkbox
    const tdTarget = document.createElement("td");
    const checkboxTarget = document.createElement("input");
    checkboxTarget.type = "checkbox";
    checkboxTarget.className = "checkbox";
    checkboxTarget.checked = settings.removeTargetBlank;
    checkboxTarget.addEventListener("change", () =>
      updateDomainSettings(domain, { removeTargetBlank: checkboxTarget.checked })
    );
    tdTarget.appendChild(checkboxTarget);
    tr.appendChild(tdTarget);

    // Action Cell
    const tdAction = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.className = "btn";
    removeButton.addEventListener("click", () => removeDomain(domain));
    tdAction.appendChild(removeButton);
    tr.appendChild(tdAction);

    domainList.appendChild(tr);
  }

  function addDomain() {
    const domain = domainInput.value.trim();
    if (domain) {
      chrome.storage.sync.get({ domains: {} }, (data) => {
        if (!data.domains[domain]) {
          data.domains[domain] = {
            overrideWindowOpen: true,
            removeTargetBlank: true,
          };
          chrome.storage.sync.set({ domains: data.domains }, loadDomains);
        } else {
          // Ensure existing domain has proper settings
          if (!data.domains[domain].overrideWindowOpen) {
            data.domains[domain].overrideWindowOpen = true;
          }
          if (!data.domains[domain].removeTargetBlank) {
            data.domains[domain].removeTargetBlank = true;
          }
          chrome.storage.sync.set({ domains: data.domains }, loadDomains);
        }
      });
    }
    domainInput.value = "";
  }

  function removeDomain(domain) {
    chrome.storage.sync.get({ domains: {} }, (data) => {
      delete data.domains[domain];
      chrome.storage.sync.set({ domains: data.domains }, loadDomains);
    });
  }

  function updateDomainSettings(domain, updatedSettings) {
    chrome.storage.sync.get({ domains: {} }, (data) => {
      if (!data.domains[domain]) {
        data.domains[domain] = { overrideWindowOpen: true, removeTargetBlank: true };
      }
      data.domains[domain] = { ...data.domains[domain], ...updatedSettings };
      chrome.storage.sync.set({ domains: data.domains });
    });
  }

  function setAllCheckboxes(column, value) {
    chrome.storage.sync.get({ domains: {} }, (data) => {
      for (const domain in data.domains) {
        if (!data.domains[domain]) {
          data.domains[domain] = { overrideWindowOpen: true, removeTargetBlank: true };
        }
        data.domains[domain][column] = value;
      }
      chrome.storage.sync.set({ domains: data.domains }, loadDomains);
    });
  }

  addDomainButton.addEventListener("click", addDomain);
  checkAllOverride.addEventListener("click", () =>
    setAllCheckboxes("overrideWindowOpen", true)
  );
  uncheckAllOverride.addEventListener("click", () =>
    setAllCheckboxes("overrideWindowOpen", false)
  );
  checkAllTarget.addEventListener("click", () =>
    setAllCheckboxes("removeTargetBlank", true)
  );
  uncheckAllTarget.addEventListener("click", () =>
    setAllCheckboxes("removeTargetBlank", false)
  );

  loadDomains();
});
