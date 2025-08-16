// Pro Calculator 3D - Ultra Fast & Flexible
// Advanced Scientific Calculator with 3D Interface

class ProCalculator3D {
    constructor() {
        this.currentInput = '';
        this.expression = '';
        this.history = JSON.parse(localStorage.getItem('calc_history') || '[]');
        this.lastResult = 0;
        this.isScientific = true;
        
        // Cache DOM elements for performance
        this.elements = {
            result: document.getElementById('result'),
            expression: document.getElementById('expression'),
            historyList: document.getElementById('history-list'),
            scientificButtons: document.getElementById('scientific-buttons'),
            collapseBtn: document.getElementById('collapse-btn'),
            clearHistory: document.getElementById('clear-history'),
            historyPanel: document.getElementById('history-panel')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.enableScientificMode();
        this.loadHistory();
        this.setupKeyboardShortcuts();
        this.optimizePerformance();
        
        // Remove unwanted controls
        this.removeUnnecessaryControls();
        
        // Set English as default
        document.documentElement.lang = 'en';
        document.documentElement.dir = 'ltr';
    }
    
    removeUnnecessaryControls() {
        const controlsTop = document.querySelector('.controls-top');
        if (controlsTop) {
            // Keep only scientific mode indicator (no toggle needed as it's always on)
            controlsTop.innerHTML = '<div class="mode-indicator">Scientific Mode</div>';
        }
    }
    
    setupEventListeners() {
        // History panel controls
        this.elements.collapseBtn?.addEventListener('click', () => this.toggleHistory());
        this.elements.clearHistory?.addEventListener('click', () => this.clearHistory());
        
        // Add ripple effect to all buttons
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', this.addRippleEffect.bind(this));
        });
    }
    
    enableScientificMode() {
        this.elements.scientificButtons?.classList.add('active');
        this.isScientific = true;
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            
            const keyMap = {
                '0': () => this.appendValue('0'),
                '1': () => this.appendValue('1'),
                '2': () => this.appendValue('2'),
                '3': () => this.appendValue('3'),
                '4': () => this.appendValue('4'),
                '5': () => this.appendValue('5'),
                '6': () => this.appendValue('6'),
                '7': () => this.appendValue('7'),
                '8': () => this.appendValue('8'),
                '9': () => this.appendValue('9'),
                '.': () => this.appendValue('.'),
                '+': () => this.appendOperator('+'),
                '-': () => this.appendOperator('-'),
                '*': () => this.appendOperator('*'),
                '/': () => this.appendOperator('/'),
                '=': () => this.calculate(),
                'Enter': () => this.calculate(),
                'Escape': () => this.clearAll(),
                'Backspace': () => this.deleteChar(),
                'Delete': () => this.clearEntry(),
                '%': () => this.percentage(),
                '^': () => this.appendValue('^'),
                'p': () => this.appendValue('π'),
                'e': () => this.appendValue('e'),
                's': () => this.appendFunction('sin('),
                'c': () => this.appendFunction('cos('),
                't': () => this.appendFunction('tan('),
                'l': () => this.appendFunction('log('),
                'n': () => this.appendFunction('ln('),
                'r': () => this.appendFunction('√('),
                '!': () => this.appendValue('!')
            };
            
            const handler = keyMap[e.key];
            if (handler) {
                handler();
                this.highlightButton(e.key);
            }
        });
    }
    
    highlightButton(key) {
        const buttonMap = {
            '0': 'button[onclick="appendValue(\'0\')"]',
            '1': 'button[onclick="appendValue(\'1\')"]',
            '2': 'button[onclick="appendValue(\'2\')"]',
            '3': 'button[onclick="appendValue(\'3\')"]',
            '4': 'button[onclick="appendValue(\'4\')"]',
            '5': 'button[onclick="appendValue(\'5\')"]',
            '6': 'button[onclick="appendValue(\'6\')"]',
            '7': 'button[onclick="appendValue(\'7\')"]',
            '8': 'button[onclick="appendValue(\'8\')"]',
            '9': 'button[onclick="appendValue(\'9\')"]',
            '.': 'button[onclick="appendValue(\'.\')"]',
            '+': 'button[onclick="appendOperator(\'+\')"]',
            '-': 'button[onclick="appendOperator(\'-\')"]',
            '*': 'button[onclick="appendOperator(\'*\')"]',
            '/': 'button[onclick="appendOperator(\'/\')"]',
            '=': 'button[onclick="calculate()"]',
            'Enter': 'button[onclick="calculate()"]'
        };
        
        const selector = buttonMap[key];
        if (selector) {
            const button = document.querySelector(selector);
            if (button) {
                button.classList.add('pressed');
                setTimeout(() => button.classList.remove('pressed'), 150);
            }
        }
    }
    
    optimizePerformance() {
        // Use requestAnimationFrame for smooth updates
        this.updateQueue = [];
        this.isUpdating = false;
        
        // Debounce input updates
        this.debouncedUpdate = this.debounce(this.updateDisplay.bind(this), 16);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    appendValue(value) {
        if (this.shouldReset) {
            this.currentInput = '';
            this.shouldReset = false;
        }
        
        // Handle special values
        switch (value) {
            case 'π':
                this.currentInput += Math.PI;
                this.expression += 'π';
                break;
            case 'e':
                this.currentInput += Math.E;
                this.expression += 'e';
                break;
            default:
                this.currentInput += value;
                this.expression += value;
        }
        
        this.debouncedUpdate();
    }
    
    appendOperator(operator) {
        if (this.currentInput === '' && operator === '-') {
            this.currentInput = '-';
            this.expression = '-';
        } else if (this.currentInput !== '') {
            // Convert display operators to calculation operators
            const calcOperator = this.getCalculationOperator(operator);
            this.currentInput += calcOperator;
            this.expression += operator;
            this.shouldReset = false;
        }
        
        this.debouncedUpdate();
    }
    
    getCalculationOperator(displayOp) {
        const operatorMap = {
            '÷': '/',
            '×': '*',
            '−': '-',
            '+': '+'
        };
        return operatorMap[displayOp] || displayOp;
    }
    
    appendFunction(func) {
        if (this.shouldReset) {
            this.currentInput = '';
            this.expression = '';
            this.shouldReset = false;
        }
        
        this.currentInput += func;
        this.expression += func;
        this.debouncedUpdate();
    }
    
    calculate() {
        if (this.currentInput === '') return;
        
        try {
            // Show calculating state
            this.elements.result.classList.add('calculating');
            
            // Process the expression
            let processedExpression = this.preprocessExpression(this.currentInput);
            let result = this.evaluateExpression(processedExpression);
            
            // Handle special cases
            if (!isFinite(result)) {
                throw new Error('Math Error');
            }
            
            // Format result
            result = this.formatResult(result);
            
            // Update display
            this.lastResult = result;
            this.elements.result.value = result;
            
            // Add to history
            this.addToHistory(`${this.expression} = ${result}`);
            
            // Reset for next calculation
            this.currentInput = result.toString();
            this.expression = result.toString();
            this.shouldReset = true;
            
        } catch (error) {
            this.showError('Error');
        } finally {
            this.elements.result.classList.remove('calculating');
        }
    }
    
    preprocessExpression(expr) {
        // Replace mathematical symbols with JavaScript equivalents
        return expr
            .replace(/π/g, Math.PI)
            .replace(/e(?![0-9])/g, Math.E)
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/√\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**')
            .replace(/(\d+)!/g, (match, num) => this.factorial(parseInt(num)));
    }
    
    evaluateExpression(expr) {
        // Safe evaluation using Function constructor
        try {
            return new Function('return ' + expr)();
        } catch (error) {
            throw new Error('Invalid Expression');
        }
    }
    
    factorial(n) {
        if (n < 0 || n > 170) return NaN; // Prevent overflow
        if (n === 0 || n === 1) return 1;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    formatResult(result) {
        // Handle very large and very small numbers
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-6 && result !== 0)) {
            return result.toExponential(10);
        }
        
        // Round to avoid floating point precision issues
        const rounded = Math.round(result * 1e10) / 1e10;
        return rounded.toString();
    }
    
    clearAll() {
        this.currentInput = '';
        this.expression = '';
        this.shouldReset = false;
        this.updateDisplay();
    }
    
    clearEntry() {
        const lastOperatorIndex = Math.max(
            this.currentInput.lastIndexOf('+'),
            this.currentInput.lastIndexOf('-'),
            this.currentInput.lastIndexOf('*'),
            this.currentInput.lastIndexOf('/'),
            this.currentInput.lastIndexOf('**')
        );
        
        if (lastOperatorIndex !== -1) {
            this.currentInput = this.currentInput.substring(0, lastOperatorIndex + 1);
            this.expression = this.expression.substring(0, lastOperatorIndex + 1);
        } else {
            this.clearAll();
        }
        
        this.updateDisplay();
    }
    
    deleteChar() {
        if (this.currentInput.length > 0) {
            this.currentInput = this.currentInput.slice(0, -1);
            this.expression = this.expression.slice(0, -1);
            this.updateDisplay();
        }
    }
    
    percentage() {
        if (this.currentInput !== '') {
            try {
                const result = this.evaluateExpression(this.currentInput) / 100;
                this.currentInput = result.toString();
                this.expression = result.toString();
                this.elements.result.value = this.formatResult(result);
            } catch (error) {
                this.showError('Error');
            }
        }
    }
    
    updateDisplay() {
        if (!this.isUpdating) {
            this.isUpdating = true;
            requestAnimationFrame(() => {
                this.elements.result.value = this.currentInput || '0';
                this.elements.expression.textContent = this.expression || '';
                this.isUpdating = false;
            });
        }
    }
    
    showError(message) {
        this.elements.result.value = message;
        this.elements.result.classList.add('error');
        
        setTimeout(() => {
            this.elements.result.classList.remove('error');
            this.clearAll();
        }, 2000);
    }
    
    addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        
        localStorage.setItem('calc_history', JSON.stringify(this.history));
        this.updateHistoryDisplay();
    }
    
    loadHistory() {
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        if (!this.elements.historyList) return;
        
        this.elements.historyList.innerHTML = '';
        
        this.history.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = entry;
            li.addEventListener('click', () => {
                const parts = entry.split(' = ');
                if (parts.length === 2) {
                    this.currentInput = parts[1];
                    this.expression = parts[1];
                    this.updateDisplay();
                }
            });
            this.elements.historyList.appendChild(li);
        });
    }
    
    clearHistory() {
        this.history = [];
        localStorage.removeItem('calc_history');
        this.updateHistoryDisplay();
    }
    
    toggleHistory() {
        if (this.elements.historyPanel) {
            this.elements.historyPanel.classList.toggle('collapsed');
            this.elements.collapseBtn.textContent = 
                this.elements.historyPanel.classList.contains('collapsed') ? '▲' : '▼';
        }
    }
    
    addRippleEffect(e) {
        const button = e.target;
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s linear;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
}

// Global functions for onclick handlers
let calculator;

function appendValue(value) {
    calculator.appendValue(value);
}

function appendOperator(operator) {
    calculator.appendOperator(operator);
}

function appendFunction(func) {
    calculator.appendFunction(func);
}

function calculate() {
    calculator.calculate();
}

function clearAll() {
    calculator.clearAll();
}

function clearEntry() {
    calculator.clearEntry();
}

function deleteChar() {
    calculator.deleteChar();
}

function percentage() {
    calculator.percentage();
}

// Add ripple animation styles
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .mode-indicator {
        padding: 8px 16px;
        background: rgba(0, 122, 255, 0.8);
        border-radius: 20px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        backdrop-filter: blur(20px);
        box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
    }
    
    .history-panel.collapsed .history-content {
        height: 0 !important;
        overflow: hidden;
    }
    
    .btn {
        position: relative;
        overflow: hidden;
    }
`;

document.head.appendChild(rippleStyles);

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    calculator = new ProCalculator3D();
});

// Enhanced 3D background animation
function enhance3DBackground() {
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const delay = index * 2000;
        const duration = 15000 + Math.random() * 10000;
        
        setInterval(() => {
            const randomX = Math.random() * window.innerWidth;
            const randomY = Math.random() * window.innerHeight;
            const randomScale = 0.8 + Math.random() * 0.4;
            const randomRotate = Math.random() * 360;
            
            shape.style.transition = `transform ${duration}ms ease-in-out`;
            shape.style.transform = `
                translateX(${randomX - shape.offsetLeft}px) 
                translateY(${randomY - shape.offsetTop}px) 
                scale(${randomScale}) 
                rotate(${randomRotate}deg)
            `;
        }, duration + delay);
    });
}

// Performance monitoring
function monitorPerformance() {
    if (window.performance && window.performance.mark) {
        window.performance.mark('calculator-init-start');
        
        window.addEventListener('load', () => {
            window.performance.mark('calculator-init-end');
            window.performance.measure('calculator-init', 'calculator-init-start', 'calculator-init-end');
            
            const measure = window.performance.getEntriesByName('calculator-init')[0];
            console.log(`Calculator initialized in ${measure.duration.toFixed(2)}ms`);
        });
    }
}

// Initialize enhancements
document.addEventListener('DOMContentLoaded', () => {
    enhance3DBackground();
    monitorPerformance();
});
