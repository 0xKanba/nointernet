// DOM Elements
const resultInput = document.getElementById('result');
const expressionDiv = document.getElementById('expression');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const collapseBtn = document.getElementById('collapse-btn');
const historyPanel = document.getElementById('history-panel');

// Calculator state
let currentInput = '0';
let expression = '';
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let isHistoryCollapsed = false;

// Initialize calculator
function initCalculator() {
    updateDisplay();
    renderHistory();
    
    // Add event listeners to buttons
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appendNumber(btn.dataset.val);
            animateButton(btn);
        });
    });
    
    document.querySelectorAll('.operator-btn, .function-btn[data-op]').forEach(btn => {
        btn.addEventListener('click', () => {
            appendOperator(btn.dataset.op);
            animateButton(btn);
        });
    });
    
    // Action buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'clearAll') clearAll();
            else if (action === 'clearEntry') clearEntry();
            else if (action === 'delete') deleteChar();
            else if (action === 'calculate') calculate();
            animateButton(btn);
        });
    });
    
    // History buttons
    clearHistoryBtn.addEventListener('click', clearHistory);
    collapseBtn.addEventListener('click', toggleHistoryCollapse);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
}

// Button animation
function animateButton(btn) {
    btn.classList.add('active');
    setTimeout(() => {
        btn.classList.remove('active');
    }, 100);
}

// Update display
function updateDisplay() {
    resultInput.value = formatNumber(currentInput);
    expressionDiv.textContent = expression;
}

// Format number with commas
function formatNumber(num) {
    if (num === '') return '0';
    
    // Handle scientific notation
    if (num.includes('e')) return num;
    
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    
    // Format with commas and up to 10 decimal places
    return number.toLocaleString(undefined, {
        maximumFractionDigits: 10
    });
}

// Append number to current input
function appendNumber(num) {
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
    } else if (num === '.' && currentInput.includes('.')) {
        // Only one decimal point allowed
        return;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

// Append operator
function appendOperator(op) {
    // Special handling for percentage
    if (op === '%') {
        handlePercentage();
        return;
    }
    
    // If we have a current input, add it to expression
    if (currentInput !== '0' || expression === '') {
        expression += currentInput === '0' && expression !== '' ? '0' : currentInput;
        currentInput = '0';
    }
    
    // Replace the last operator if needed
    const lastChar = expression.slice(-1);
    if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        expression = expression.slice(0, -1);
    }
    
    expression += op;
    updateDisplay();
}

// Handle percentage calculation
function handlePercentage() {
    if (expression === '') {
        // Percentage of the current input
        currentInput = (parseFloat(currentInput) / 100).toString();
    } else {
        // Percentage of the last value in expression
        const lastNumber = parseFloat(currentInput);
        const percentageValue = lastNumber / 100;
        
        // If the last operator is + or -, calculate percentage of the result so far
        const lastOperator = expression.slice(-1);
        if (lastOperator === '+' || lastOperator === '-') {
            // Calculate the value so far without the last operator
            const exprWithoutLastOp = expression.slice(0, -1);
            const partialResult = safeEval(exprWithoutLastOp);
            const percentage = partialResult * percentageValue;
            
            currentInput = percentage.toString();
        } else {
            currentInput = percentageValue.toString();
        }
    }
    updateDisplay();
}

// Clear all
function clearAll() {
    currentInput = '0';
    expression = '';
    updateDisplay();
}

// Clear entry
function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

// Delete last character
function deleteChar() {
    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Calculate result
function calculate() {
    if (expression === '' && currentInput === '0') return;
    
    let fullExpression = expression + currentInput;
    
    try {
        // Replace display operators with JavaScript operators
        fullExpression = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Evaluate the expression
        const result = safeEval(fullExpression);
        
        // Save to history
        addToHistory(expression + currentInput, result);
        
        // Update display
        currentInput = result.toString();
        expression = '';
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        expression = '';
        updateDisplay();
        setTimeout(() => {
            currentInput = '0';
            updateDisplay();
        }, 1500);
    }
}

// Safe eval function
function safeEval(expr) {
    // Validate expression to prevent security issues
    if (!/^[\d+\-*/.()% ]+$/.test(expr)) {
        throw new Error('Invalid expression');
    }
    
    // Use Function constructor as a safer alternative to eval
    return Function(`'use strict'; return (${expr})`)();
}

// Add calculation to history
function addToHistory(expr, result) {
    history.unshift({
        expression: expr,
        result: result,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 items
    if (history.length > 10) {
        history.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('calcHistory', JSON.stringify(history));
    
    // Render history
    renderHistory();
}

// Render history
function renderHistory() {
    historyList.innerHTML = '';
    
    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <span class="history-expression">${item.expression} =</span>
            <span class="history-result">${formatNumber(item.result.toString())}</span>
        `;
        historyList.appendChild(li);
        
        // Click to reuse result
        li.addEventListener('click', () => {
            currentInput = item.result.toString();
            updateDisplay();
        });
    });
}

// Clear history
function clearHistory() {
    history = [];
    localStorage.removeItem('calcHistory');
    renderHistory();
}

// Toggle history collapse
function toggleHistoryCollapse() {
    isHistoryCollapsed = !isHistoryCollapsed;
    historyPanel.classList.toggle('collapsed', isHistoryCollapsed);
    collapseBtn.textContent = isHistoryCollapsed ? '▶' : '▼';
}

// Handle keyboard input
function handleKeyPress(e) {
    const button = getButtonForKey(e.key);
    if (button) {
        animateButton(button);
        button.click();
    }
}

// Get button for keyboard key
function getButtonForKey(key) {
    const keyMap = {
        '0': '[data-val="0"]',
        '1': '[data-val="1"]',
        '2': '[data-val="2"]',
        '3': '[data-val="3"]',
        '4': '[data-val="4"]',
        '5': '[data-val="5"]',
        '6': '[data-val="6"]',
        '7': '[data-val="7"]',
        '8': '[data-val="8"]',
        '9': '[data-val="9"]',
        '.': '[data-val="."]',
        '+': '[data-op="+"]',
        '-': '[data-op="-"]',
        '*': '[data-op="*"]',
        '/': '[data-op="/"]',
        '%': '[data-op="%"]',
        'Enter': '[data-action="calculate"]',
        '=': '[data-action="calculate"]',
        'Escape': '[data-action="clearAll"]',
        'Backspace': '[data-action="delete"]'
    };
    
    const selector = keyMap[key];
    return selector ? document.querySelector(selector) : null;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initCalculator);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
