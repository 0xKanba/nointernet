// Calculator State
let currentExpression = '';
let currentResult = '0';
let shouldResetOnNextInput = false;
let calculationLog = [];

// DOM Elements
const elements = {
  result: document.getElementById('result'),
  expression: document.getElementById('expression'),
  buttons: document.querySelectorAll('.btn'),
  logList: document.getElementById('log-list'),
  toggleLogBtn: document.getElementById('toggle-log'),
  refreshBtn: document.getElementById('refresh-btn'),
  installBtn: document.getElementById('install-btn'),
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadLog();
  bindEvents();
  updateDisplay();
});

function bindEvents() {
  // Button clicks
  elements.buttons.forEach(btn => {
    btn.addEventListener('click', handleButton);
  });

  // Toggle log
  elements.toggleLogBtn?.addEventListener('click', toggleLog);

  // Keyboard support
  document.addEventListener('keydown', handleKeyboard);
}

function handleButton(e) {
  const button = e.currentTarget;
  const action = button.dataset.action;
  const value = button.dataset.value;

  // Visual feedback
  button.classList.add('pressed');
  setTimeout(() => button.classList.remove('pressed'), 100);

  if (action) {
    executeAction(action);
  } else if (value) {
    appendValue(value);
  }
}

function appendValue(val) {
  if (shouldResetOnNextInput) {
    currentExpression = '';
    shouldResetOnNextInput = false;
  }

  // Replace symbols
  if (val === 'π') val = Math.PI;
  if (val === 'e') val = Math.E;

  currentExpression += val;
  updateDisplay();
  calculatePreview();
}

function executeAction(action) {
  switch (action) {
    case 'clearAll':
      currentExpression = '';
      currentResult = '0';
      shouldResetOnNextInput = false;
      break;
    case 'clearEntry':
      currentResult = '0';
      break;
    case 'percentage':
      if (currentResult !== '0') {
        currentResult = (parseFloat(currentResult) / 100).toString();
        currentExpression = currentResult;
        shouldResetOnNextInput = true;
      }
      break;
    case 'deleteChar':
      if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
      }
      break;
    case 'calculate':
      calculateResult();
      return;
  }
  updateDisplay();
}

function calculatePreview() {
  try {
    const result = evaluate(currentExpression);
    if (isFinite(result)) {
      currentResult = formatNumber(result);
    }
  } catch (e) {
    // Silent fail
  }
}

function calculateResult() {
  if (!currentExpression) return;

  try {
    const expr = currentExpression;
    const result = evaluate(expr);

    if (!isFinite(result)) throw new Error('Invalid');

    const formatted = formatNumber(result);
    addToLog(`${expr} = ${formatted}`);
    currentResult = formatted;
    shouldResetOnNextInput = true;

    // Success flash
    elements.result.classList.add('success');
    setTimeout(() => elements.result.classList.remove('success'), 600);
  } catch (e) {
    showError();
  }
  updateDisplay();
}

function evaluate(expr) {
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\^/g, '**');
  expr = expr.replace(/√\(/g, 'Math.sqrt(');
  expr = expr.replace(/sin\(/g, 'Math.sin(');
  expr = expr.replace(/cos\(/g, 'Math.cos(');
  expr = expr.replace(/tan\(/g, 'Math.tan(');
  expr = expr.replace(/log\(/g, 'Math.log10(');
  expr = expr.replace(/ln\(/g, 'Math.log(');

  // Factorial
  expr = expr.replace(/(\d+(\.\d+)?)\!/g, (_, n) => factorial(parseFloat(n)));

  return Function(`"use strict"; return (${expr})`)();
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

function formatNumber(num) {
  if (typeof num !== 'number') num = parseFloat(num);
  if (!isFinite(num)) return 'Error';
  return Math.abs(num % 1) < 1e-9 ? num.toFixed(0) : parseFloat(num.toFixed(8));
}

function updateDisplay() {
  elements.expression.textContent = currentExpression
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−')
    .replace(/\*\*/g, '^');
  elements.result.textContent = currentResult;
}

function showError() {
  elements.result.textContent = 'Error';
  elements.result.classList.add('error');
  setTimeout(() => {
    elements.result.classList.remove('error');
    clearAll();
  }, 1500);
}

function addToLog(entry) {
  calculationLog.unshift(entry);
  calculationLog = calculationLog.slice(0, 21);
  saveLog();
  renderLog();
}

function renderLog() {
  elements.logList.innerHTML = '';
  calculationLog.forEach(item => {
    const li = document.createElement('li');
    li.className = 'log-item';
    li.textContent = item;
    elements.logList.appendChild(li);
  });
}

function saveLog() {
  localStorage.setItem('calcLog', JSON.stringify(calculationLog));
}

function loadLog() {
  const saved = localStorage.getItem('calcLog');
  if (saved) {
    calculationLog = JSON.parse(saved);
    renderLog();
  }
}

function toggleLog() {
  const logContainer = document.querySelector('.log-container');
  const isActive = logContainer.classList.toggle('active');
  elements.toggleLogBtn.textContent = isActive ? '▲' : '▼';
}

// Keyboard support
function handleKeyboard(e) {
  const key = e.key;

  if (['Enter', 'Escape', 'Backspace'].includes(key)) e.preventDefault();

  if (/\d/.test(key)) appendValue(key);
  else if (key === '.') appendValue('.');
  else if (key === '+') appendValue('+');
  else if (key === '-') appendValue('-');
  else if (key === '*') appendValue('*');
  else if (key === '/') appendValue('/');
  else if (key === '(') appendValue('(');
  else if (key === ')') appendValue(')');
  else if (key === '^') appendValue('^');
  else if (key === '%') executeAction('percentage');
  else if (key === 'Backspace') executeAction('deleteChar');
  else if (key === 'Escape') executeAction('clearAll');
  else if (key === 'Enter') calculateResult();
  else if (key === 'p') appendValue('π');
  else if (key === 'e') appendValue('e');
  else if (key === '!') appendValue('!');
}
