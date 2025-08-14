// Advanced Calculator - Optimized JavaScript
let currentExpression = '';
let currentResult = '0';
let shouldResetOnNextInput = false;

// Elements
const elements = {
    result: document.getElementById('result'),
    expression: document.getElementById('expression')
};

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    updateDisplay();
    addButtonAnimations();
});

// Append value to expression
function appendValue(value) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    // Handle constants
    if (value === 'π') {
        value = Math.PI.toString();
    } else if (value === 'e') {
        value = Math.E.toString();
    }
    
    currentExpression += value;
    elements.expression.textContent = currentExpression;
    
    // Live preview
    try {
        const result = evaluateExpression(currentExpression);
        if (!isNaN(result) && isFinite(result)) {
            elements.result.value = formatNumber(result);
        }
    } catch (error) {
        // Ignore preview errors
    }
    
    addButtonPressEffect(event?.target);
}

// Append operator
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
    elements.expression.textContent = currentExpression;
    addButtonPressEffect(event?.target);
}

// Append function
function appendFunction(func) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    currentExpression += func;
    elements.expression.textContent = currentExpression;
    addButtonPressEffect(event?.target);
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
        elements.result.value = currentResult;
        shouldResetOnNextInput = true;
        
        // Success effect
        elements.result.style.color = '#34c759';
        elements.result.style.textShadow = '0 0 8px rgba(52, 199, 89, 0.4)';
        setTimeout(() => {
            elements.result.style.color = '';
            elements.result.style.textShadow = '';
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
    elements.result.value = '0';
    shouldResetOnNextInput = false;
    addButtonPressEffect(event?.target);
}

// Clear entry
function clearEntry() {
    elements.result.value = '0';
    addButtonPressEffect(event?.target);
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
                elements.result.value = formatNumber(result);
            } catch (error) {
                elements.result.value = '0';
            }
        } else {
            elements.result.value = '0';
        }
    }
    addButtonPressEffect(event?.target);
}

// Percentage calculation
function percentage() {
    if (currentResult !== '0') {
        const result = parseFloat(currentResult) / 100;
        elements.result.value = formatNumber(result);
        currentResult = result.toString();
        shouldResetOnNextInput = true;
    }
    addButtonPressEffect(event?.target);
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
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Numbers
    if (/\d/.test(key)) {
        appendValue(key);
    }
    // Operators
    else if (key === '+') appendOperator('+');
    else if (key === '-') appendOperator('-');
    else if (key === '*') appendOperator('*');
    else if (key === '/') appendOperator('/');
    // Functions
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Escape') clearAll();
    else if (key === 'Backspace') deleteChar();
    else if (key === '.') appendValue('.');
    else if (key === '%') percentage();
});

// Button animations
function addButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', function() {
            this.classList.add('pressed');
            setTimeout(() => {
                this.classList.remove('pressed');
            }, 150);
        });
    });
}

// Button press effect
function addButtonPressEffect(button) {
    if (!button) return;
    
    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 150);
}

// Show error
function showError() {
    elements.result.value = 'Error';
    elements.result.classList.add('error');
    
    setTimeout(() => {
        elements.result.classList.remove('error');
        clearAll();
    }, 1500);
}

// Update display
function updateDisplay() {
    elements.result.value = currentResult;
    elements.expression.textContent = currentExpression;
}

// Export functions
window.calculatorFunctions = {
    appendValue,
    appendOperator,
    appendFunction,
    calculate,
    clearAll,
    clearEntry,
    deleteChar,
    percentage
};
