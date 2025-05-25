const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const totalCostEl = document.getElementById("totalCost");
const priceSetupBtn = document.getElementById("priceSetupBtn");
const priceSetupModal = document.getElementById("priceSetupModal");
const priceForm = document.getElementById("priceForm");
const closePriceSetup = document.getElementById("closePriceSetup");
const breakdownModal = document.getElementById("breakdownModal");
const breakdownList = document.getElementById("breakdownList");
const closeBreakdown = document.getElementById("closeBreakdown");
const newItemModal = document.getElementById("newItemModal");
const newItemNameEl = document.getElementById("newItemName");
const newItemPrice = document.getElementById("newItemPrice");
const savePrice = document.getElementById("savePrice");
const skipPrice = document.getElementById("skipPrice");

const darkModeToggle = document.getElementById("darkModeToggle");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let priceMap = JSON.parse(localStorage.getItem("priceMap")) || {
  egg: 35,
  milk: 60,
  curd: 42,
  "water jar": 60,
  vegetables: 100,
};

let newItemName = "";

function updateLocal() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("priceMap", JSON.stringify(priceMap));
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.textContent = task;
    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.title = "Remove item";
    delBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      updateLocal();
      renderTasks();
      updateTotal();
    });
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

function updateTotal() {
  let total = 0;
  tasks.forEach((task) => {
    let price = priceMap[task.toLowerCase()];
    if (price === undefined) {
      // Show new item modal to enter price
      newItemName = task;
      newItemNameEl.textContent = newItemName;
      newItemPrice.value = "";
      newItemModal.classList.remove("hidden");
      throw new Error("New item price needed"); // Exit this function till price set
    }
    total += price;
  });
  totalCostEl.textContent = `₹${total}`;
}

function openPriceSetup() {
  priceForm.innerHTML = "";
  for (const [item, price] of Object.entries(priceMap)) {
    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    const label = document.createElement("label");
    label.textContent = `${item.charAt(0).toUpperCase() + item.slice(1)}: `;

    const input = document.createElement("input");
    input.type = "number";
    input.min = 0;
    input.value = price;
    input.dataset.item = item;

    input.addEventListener("input", (e) => {
      const it = e.target.dataset.item;
      const val = Number(e.target.value);
      if (!isNaN(val)) {
        priceMap[it] = val;
        updateLocal();
        updateTotal();
      }
    });

    div.appendChild(label);
    div.appendChild(input);
    priceForm.appendChild(div);
  }
  priceSetupModal.classList.remove("hidden");
}

function openBreakdown() {
  breakdownList.innerHTML = "";
  tasks.forEach((task) => {
    const li = document.createElement("li");
    const price = priceMap[task.toLowerCase()];
    li.textContent = `${task.charAt(0).toUpperCase() + task.slice(1)}: ₹${price}`;
    breakdownList.appendChild(li);
  });
  breakdownModal.classList.remove("hidden");
}

addBtn.addEventListener("click", () => {
  const val = input.value.trim();
  if (val) {
    tasks.push(val);
    updateLocal();
    renderTasks();
    try {
      updateTotal();
    } catch (e) {
      // New item modal will handle
    }
    input.value = "";
    input.focus();
  }
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addBtn.click();
});

priceSetupBtn.addEventListener("click", openPriceSetup);

closePriceSetup.addEventListener("click", () => {
  priceSetupModal.classList.add("hidden");
});

totalCostEl.addEventListener("click", openBreakdown);

closeBreakdown.addEventListener("click", () => {
  breakdownModal.classList.add("hidden");
});

savePrice.addEventListener("click", () => {
  const priceVal = Number(newItemPrice.value);
  if (!isNaN(priceVal) && priceVal >= 0) {
    priceMap[newItemName.toLowerCase()] = priceVal;
    updateLocal();
    newItemModal.classList.add("hidden");
    try {
      updateTotal();
    } catch (e) {}
    renderTasks();
  } else {
    alert("Please enter a valid price");
  }
});

skipPrice.addEventListener("click", () => {
  newItemModal.classList.add("hidden");
  // Remove the last added task (with no price)
  tasks = tasks.filter((t) => t.toLowerCase() !== newItemName.toLowerCase());
  updateLocal();
  renderTasks();
  updateTotal();
});

// DARK MODE TOGGLE

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
}

document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  try {
    updateTotal();
  } catch (e) {}
  // Apply saved theme or system default
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    applyTheme(getSystemTheme());
  }
});

darkModeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  if (isDark) {
    applyTheme("light");
    localStorage.setItem("theme", "light");
  } else {
    applyTheme("dark");
    localStorage.setItem("theme", "dark");
  }
});

