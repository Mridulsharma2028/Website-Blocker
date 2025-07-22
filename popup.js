document.getElementById("addBtn").addEventListener("click", async () => {
  const input = document.getElementById("urlInput");
  const url = input.value.trim();
  if (!url) return;

  const { blocklist = [] } = await chrome.storage.local.get("blocklist");
  if (!blocklist.includes(url)) {
    blocklist.push(url);
    await chrome.storage.local.set({ blocklist });
    updateRules(blocklist);
    renderList(blocklist);
  }
  input.value = "";
});

function renderList(blocklist) {
  const ul = document.getElementById("blockList");
  ul.innerHTML = "";
  blocklist.forEach((site, i) => {
    const li = document.createElement("li");
    li.textContent = site;
    const btn = document.createElement("button");
    btn.textContent = "Remove";
    btn.className = "remove";
    btn.onclick = async () => {
      blocklist.splice(i, 1);
      await chrome.storage.local.set({ blocklist });
      updateRules(blocklist);
      renderList(blocklist);
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

async function updateRules(blocklist) {
  const rules = blocklist.map((url, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/blocked.html" }
    },
    condition: {
      urlFilter: url,
      resourceTypes: ["main_frame"]
    }
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: Array.from({ length: 100 }, (_, i) => i + 1),
    addRules: rules
  });
}

chrome.storage.local.get("blocklist", ({ blocklist = [] }) => renderList(blocklist));
