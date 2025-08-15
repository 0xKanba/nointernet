// Pro Calculator 3D - Ultra-Fast Stock App Version
let currentExpression = '';
let currentResult = '0';
let history = [];
let lastResult = 0;
let shouldResetOnNextInput = false;
let isCalculating = false;

// DOM Elements
const elements = {
    result: document.getElementById('result'),
    expression: document.getElementById('expression'),
    historyList: document.getElementById('history-list'),
    historyPanel: document.getElementById('history-panel'),
    scientificButtons: document.getElementById('scientific-buttons'),
    calculator: document.getElementById('calculator'),
    collapseBtn: document.getElementById('collapse-btn'),
    clearHistoryBtn: document.getElementById('clear-history'),
    historyTitle: document.getElementById('history-title')
};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    loadHistory();
    updateDisplay();
    setupEventListeners();
});

function setupEventListeners() {
    // History panel controls
    if (elements.collapseBtn) {
        elements.collapseBtn.addEventListener('click', toggleHistory);
    }
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
    }
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Touch events for better mobile experience
    setupTouchEvents();
}

// Touch events for mobile
function setupTouchEvents() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.classList.add('pressed');
            
            // Add ripple effect on touch
            const rect = this.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            }, 600);
        });
        
        button.addEventListener('touchend', function() {
            this.classList.remove('pressed');
        });
        
        button.addEventListener('touchcancel', function() {
            this.classList.remove('pressed');
        });
    });
}

// Calculator functions
function appendValue(value) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    // Handle constants
    if (value === 'π') value = Math.PI.toString();
    else if (value === 'e') value = Math.E.toString();
    
    currentExpression += value;
    updateExpression();
}

function appendOperator(operator) {
    if (shouldResetOnNextInput) {
        currentExpression = currentResult;
        shouldResetOnNextInput = false;
    }
    
    // Prevent consecutive operators
    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        currentExpression = currentExpression.slice(0, -1);
    }
    
    currentExpression += operator;
    updateExpression();
}

function appendFunction(func) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    currentExpression += func;
    updateExpression();
}

function calculate() {
    if (!currentExpression || isCalculating) return;
    
    try {
        isCalculating = true;
        if (elements.calculator) {
            elements.calculator.classList.add('calculating');
        }
        
        // Fast calculation with minimal overhead
        setTimeout(() => {
            const result = evaluateExpression(currentExpression);
            
            if (isNaN(result) || !isFinite(result)) {
                showError();
                return;
            }
            
            addToHistory({
                expression: currentExpression,
                result: result,
                timestamp: new Date().toLocaleString()
            });
            
            currentResult = formatNumber(result);
            if (elements.result) {
                elements.result.value = currentResult;
            }
            lastResult = result;
            shouldResetOnNextInput = true;
            
        }, 0); // Immediate execution
        
    } catch (error) {
        showError();
    } finally {
        isCalculating = false;
        if (elements.calculator) {
            elements.calculator.classList.remove('calculating');
        }
    }
}

function evaluateExpression(expr) {
    // Optimized expression cleaning
    let cleanExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/\^/g, '**');
    
    // Direct evaluation (optimized for speed)
    try {
        return Function('"use strict"; return (' + cleanExpr + ')')();
    } catch (e) {
        throw new Error('Invalid expression');
    }
}

// Utility functions
function clearAll() {
    currentExpression = '';
    currentResult = '0';
    updateDisplay();
}

function clearEntry() {
    if (elements.result) {
        elements.result.value = '0';
    }
}

function deleteChar() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        updateExpression();
    }
}

function percentage() {
    if (currentResult !== '0' && elements.result) {
        const result = parseFloat(currentResult) / 100;
        elements.result.value = formatNumber(result);
        currentResult = result.toString();
        shouldResetOnNextInput = true;
    }
}

// History management
function addToHistory(item) {
    history.unshift(item);
    if (history.length > 50) history = history.slice(0, 50);
    updateHistoryDisplay();
    saveHistory();
}

function updateHistoryDisplay() {
    if (!elements.historyList) return;
    
    elements.historyList.innerHTML = '';
    history.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; opacity: 0.7;">${formatExpression(item.expression)}</span>
                <strong>${formatNumber(item.result)}</strong>
            </div>
            <div style="font-size: 10px; opacity: 0.5; margin-top: 2px;">${item.timestamp}</div>
        `;
        li.addEventListener('click', () => {
            if (elements.result) {
                elements.result.value = formatNumber(item.result);
            }
            currentResult = item.result.toString();
            shouldResetOnNextInput = true;
        });
        elements.historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    if (elements.historyList) {
        elements.historyList.innerHTML = '';
    }
    localStorage.removeItem('calc-history');
}

function loadHistory() {
    const savedHistory = localStorage.getItem('calc-history');
    if (savedHistory) {
        try {
            history = JSON.parse(savedHistory);
            updateHistoryDisplay();
        } catch (e) {
            console.error('Error loading history:', e);
            history = [];
        }
    }
}

function saveHistory() {
    try {
        localStorage.setItem('calc-history', JSON.stringify(history));
    } catch (e) {
        console.error('Error saving history:', e);
    }
}

// Display functions
function updateExpression() {
    if (elements.expression) {
        elements.expression.textContent = formatExpression(currentExpression);
    }
    
    // Live preview calculation
    try {
        const result = evaluateExpression(currentExpression);
        if (!isNaN(result) && isFinite(result) && elements.result) {
            elements.result.value = formatNumber(result);
        }
    } catch (e) {
        // Ignore preview errors
    }
}

function updateDisplay() {
    if (elements.result) {
        elements.result.value = currentResult;
    }
    if (elements.expression) {
        elements.expression.textContent = formatExpression(currentExpression);
    }
}

function formatNumber(num) {
    if (typeof num !== 'number') num = parseFloat(num);
    if (isNaN(num) || !isFinite(num)) return 'Error';
    
    // Optimized number formatting
    if (num % 1 === 0 && Math.abs(num) < 1e10) {
        return num.toString();
    }
    
    return parseFloat(num.toPrecision(10)).toString();
}

function formatExpression(expr) {
    return expr
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−')
        .replace(/Math\.sqrt\(/g, '√(')
        .replace(/Math\.sin\(/g, 'sin(')
        .replace(/Math\.cos\(/g, 'cos(')
        .replace(/Math\.tan\(/g, 'tan(')
        .replace(/Math\.log10\(/g, 'log(');
}

// Keyboard support
function handleKeyboardInput(event) {
    const key = event.key;
    
    if (/\d/.test(key)) appendValue(key);
    else if (key === '+') appendOperator('+');
    else if (key === '-') appendOperator('-');
    else if (key === '*') appendOperator('*');
    else if (key === '/') appendOperator('/');
    else if (key === '.') appendValue('.');
    else if (key === '%') percentage();
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') deleteChar();
}

// UI functions
function toggleHistory() {
    if (!elements.historyPanel) return;
    elements.historyPanel.classList.toggle('collapsed');
    elements.collapseBtn.textContent = elements.historyPanel.classList.contains('collapsed') ? '▶' : '▼';
}

function showError() {
    if (elements.result) {
        elements.result.value = 'Error';
        elements.result.classList.add('error');
        
        setTimeout(() => {
            elements.result.classList.remove('error');
            clearAll();
        }, 2000);
    }
}

// Add ripple effect for better UX without performance impact
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 600);
    });
});

// Add dynamic CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
}
@keyframes ripple {
    to { transform: scale(4); opacity: 0; }
}
`;
document.head.appendChild(style);
