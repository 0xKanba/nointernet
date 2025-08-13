const result = document.getElementById("result");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");

// تحميل السجل من localStorage
let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

function updateHistory() {
  historyList.innerHTML = "";
  history.slice(-21).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

// عرض السجل عند التحميل
updateHistory();

function appendValue(value) {
  result.value += value;
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
    
    // إضافة إلى السجل
    history.push(entry);
    if (history.length > 50) history = history.slice(-50); // حماية

    localStorage.setItem("calcHistory", JSON.stringify(history));
    updateHistory();

    result.value = res;
  } catch (e) {
    result.value = "خطأ";
    setTimeout(clearDisplay, 1000);
  }
}

// مسح السجل
clearHistoryBtn.addEventListener("click", () => {
  if (confirm("مسح السجل بالكامل؟")) {
    history = [];
    localStorage.removeItem("calcHistory");
    updateHistory();
  }
});

// دعم مفاتيح لوحة المفاتيح
document.addEventListener("keydown", e => {
  const key = e.key;
  if (/[0-9.%+\-*/]/.test(key)) {
    e.preventDefault();
    appendValue(key);
  } else if (key === "Enter") {
    e.preventDefault();
    calculate();
  } else if (key === "Escape") {
    clearDisplay();
  } else if (key === "Backspace") {
    deleteChar();
  }
});
