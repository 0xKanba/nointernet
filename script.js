// Circle Calculator - Optimized JavaScript
let currentExpression = '';
let currentResult = '0';
let shouldResetOnNextInput = false;

// Elements
const elements = {
    result: document.querySelector('.result'),
    expression: document.querySelector('.expression'),
    buttons: document.querySelectorAll('.btn')
};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to buttons
    elements.buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
    
    updateDisplay();
});

// Handle button clicks
function handleButtonClick(e) {
    const button = e.currentTarget;
    const action = button.dataset.action;
    const value = button.dataset.value;
    
    // Add press effect
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 150);
    
    // Handle actions
    if (action) {
        if (action === 'clearAll') clearAll();
        else if (action === 'clearEntry') clearEntry();
        else if (action === 'percentage') percentage();
        else if (action === 'deleteChar') deleteChar();
        else if (action === 'calculate') calculate();
    } 
    // Handle values
    else if (value) {
        appendValue(value);
    }
}

// Append value to expression
function appendValue(value) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    // Handle constants
    if (value === 'π') {
        currentExpression += Math.PI.toString();
    } else if (value === 'e') {
        currentExpression += Math.E.toString();
    } else {
        currentExpression += value;
    }
    
    elements.expression.textContent = currentExpression;
    
    // Live preview
    try {
        const result = evaluateExpression(currentExpression);
        if (!isNaN(result) && isFinite(result)) {
            currentResult = formatNumber(result);
            elements.result.textContent = currentResult;
        }
    } catch (error) {
        // Ignore preview errors
    }
}

// Calculate result
function calculate() {
    if (!currentExpression) return;
    
    try {
        const result = evaluateExpression(currentExpression);
        
        if (isNaN(result) || !isFinite(result)) {
            showError();
            return;
        }
        
        currentResult = formatNumber(result);
        elements.result.textContent = currentResult;
        shouldResetOnNextInput = true;
        
        // Success effect
        elements.result.style.color = '#34c759';
        setTimeout(() => {
            elements.result.style.color = '';
        }, 800);
        
    } catch (error) {
        showError();
    }
}

// Evaluate expression
function evaluateExpression(expr) {
    // Clean expression
    let cleanExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/\^/g, '**');
    
    // Handle factorial
    cleanExpr = cleanExpr.replace(/(\d+(\.\d+)?)\!/g, (match, num) => {
        return factorial(parseFloat(num));
    });
    
    // Safe evaluation
    return Function('"use strict"; return (' + cleanExpr + ')')();
}

// Factorial function
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Clear all
function clearAll() {
    currentExpression = '';
    currentResult = '0';
    elements.expression.textContent = '';
    elements.result.textContent = '0';
    shouldResetOnNextInput = false;
}

// Clear entry
function clearEntry() {
    currentResult = '0';
    elements.result.textContent = '0';
}

// Delete last character
function deleteChar() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        elements.expression.textContent = currentExpression;
        
        // Recalculate preview
        if (currentExpression) {
            try {
                const result = evaluateExpression(currentExpression);
                currentResult = formatNumber(result);
                elements.result.textContent = currentResult;
            } catch (error) {
                elements.result.textContent = '0';
                currentResult = '0';
            }
        } else {
            elements.result.textContent = '0';
            currentResult = '0';
        }
    }
}

// Percentage calculation
function percentage() {
    if (currentResult !== '0') {
        const result = parseFloat(currentResult) / 100;
        currentResult = formatNumber(result);
        elements.result.textContent = currentResult;
        shouldResetOnNextInput = true;
    }
}

// Format number for display
function formatNumber(num) {
    if (typeof num !== 'number') {
        num = parseFloat(num);
    }
    
    if (isNaN(num) || !isFinite(num)) {
        return 'Error';
    }
    
    // Remove extra decimals
    if (num % 1 === 0 && Math.abs(num) < 1e10) {
        return num.toString();
    }
    
    // Dynamic decimal precision
    const decimals = Math.min(6, Math.max(0, 8 - Math.floor(Math.log10(Math.abs(num))));
    return parseFloat(num.toFixed(decimals)).toString();
}

// Keyboard support
function handleKeyboardInput(event) {
    const key = event.key;
    
    // Prevent default for special keys
    if (['Enter', 'Escape', 'Backspace'].includes(key)) {
        event.preventDefault();
    }
    
    // Numbers
    if (/\d/.test(key)) {
        appendValue(key);
    }
    // Operators
    else if (key === '+') appendValue('+');
    else if (key === '-') appendValue('-');
    else if (key === '*') appendValue('*');
    else if (key === '/') appendValue('/');
    // Functions
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') deleteChar();
    else if (key === '.') appendValue('.');
    else if (key === '%') percentage();
    // Special values
    else if (key === 'p') appendValue('π');
    else if (key === 'e') appendValue('e');
    else if (key === '!') appendValue('!');
}

// Show error
function showError() {
    elements.result.textContent = 'Error';
    elements.result.classList.add('error');
    
    setTimeout(() => {
        elements.result.classList.remove('error');
        clearAll();
    }, 1500);
}

// Update display
function updateDisplay() {
    elements.result.textContent = currentResult;
    elements.expression.textContent = currentExpression;
}
