class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = '';
        this.waitingForOperand = false;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        
        this.initElements();
        this.bindEvents();
        this.loadHistory();
        this.updateDisplay();
    }

    initElements() {
        this.display = document.getElementById('result');
        this.expression = document.querySelector('.expression');
        this.historyList = document.getElementById('history-list');
        this.historyPanel = document.querySelector('.history-panel');
        this.collapseBtn = document.querySelector('.collapse-btn');
        this.clearBtn = document.querySelector('.clear-btn');
    }

    bindEvents() {
        // أزرار الأرقام
        document.querySelectorAll('.number-btn, .sci-btn').forEach(btn => {
            btn.addEventListener('click', this.handleClick.bind(this), { passive: true });
            btn.addEventListener('touchstart', this.addTouchFeedback.bind(this), { passive: true });
        });
        
        // أزرار العمليات
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.addEventListener('click', this.handleClick.bind(this), { passive: true });
            btn.addEventListener('touchstart', this.addTouchFeedback.bind(this), { passive: true });
        });
        
        // أزرار الوظائف
        document.querySelectorAll('.function-btn, .equals-btn, .clear-btn').forEach(btn => {
            btn.addEventListener('click', this.handleClick.bind(this), { passive: true });
            btn.addEventListener('touchstart', this.addTouchFeedback.bind(this), { passive: true });
        });

        // لوحة المفاتيح
        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        // التاريخ
        if (this.collapseBtn) {
            this.collapseBtn.addEventListener('click', this.toggleHistory.bind(this), { passive: true });
        }
        
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', this.clearHistory.bind(this), { passive: true });
        }
        
        if (this.historyList) {
            this.historyList.addEventListener('click', this.handleHistoryClick.bind(this), { passive: true });
        }
    }

    addTouchFeedback(e) {
        const btn = e.target;
        btn.style.transform = 'scale(0.95)';
        requestAnimationFrame(() => {
            setTimeout(() => btn.style.transform = '', 150);
        });
    }

    handleClick(e) {
        const btn = e.target;
        const text = btn.textContent;
        
        // تأثير بصري سريع
        btn.classList.add('pressed');
        requestAnimationFrame(() => {
            setTimeout(() => btn.classList.remove('pressed'), 150);
        });

        // معالجة الأرقام
        if (/[0-9]/.test(text)) {
            this.inputNumber(text);
        }
        // معالجة العمليات
        else if (['+', '−', '×', '÷'].includes(text)) {
            const op = text === '−' ? '-' : text === '×' ? '*' : text === '÷' ? '/' : text;
            this.inputOperator(op);
        }
        // باقي الوظائف
        else if (text === '=') this.calculate();
        else if (text === 'AC') this.clear();
        else if (text === '.') this.inputDecimal();
        else if (text === '±') this.toggleSign();
        else if (text === '%') this.percent();
        else if (text === '⌫') this.backspace();
        // الوظائف العلمية
        else if (text === 'sin') this.scientificFunction('sin');
        else if (text === 'cos') this.scientificFunction('cos');
        else if (text === 'tan') this.scientificFunction('tan');
        else if (text === 'ln') this.scientificFunction('ln');
        else if (text === 'log') this.scientificFunction('log');
        else if (text === '√') this.scientificFunction('sqrt');
        else if (text === 'x²') this.scientificFunction('square');
        else if (text === '1/x') this.scientificFunction('reciprocal');
        else if (text === '!') this.scientificFunction('factorial');
        else if (text === 'π') this.scientificFunction('pi');
        else if (text === 'e') this.scientificFunction('e');

        this.updateDisplay();
    }

    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentInput = num;
            this.waitingForOperand = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
    }

    inputOperator(nextOperator) {
        const inputValue = parseFloat(this.currentInput);

        if (this.previousInput === '') {
            this.previousInput = inputValue;
        } else if (this.operator) {
            const result = this.performCalculation();
            this.currentInput = String(parseFloat(result.toFixed(10)));
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
            this.currentInput = String(parseFloat(result.toFixed(10)));
            this.previousInput = '';
            this.operator = '';
            this.waitingForOperand = true;
        }
    }

    performCalculation() {
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);

        switch (this.operator) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/': return current !== 0 ? prev / current : 0;
            default: return current;
        }
    }

    scientificFunction(func) {
        const num = parseFloat(this.currentInput);
        let result;

        switch (func) {
            case 'sin': result = Math.sin(num * Math.PI / 180); break;
            case 'cos': result = Math.cos(num * Math.PI / 180); break;
            case 'tan': result = Math.tan(num * Math.PI / 180); break;
            case 'ln': result = Math.log(num); break;
            case 'log': result = Math.log10(num); break;
            case 'sqrt': result = Math.sqrt(num); break;
            case 'square': result = num * num; break;
            case 'reciprocal': result = num !== 0 ? 1 / num : 0; break;
            case 'factorial': result = this.factorial(Math.floor(num)); break;
            case 'pi': result = Math.PI; break;
            case 'e': result = Math.E; break;
            default: result = num;
        }

        const expression = `${func}(${num}) = ${result}`;
        this.addToHistory(expression);
        this.currentInput = String(parseFloat(result.toFixed(10)));
        this.waitingForOperand = true;
    }

    factorial(n) {
        if (n < 0 || n > 100) return 0;
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
        this.currentInput = String(num / 100);
        this.waitingForOperand = true;
    }

    updateDisplay() {
        requestAnimationFrame(() => {
            if (this.display) {
                this.display.value = this.formatNumber(this.currentInput);
            }
            
            if (this.expression) {
                const expr = this.operator 
                    ? `${this.formatNumber(this.previousInput)} ${this.getOperatorSymbol(this.operator)}`
                    : '';
                this.expression.textContent = expr;
            }
        });
    }

    formatNumber(num) {
        const number = parseFloat(num);
        if (isNaN(number)) return '0';
        
        if (Math.abs(number) >= 1e12) {
            return number.toExponential(6);
        }
        
        return number.toFixed(10).replace(/\.?0+$/, '');
    }

    getOperatorSymbol(operator) {
        const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        return symbols[operator] || operator;
    }

    handleKeyboard(e) {
        const key = e.key;
        
        if ('0123456789'.includes(key)) {
            e.preventDefault();
            this.inputNumber(key);
            this.updateDisplay();
        } else if (key === '.') {
            e.preventDefault();
            this.inputDecimal();
            this.updateDisplay();
        } else if (['+', '-', '*', '/'].includes(key)) {
            e.preventDefault();
            this.inputOperator(key);
            this.updateDisplay();
        } else if (key === '=' || key === 'Enter') {
            e.preventDefault();
            this.calculate();
            this.updateDisplay();
        } else if (key === 'Escape') {
            e.preventDefault();
            this.clear();
            this.updateDisplay();
        } else if (key === 'Backspace') {
            e.preventDefault();
            this.backspace();
            this.updateDisplay();
        }
    }

    addToHistory(entry) {
        this.history.unshift(entry);
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        this.loadHistory();
    }

    loadHistory() {
        if (!this.historyList) return;
        
        const fragment = document.createDocumentFragment();
        
        this.history.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;
            fragment.appendChild(li);
        });
        
        this.historyList.innerHTML = '';
        this.historyList.appendChild(fragment);
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        this.loadHistory();
    }

    toggleHistory() {
        if (this.historyPanel) {
            this.historyPanel.classList.toggle('collapsed');
        }
    }

    handleHistoryClick(e) {
        if (e.target.tagName === 'LI') {
            const result = e.target.textContent.split(' = ')[1];
            if (result) {
                this.currentInput = result;
                this.waitingForOperand = true;
                this.updateDisplay();
            }
        }
    }
}

// تشغيل الحاسبة
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// تحسينات الأداء للجوال
if ('ontouchstart' in window) {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}
