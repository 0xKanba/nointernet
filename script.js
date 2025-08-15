class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.isScientificMode = false;
        this.lastResult = 0;
        
        this.initializeElements();
        this.bindEvents();
        this.loadHistory();
        this.updateDisplay();
        
        // Performance optimizations
        this.debounceTimeout = null;
        this.animationFrame = null;
    }

    initializeElements() {
        // Display elements
        this.display = document.getElementById('result');
        this.expressionDisplay = document.querySelector('.expression');
        
        // History elements
        this.historyList = document.getElementById('history-list');
        this.historyPanel = document.querySelector('.history-panel');
        this.collapseBtn = document.querySelector('.collapse-btn');
        this.clearHistoryBtn = document.querySelector('.clear-btn');
        
        // Button containers
        this.buttonsGrid = document.querySelector('.buttons-grid');
        this.modeButtons = document.querySelector('.mode-buttons');
        
        // Create buttons dynamically for better performance
        this.createButtons();
    }

    createButtons() {
        // Clear existing buttons
        this.buttonsGrid.innerHTML = '';
        this.modeButtons.innerHTML = '';
        
        // Main calculator buttons layout
        const buttonLayout = [
            { text: 'AC', class: 'clear-btn', action: 'clear' },
            { text: '±', class: 'function-btn', action: 'toggleSign' },
            { text: '%', class: 'function-btn', action: 'percent' },
            { text: '÷', class: 'operator-btn', action: 'operator', value: '/' },
            
            { text: '7', class: 'number-btn', action: 'number', value: '7' },
            { text: '8', class: 'number-btn', action: 'number', value: '8' },
            { text: '9', class: 'number-btn', action: 'number', value: '9' },
            { text: '×', class: 'operator-btn', action: 'operator', value: '*' },
            
            { text: '4', class: 'number-btn', action: 'number', value: '4' },
            { text: '5', class: 'number-btn', action: 'number', value: '5' },
            { text: '6', class: 'number-btn', action: 'number', value: '6' },
            { text: '−', class: 'operator-btn', action: 'operator', value: '-' },
            
            { text: '1', class: 'number-btn', action: 'number', value: '1' },
            { text: '2', class: 'number-btn', action: 'number', value: '2' },
            { text: '3', class: 'number-btn', action: 'number', value: '3' },
            { text: '+', class: 'operator-btn', action: 'operator', value: '+' },
            
            { text: '0', class: 'number-btn', action: 'number', value: '0' },
            { text: '.', class: 'number-btn', action: 'decimal' },
            { text: '⌫', class: 'function-btn', action: 'backspace' },
            { text: '=', class: 'equals-btn', action: 'equals' }
        ];
        
        // Scientific mode buttons
        const scientificButtons = [
            { text: 'sin', action: 'scientific', value: 'sin' },
            { text: 'cos', action: 'scientific', value: 'cos' },
            { text: 'tan', action: 'scientific', value: 'tan' },
            { text: 'ln', action: 'scientific', value: 'ln' },
            { text: 'log', action: 'scientific', value: 'log' },
            { text: '√', action: 'scientific', value: 'sqrt' },
            { text: 'x²', action: 'scientific', value: 'square' },
            { text: 'xʸ', action: 'scientific', value: 'power' },
            { text: '1/x', action: 'scientific', value: 'reciprocal' },
            { text: 'π', action: 'scientific', value: 'pi' },
            { text: 'e', action: 'scientific', value: 'e' },
            { text: '!', action: 'scientific', value: 'factorial' },
            { text: '(', action: 'scientific', value: '(' },
            { text: ')', action: 'scientific', value: ')' },
            { text: 'C', action: 'toggleMode' },
            { text: 'Sci', action: 'toggleMode' }
        ];
        
        // Create main buttons with optimized event handling
        buttonLayout.forEach(btn => {
            const button = this.createButton(btn);
            this.buttonsGrid.appendChild(button);
        });
        
        // Create scientific buttons
        scientificButtons.forEach(btn => {
            const button = this.createScientificButton(btn);
            this.modeButtons.appendChild(button);
        });
    }

    createButton(config) {
        const button = document.createElement('button');
        button.className = `btn ${config.class}`;
        button.textContent = config.text;
        button.dataset.action = config.action;
        if (config.value) button.dataset.value = config.value;
        
        // Optimized event listeners
        button.addEventListener('click', this.handleButtonClick.bind(this), { passive: true });
        button.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        
        return button;
    }

    createScientificButton(config) {
        const button = document.createElement('button');
        button.className = 'sci-btn';
        button.textContent = config.text;
        button.dataset.action = config.action;
        if (config.value) button.dataset.value = config.value;
        
        button.addEventListener('click', this.handleButtonClick.bind(this), { passive: true });
        button.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        
        return button;
    }

    bindEvents() {
        // Keyboard support with optimized handling
        document.addEventListener('keydown', this.handleKeyboard.bind(this), { passive: false });
        
        // History panel events
        if (this.collapseBtn) {
            this.collapseBtn.addEventListener('click', this.toggleHistory.bind(this), { passive: true });
        }
        
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', this.clearHistory.bind(this), { passive: true });
        }
        
        // History item clicks
        if (this.historyList) {
            this.historyList.addEventListener('click', this.handleHistoryClick.bind(this), { passive: true });
        }
        
        // Prevent context menu on long press for mobile
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('btn') || e.target.classList.contains('sci-btn')) {
                e.preventDefault();
            }
        });
        
        // Performance optimization: prevent scrolling on calculator area
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.calculator')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    handleButtonClick(event) {
        event.preventDefault();
        const button = event.target;
        
        // Visual feedback with optimized animation
        this.animateButton(button);
        
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        // Use requestAnimationFrame for smooth updates
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.animationFrame = requestAnimationFrame(() => {
            this.performAction(action, value);
        });
    }

    handleTouchStart(event) {
        const button = event.target;
        button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    animateButton(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    performAction(action, value) {
        switch (action) {
            case 'number':
                this.inputNumber(value);
                break;
            case 'operator':
                this.inputOperator(value);
                break;
            case 'decimal':
                this.inputDecimal();
                break;
            case 'equals':
                this.calculate();
                break;
            case 'clear':
                this.clear();
                break;
            case 'backspace':
                this.backspace();
                break;
            case 'toggleSign':
                this.toggleSign();
                break;
            case 'percent':
                this.percent();
                break;
            case 'scientific':
                this.scientificFunction(value);
                break;
            case 'toggleMode':
                this.toggleScientificMode();
                break;
        }
        
        this.updateDisplay();
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        
        // Limit input length for performance
        if (this.currentInput.length > 12) {
            this.currentInput = this.currentInput.slice(0, 12);
        }
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const result = this.performCalculation();
            
            this.currentInput = `${parseFloat(result.toFixed(10))}`;
            this.previousInput = result;
        }

        this.waitingForOperand = true;
        this.operator = nextOperator;
    }

    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentInput = '0.';
            this.waitingForOperand = false;
        } else if (this.currentInput.indexOf('.') === -1) {
            this.currentInput += '.';
        }
    }

    calculate() {
        if (this.operator && this.previousInput !== '' && !this.waitingForOperand) {
            const result = this.performCalculation();
            const expression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${this.currentInput} = ${result}`;
            
            this.addToHistory(expression);
            this.currentInput = `${parseFloat(result.toFixed(10))}`;
            this.lastResult = result;
            this.previousInput = '';
            this.operator = '';
            this.waitingForOperand = true;
        }
    }

    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);

        switch (this.operator) {
            case '+':
                return prev + current;
            case '-':
                return prev - current;
            case '*':
                return prev * current;
            case '/':
                return current !== 0 ? prev / current : 0;
            default:
                return current;
        }
    }

    scientificFunction(func) {
        const num = parseFloat(this.currentInput);
        let result;

        switch (func) {
            case 'sin':
                result = Math.sin(num * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(num * Math.PI / 180);
                break;
            case 'tan':
                result = Math.tan(num * Math.PI / 180);
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case 'sqrt':
                result = Math.sqrt(num);
                break;
            case 'square':
                result = num * num;
                break;
            case 'reciprocal':
                result = num !== 0 ? 1 / num : 0;
                break;
            case 'factorial':
                result = this.factorial(Math.floor(num));
                break;
            case 'pi':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            default:
                result = num;
        }

        const expression = `${func}(${num}) = ${result}`;
        this.addToHistory(expression);
        this.currentInput = `${parseFloat(result.toFixed(10))}`;
        this.lastResult = result;
        this.waitingForOperand = true;
    }

    factorial(n) {
        if (n < 0 || n > 170) return 0; // Prevent overflow
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
    }

    backspace() {
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
    }

    toggleSign() {
        if (this.currentInput !== '0') {
            this.currentInput = this.currentInput.charAt(0) === '-' 
                ? this.currentInput.slice(1) 
                : '-' + this.currentInput;
        }
    }

    percent() {
        const num = parseFloat(this.currentInput);
        this.currentInput = `${num / 100}`;
        this.waitingForOperand = true;
    }

    toggleScientificMode() {
        this.isScientificMode = !this.isScientificMode;
        this.modeButtons.style.display = this.isScientificMode ? 'grid' : 'none';
    }

    updateDisplay() {
        // Optimized display update with debouncing
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            if (this.display) {
                this.display.value = this.formatNumber(this.currentInput);
            }
            
            if (this.expressionDisplay) {
                const expression = this.operator 
                    ? `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`
                    : '';
                this.expressionDisplay.textContent = expression;
            }
        }, 10);
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        // Scientific notation for very large/small numbers
        if (Math.abs(number) >= 1e12 || (Math.abs(number) < 1e-6 && number !== 0)) {
            return number.toExponential(6);
        }
        
        // Format with appropriate decimal places
        const formatted = number.toFixed(10).replace(/\.?0+$/, '');
        return formatted.length > 12 ? number.toPrecision(6) : formatted;
    }

    getOperatorSymbol(operator) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[operator] || operator;
    }

    handleKeyboard(event) {
        const key = event.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/.='.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            event.preventDefault();
        }
        
        if ('0123456789'.includes(key)) {
            this.performAction('number', key);
        } else if (key === '.') {
            this.performAction('decimal');
        } else if (key === '+') {
            this.performAction('operator', '+');
        } else if (key === '-') {
            this.performAction('operator', '-');
        } else if (key === '*') {
            this.performAction('operator', '*');
        } else if (key === '/') {
            this.performAction('operator', '/');
        } else if (key === '=' || key === 'Enter') {
            this.performAction('equals');
        } else if (key === 'Escape') {
            this.performAction('clear');
        } else if (key === 'Backspace') {
            this.performAction('backspace');
        }
    }

    addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > 50) { // Limit history size for performance
            this.history = this.history.slice(0, 50);
        }
        this.saveHistory();
        this.loadHistory();
    }

    loadHistory() {
        if (!this.historyList) return;
        
        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();
        
        this.history.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;
            li.addEventListener('click', () => {
                const result = entry.split(' = ')[1];
                if (result) {
                    this.currentInput = result;
                    this.updateDisplay();
                }
            }, { passive: true });
            fragment.appendChild(li);
        });
        
        this.historyList.innerHTML = '';
        this.historyList.appendChild(fragment);
    }

    saveHistory() {
        try {
            localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        } catch (e) {
            console.warn('Unable to save history to localStorage');
        }
    }

    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.loadHistory();
    }

    toggleHistory() {
        if (this.historyPanel) {
            this.historyPanel.classList.toggle('collapsed');
        }
    }

    handleHistoryClick(event) {
        if (event.target.tagName === 'LI') {
            const result = event.target.textContent.split(' = ')[1];
            if (result) {
                this.currentInput = result;
                this.waitingForOperand = true;
                this.updateDisplay();
            }
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new Calculator();
    
    // Add to global scope for debugging (remove in production)
    window.calculator = calculator;
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Calculator loaded in ${loadTime.toFixed(2)}ms`);
        });
    }
    
    // Service Worker for app-like experience (optional)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            console.log('Service Worker registration failed');
        });
    }
});

// Optimize for mobile performance
if ('ontouchstart' in window) {
    // Disable hover effects on mobile
    document.documentElement.classList.add('touch-device');
    
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}
