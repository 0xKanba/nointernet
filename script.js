'use strict';

// DOM Elements - cached for performance
const resultInput = document.getElementById('result');
const expressionDiv = document.getElementById('expression');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const buttonsGrid = document.querySelector('.buttons-grid');

// Calculator state
let currentInput = '0';
let expression = '';
let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
let lastCalculationTime = 0;
const MIN_CALCULATION_INTERVAL = 30; // ms

// Initialize calculator with performance optimizations
function initCalculator() {
    // Direct property access for faster updates
    resultInput.value = '0';
    expressionDiv.textContent = '';
    
    // Render history immediately
    renderHistory();
    
    // Setup optimized event delegation
    setupEventDelegation();
    
    // Keyboard support with debounce
    document.addEventListener('keydown', handleKeyPress, { passive: true });
}

// Setup single event listener for all buttons
function setupEventDelegation() {
    buttonsGrid.addEventListener('click', function(e) {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        
        // Skip if calculation is in progress
        if (btn.dataset.action === 'calculate') {
            const now = Date.now();
            if (now - lastCalculationTime < MIN_CALCULATION_INTERVAL) return;
            lastCalculationTime = now;
        }
        
        // Direct action handling
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
    }, { passive: true });
    
    // Clear history button
    clearHistoryBtn.addEventListener('click', clearHistory, { passive: true });
}

// Update display with minimal DOM operations
function updateDisplay() {
    // Direct property assignment for speed
    resultInput.value = formatNumber(currentInput);
    expressionDiv.textContent = expression;
}

// Optimized number formatting
function formatNumber(num) {
    if (num === '' || num === '0') return '0';
    
    // Fast scientific notation check
    if (num.includes('e')) return num;
    
    // Direct number conversion
    const n = +num;
    if (isNaN(n)) return '0';
    
    // Fast decimal check
    if (!num.includes('.')) return n.toLocaleString();
    
    // Optimized decimal formatting
    return n.toLocaleString(undefined, {
        maximumFractionDigits: 10,
        useGrouping: true
    });
}

// Append number with minimal operations
function appendNumber(num) {
    // Fast path for reset state
    if (currentInput === '0' && num !== '.') {
        currentInput = num;
        updateDisplay();
        return;
    }
    
    // Fast decimal check
    if (num === '.' && currentInput.includes('.')) return;
    
    // Direct string concatenation
    currentInput += num;
    updateDisplay();
}

// Append operator with minimal operations
function appendOperator(op) {
    // Special handling for percentage
    if (op === '%') {
        handlePercentage();
        return;
    }
    
    // Fast path for empty expression
    if (expression === '') {
        expression = currentInput === '0' ? '0' : currentInput;
        currentInput = '0';
        updateDisplay();
        return;
    }
    
    // Replace last operator if needed
    const lastChar = expression[expression.length - 1];
    if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
    } else {
        expression += (currentInput === '0' ? '0' : currentInput) + op;
        currentInput = '0';
    }
    
    updateDisplay();
}

// Handle percentage with minimal operations
function handlePercentage() {
    if (expression === '') {
        currentInput = (+currentInput / 100).toString();
    } else {
        const lastNumber = +currentInput;
        const percentageValue = lastNumber / 100;
        
        // Direct assignment
        currentInput = percentageValue.toString();
    }
    updateDisplay();
}

// Clear all with direct assignment
function clearAll() {
    currentInput = '0';
    expression = '';
    updateDisplay();
}

// Clear entry with direct assignment
function clearEntry() {
    currentInput = '0';
    updateDisplay();
}

// Delete character with minimal operations
function deleteChar() {
    currentInput = currentInput.length > 1 
        ? currentInput.slice(0, -1) 
        : '0';
    updateDisplay();
}

// Calculate with error handling
function calculate() {
    if (expression === '' && currentInput === '0') return;
    
    let fullExpression = expression + currentInput;
    
    try {
        // Fast operator replacement
        fullExpression = fullExpression
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Direct evaluation
        const result = safeEval(fullExpression);
        
        // Add to history
        addToHistory(expression + currentInput, result);
        
        // Update state
        currentInput = result.toString();
        expression = '';
        updateDisplay();
    } catch (e) {
        currentInput = 'Error';
        updateDisplay();
        setTimeout(clearError, 1000);
    }
}

// Safe evaluation with minimal overhead
function safeEval(expr) {
    // Fast validation
    if (!/^[\d+\-*/.()% ]+$/.test(expr)) {
        throw new Error('Invalid expression');
    }
    
    // Direct evaluation
    return Function(`'use strict'; return (${expr})`)();
}

// Add to history with minimal operations
function addToHistory(expr, result) {
    // Direct array manipulation
    history.unshift({
        expression: expr,
        result: result,
        timestamp: Date.now()
    });
    
    // Keep only last 10 items
    if (history.length > 10) {
        history.length = 10;
    }
    
    // Direct localStorage update
    localStorage.setItem('calcHistory', JSON.stringify(history));
    
    // Render immediately
    renderHistory();
}

// Render history with document fragment
function renderHistory() {
    if (!history.length) {
        historyList.innerHTML = '';
        return;
    }
    
    // Use document fragment for minimal reflows
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < Math.min(history.length, 10); i++) {
        const item = history[i];
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <span class="history-expression">${item.expression} =</span>
            <span class="history-result">${formatNumber(item.result.toString())}</span>
        `;
        
        // Direct event attachment
        li.onclick = () => {
            currentInput = item.result.toString();
            updateDisplay();
        };
        
        fragment.appendChild(li);
    }
    
    historyList.innerHTML = '';
    historyList.appendChild(fragment);
}

// Clear history with direct operations
function clearHistory() {
    history = [];
    localStorage.removeItem('calcHistory');
    historyList.innerHTML = '';
}

// Clear error state
function clearError() {
    if (currentInput === 'Error') {
        currentInput = '0';
        updateDisplay();
    }
}

// Handle keyboard input with debounce
function handleKeyPress(e) {
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        appendNumber(key);
    } else if (key === '.') {
        appendNumber('.');
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteChar();
    } else if (key === '%') {
        handlePercentage();
    }
}

// Initialize calculator
document.addEventListener('DOMContentLoaded', initCalculator);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    });
}
