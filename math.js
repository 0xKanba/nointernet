class MathParser {
    constructor() {
        this.functions = {
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            log: Math.log10,
            ln: Math.log,
            sqrt: Math.sqrt
        };
        
        this.constants = {
            π: Math.PI,
            e: Math.E
        };
    }
    
    tokenize(expression) {
        const tokens = [];
        let i = 0;
        
        while (i < expression.length) {
            const char = expression[i];
            
            if (char === ' ') {
                i++;
                continue;
            }
            
            if (/[0-9.]/.test(char)) {
                let num = '';
                while (i < expression.length && /[0-9.]/.test(expression[i])) {
                    num += expression[i];
                    i++;
                }
                tokens.push({ type: 'number', value: parseFloat(num) });
                continue;
            }
            
            if (/[a-zA-Z]/.test(char)) {
                let func = '';
                while (i < expression.length && /[a-zA-Z]/.test(expression[i])) {
                    func += expression[i];
                    i++;
                }
                
                if (expression[i] === '(') {
                    tokens.push({ type: 'function', name: func });
                    i++;
                    continue;
                } else {
                    i -= func.length;
                    const numStr = '';
                    while (i < expression.length && /[0-9.]/.test(expression[i])) {
                        numStr += expression[i];
                        i++;
                    }
                    tokens.push({ type: 'number', value: parseFloat(numStr) });
                    continue;
                }
            }
            
            if (char === 'π' || char === 'e') {
                tokens.push({ 
                    type: 'number', 
                    value: this.constants[char] 
                });
                i++;
                continue;
            }
            
            if (['+', '-', '*', '/', '^'].includes(char)) {
                tokens.push({ type: 'operator', value: char });
                i++;
                continue;
            }
            
            if (char === '(' || char === ')') {
                tokens.push({ type: 'paren', value: char });
                i++;
                continue;
            }
            
            if (char === '!') {
                tokens.push({ type: 'factorial', value: '!' });
                i++;
                continue;
            }
            
            i++;
        }
        
        return tokens;
    }
    
    toRPN(tokens) {
        const output = [];
        const operators = [];
        
        const precedence = {
            '!': 4,
            '^': 3,
            '*': 2,
            '/': 2,
            '+': 1,
            '-': 1
        };
        
        const associativity = {
            '!': 'right',
            '^': 'right',
            '*': 'left',
            '/': 'left',
            '+': 'left',
            '-': 'left'
        };
        
        for (const token of tokens) {
            if (token.type === 'number') {
                output.push(token);
            } else if (token.type === 'function') {
                operators.push(token);
            } else if (token.type === 'operator') {
                const o1 = token.value;
                while (operators.length > 0) {
                    const o2 = operators[operators.length - 1];
                    
                    if (o2.type === 'paren' && o2.value === '(') {
                        break;
                    }
                    
                    if ((associativity[o1] === 'left' && precedence[o1] <= precedence[o2.value]) ||
                        (associativity[o1] === 'right' && precedence[o1] < precedence[o2.value])) {
                        output.push(operators.pop());
                    } else {
                        break;
                    }
                }
                operators.push({ type: 'operator', value: o1 });
            } else if (token.type === 'factorial') {
                operators.push(token);
            } else if (token.type === 'paren') {
                if (token.value === '(') {
                    operators.push(token);
                } else {
                    while (operators.length > 0 && 
                           !(operators[operators.length - 1].type === 'paren' && 
                             operators[operators.length - 1].value === '(')) {
                        output.push(operators.pop());
                    }
                    
                    if (operators.length > 0 && operators[operators.length - 1].type === 'paren') {
                        operators.pop();
                    }
                    
                    if (operators.length > 0 && operators[operators.length - 1].type === 'function') {
                        output.push(operators.pop());
                    }
                }
            }
        }
        
        while (operators.length > 0) {
            const op = operators.pop();
            if (op.type === 'paren') {
                throw new Error('Mismatched parentheses');
            }
            output.push(op);
        }
        
        return output;
    }
    
    evaluateRPN(rpn) {
        const stack = [];
        
        for (const token of rpn) {
            if (token.type === 'number') {
                stack.push(token.value);
            } else if (token.type === 'operator') {
                if (stack.length < 2) throw new Error('Invalid expression');
                
                const b = stack.pop();
                const a = stack.pop();
                
                switch (token.value) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/': 
                        if (b === 0) throw new Error('Division by zero');
                        stack.push(a / b); 
                        break;
                    case '^': stack.push(Math.pow(a, b)); break;
                }
            } else if (token.type === 'factorial') {
                if (stack.length < 1) throw new Error('Invalid expression');
                
                const n = stack.pop();
                if (n < 0 || !Number.isInteger(n)) throw new Error('Invalid factorial');
                
                let result = 1;
                for (let i = 2; i <= n; i++) {
                    result *= i;
                }
                stack.push(result);
            } else if (token.type === 'function') {
                if (stack.length < 1) throw new Error('Invalid expression');
                
                const arg = stack.pop();
                const func = this.functions[token.name];
                if (!func) throw new Error(`Unknown function: ${token.name}`);
                
                stack.push(func(arg));
            }
        }
        
        if (stack.length !== 1) {
            throw new Error('Invalid expression');
        }
        
        return stack[0];
    }
    
    evaluate(expression) {
        try {
            const tokens = this.tokenize(expression);
            const rpn = this.toRPN(tokens);
            return this.evaluateRPN(rpn);
        } catch (error) {
            throw new Error(`Calculation error: ${error.message}`);
        }
    }
}

class HistoryManager {
    constructor(maxItems = 21) {
        this.maxItems = maxItems;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
    }
    
    add(expression, result) {
        this.history.unshift({ expression, result, timestamp: Date.now() });
        this.history = this.history.slice(0, this.maxItems);
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        return this.history;
    }
    
    get() {
        return this.history;
    }
    
    clear() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        return this.history;
    }
}

class Calculator {
    constructor() {
        this.expression = '';
        this.result = '0';
        this.shouldReset = false;
        this.parser = new MathParser();
        this.history = new HistoryManager();
        this.elements = {
            result: document.getElementById('result'),
            expression: document.getElementById('expression'),
            historyList: document.getElementById('history-list'),
            clearHistoryBtn: document.getElementById('clear-history')
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderHistory();
    }
    
    bindEvents() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => this.handleButton(button));
        });
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        this.elements.clearHistoryBtn.addEventListener('click', () => {
            this.clearHistory();
        });
    }
    
    handleButton(button) {
        const action = button.dataset.action;
        const value = button.dataset.value;
        
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 100);
        
        if (action) {
            this.handleAction(action);
        } else if (value) {
            this.handleValue(value);
        }
    }
    
    handleValue(value) {
        if (this.shouldReset) {
            this.expression = '';
            this.shouldReset = false;
        }
        
        this.expression += value;
        this.updateDisplay();
        this.calculatePreview();
    }
    
    handleAction(action) {
        switch (action) {
            case 'clearAll':
                this.expression = '';
                this.result = '0';
                this.shouldReset = false;
                break;
            case 'clearEntry':
                this.result = '0';
                break;
            case 'percentage':
                if (this.result !== '0') {
                    const num = parseFloat(this.result) / 100;
                    this.result = this.formatNumber(num);
                    this.expression = this.result;
                    this.shouldReset = true;
                }
                break;
            case 'deleteChar':
                if (this.expression.length > 0) {
                    this.expression = this.expression.slice(0, -1);
                }
                break;
            case 'calculate':
                this.calculate();
                return;
        }
        this.updateDisplay();
    }
    
    calculate() {
        if (!this.expression) return;
        
        try {
            const cleanExpr = this.cleanExpression(this.expression);
            const result = this.parser.evaluate(cleanExpr);
            
            if (!isFinite(result)) {
                throw new Error('Invalid result');
            }
            
            const formattedResult = this.formatNumber(result);
            this.history.add(this.expression, formattedResult);
            this.result = formattedResult;
            this.shouldReset = true;
            
            this.updateDisplay();
            this.renderHistory();
            
            this.elements.result.classList.add('success');
            setTimeout(() => {
                this.elements.result.classList.remove('success');
            }, 600);
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    calculatePreview() {
        if (!this.expression) return;
        
        try {
            const cleanExpr = this.cleanExpression(this.expression);
            const result = this.parser.evaluate(cleanExpr);
            
            if (isFinite(result)) {
                this.result = this.formatNumber(result);
            }
        } catch (error) {
            // لا نعرض الأخطاء أثناء الكتابة
        }
        this.updateDisplay();
    }
    
    cleanExpression(expr) {
        return expr
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/√/g, 'sqrt')
            .replace(/\^/g, '**');
    }
    
    formatNumber(num) {
        if (typeof num === 'string') {
            num = parseFloat(num);
        }
        
        if (isNaN(num) || !isFinite(num)) {
            return 'Error';
        }
        
        if (Math.abs(num % 1) < Number.EPSILON) {
            return num.toString();
        }
        
        const absNum = Math.abs(num);
        let decimals;
        
        if (absNum >= 1e9 || absNum <= 1e-6) {
            return num.toExponential(6);
        } else if (absNum >= 1) {
            decimals = 8 - Math.floor(Math.log10(absNum));
        } else {
            decimals = 8;
        }
        
        decimals = Math.max(2, Math.min(8, decimals));
        return parseFloat(num.toFixed(decimals)).toString();
    }
    
    updateDisplay() {
        this.elements.expression.textContent = this.formatDisplayExpression(this.expression);
        this.elements.result.textContent = this.result;
    }
    
    formatDisplayExpression(expr) {
        return expr
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/-/g, '−')
            .replace(/sqrt/g, '√')
            .replace(/\*\*/g, '^');
    }
    
    renderHistory() {
        const history = this.history.get();
        this.elements.historyList.innerHTML = '';
        
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            
            const date = document.createElement('div');
            date.className = 'history-date';
            date.textContent = this.formatDate(item.timestamp);
            
            const expr = document.createElement('div');
            expr.className = 'history-expression';
            expr.textContent = this.formatDisplayExpression(item.expression);
            
            const result = document.createElement('div');
            result.className = 'history-result';
            result.textContent = item.result;
            
            li.appendChild(date);
            li.appendChild(expr);
            li.appendChild(result);
            this.elements.historyList.appendChild(li);
        });
    }
    
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        
        if (date.toDateString() === now.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()) {
            return 'Yesterday';
        } else {
            return `${date.getDate()} days ago`;
        }
    }
    
    showError(message) {
        this.elements.result.textContent = 'Error';
        this.elements.result.classList.add('error');
        
        setTimeout(() => {
            this.elements.result.classList.remove('error');
            this.expression = '';
            this.result = '0';
            this.updateDisplay();
        }, 1500);
    }
    
    clearHistory() {
        this.history.clear();
        this.renderHistory();
    }
    
    handleKeyboard(e) {
        const key = e.key.toLowerCase();
        
        if (['enter', 'escape', 'backspace'].includes(key)) {
            e.preventDefault();
        }
        
        if (/\d/.test(key)) {
            this.handleValue(key);
        }
        else if (key === '+' || key === '-' || key === '*' || key === '/') {
            this.handleValue(key);
        }
        else if (key === 'enter' || key === '=') {
            this.calculate();
        }
        else if (key === 'escape') {
            this.handleAction('clearAll');
        }
        else if (key === 'backspace') {
            this.handleAction('deleteChar');
        }
        else if (key === '.') {
            this.handleValue('.');
        }
        else if (key === '%') {
            this.handleAction('percentage');
        }
        else if (key === 'p') {
            this.handleValue('π');
        }
        else if (key === 'e') {
            this.handleValue('e');
        }
        else if (key === '!') {
            this.handleValue('!');
        }
        else if (key === 's') {
            this.handleValue('sin(');
        }
        else if (key === 'c') {
            this.handleValue('cos(');
        }
        else if (key === 't') {
            this.handleValue('tan(');
        }
        else if (key === 'l') {
            this.handleValue('log(');
        }
        else if (key === 'n') {
            this.handleValue('ln(');
        }
        else if (key === 'r') {
            this.handleValue('√(');
        }
        else if (key === '^') {
            this.handleValue('^');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new Calculator();
    
    setTimeout(() => {
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.classList.add('show');
        });
    }, 1000);
});
