// DOM Elements
const resultInput = document.getElementById('result');
const expressionDiv = document.getElementById('expression');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const collapseBtn = document.getElementById('collapse-btn');
const historyPanel = document.getElementById('history-panel');
const buttonsGrid = document.querySelector('.buttons-grid');

// Calculator state
let currentInput = '0';
let expression = '';
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let isHistoryCollapsed = false;
let lastCalculationTime = 0;
const MIN_CALCULATION_INTERVAL = 50; // ms

// Initialize calculator
function initCalculator() {
    updateDisplay();
    renderHistory();
    
    // Add event listeners
    clearHistoryBtn.addEventListener('click', clearHistory);
    collapseBtn.addEventListener('click', toggleHistoryCollapse);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyPress);
    
    // Setup button event delegation
    setupButtonDelegation();
}

// Setup button event delegation for optimal performance
function setupButtonDelegation() {
    buttonsGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        
        // Performance optimization: prevent rapid successive calculations
        if (btn.dataset.action === 'calculate') {
            const now = Date.now();
            if (now - lastCalculationTime < MIN_CALCULATION_INTERVAL) return;
            lastCalculationTime = now;
        }
        
        // Handle button actions
        if (btn.dataset.val !== undefined) {
            appendNumber(btn.dataset.val);
        } else if (btn.dataset.op !== undefined) {
            appendOperator(btn.dataset.op);
        } else if (btn.dataset.action === 'clearAll') {
            clearAll();
        } else if (btn.dataset.action === 'clearEntry') {
            clearEntry();
        } else if (btn.dataset.action === 'delete') {
            deleteChar();
        } else if (btn.dataset.action === 'calculate') {
            calculate();
        }
    });
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
    if (e.key >= '0' && e.key <= '9') {
        appendNumber(e.key);
    } else if (e.key === '.') {
        appendNumber('.');
    } else if (['+', '-', '*', '/'].includes(e.key)) {
        appendOperator(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Escape') {
        clearAll();
    } else if (e.key === 'Backspace') {
        deleteChar();
    } else if (e.key === '%') {
        handlePercentage();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    
    // For mobile: show history panel when there's history
    if (history.length > 0) {
        historyPanel.style.display = 'block';
    }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}
