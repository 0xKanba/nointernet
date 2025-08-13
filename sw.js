const result = document.getElementById("result");
const historyList = document.getElementById("history-list");
const historyPanel = document.getElementById("history-panel");
const arrow = document.getElementById("arrow");
const historyTitle = document.getElementById("history-title");
const clearHistoryBtn = document.getElementById("clear-history");
const langBtn = document.getElementById("lang-btn");

// Load history
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

function updateHistory() {
  historyList.innerHTML = "";
  history.slice(-21).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

updateHistory();

// Toggle History
document.querySelector(".history-header").onclick = () => {
  historyPanel.classList.toggle("active");
  arrow.textContent = historyPanel.classList.contains("active") ? "▲" : "▼";
};

// Language Toggle
function toggleLang() {
  const isArabic = document.documentElement.lang === "en";
  document.documentElement.lang = isArabic ? "ar" : "en";
  document.body.dir = isArabic ? "rtl" : "ltr";
  document.body.setAttribute("lang", isArabic ? "ar" : "en");

  // Update UI text
  langBtn.textContent = isArabic ? "English" : "عربي";
  historyTitle.textContent = isArabic ? "السجل" : "History";
  clearHistoryBtn.textContent = isArabic ? "مسح الكل" : "Clear All";
  result.placeholder = "0";
}

// Buttons
function appendValue(val) {
  result.value += val;
}

function clearDisplay() {
  result.value = "";
}

function deleteChar() {
  result.value = result.value.slice(0, -1);
}

function calculate() {
  try {
    const exp = result.value.replace(/×/g, '*').replace(/÷/g, '/');
    const res = eval(exp).toString();
    const entry = `${result.value} = ${res}`;
    
    history.push(entry);
    if (history.length > 50) history = history.slice(-50);
    
    localStorage.setItem("calcHistory", JSON.stringify(history));
    updateHistory();

    result.value = res;
  } catch {
    result.value = "Error";
    setTimeout(clearDisplay, 1200);
  }
}

// Keyboard support
document.addEventListener("keydown", e => {
  if (/[0-9+\-*/.%]/.test(e.key)) {
    e.preventDefault();
    appendValue(e.key);
  } else if (e.key === "Enter") {
    e.preventDefault();
    calculate();
  } else if (e.key === "Escape") {
    clearDisplay();
  } else if (e.key === "Backspace") {
    deleteChar();
  }
});

// Theme based on system
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
}
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', e => {
    document.body.classList.toggle('dark', e.matches);
  });
