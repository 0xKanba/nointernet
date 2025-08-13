// Pro Calculator 3D - Enhanced JavaScript
// المتغيرات الأساسية
let currentExpression = '';
let currentResult = '0';
let history = [];
let isScientificMode = false;
let isRTL = true;
let currentTheme = 'dark';
let lastResult = 0;
let shouldResetOnNextInput = false;
let isCalculating = false;

// العناصر الرئيسية
const elements = {
    result: document.getElementById('result'),
    expression: document.getElementById('expression'),
    historyList: document.getElementById('history-list'),
    historyPanel: document.getElementById('history-panel'),
    scientificButtons: document.getElementById('scientific-buttons'),
    calculator: document.getElementById('calculator'),
    langBtn: document.getElementById('lang-btn'),
    modeToggle: document.getElementById('mode-toggle'),
    themeToggle: document.getElementById('theme-toggle'),
    collapseBtn: document.getElementById('collapse-btn'),
    clearHistoryBtn: document.getElementById('clear-history'),
    historyTitle: document.getElementById('history-title')
};

// النصوص للغات متعددة
const translations = {
    ar: {
        scientific: 'علمي',
        basic: 'أساسي',
        history: 'السجل',
        clearAll: 'مسح الكل',
        error: 'خطأ',
        langBtn: 'English'
    },
    en: {
        scientific: 'Scientific',
        basic: 'Basic',
        history: 'History',
        clearAll: 'Clear All',
        error: 'Error',
        langBtn: 'عربي'
    }
};

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupEventListeners();
    loadSettings();
    updateDisplay();
});

// تهيئة الحاسبة
function initializeCalculator() {
    // تحميل الإعدادات المحفوظة
    const savedHistory = localStorage.getItem('calc-history');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        updateHistoryDisplay();
    }
    
    const savedTheme = localStorage.getItem('calc-theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        applyTheme();
    }
    
    const savedLang = localStorage.getItem('calc-language');
    if (savedLang) {
        isRTL = savedLang === 'ar';
        updateLanguage();
    }
    
    // تطبيق التأثيرات البصرية
    addButtonAnimations();
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
    // أزرار التحكم العلوية
    elements.langBtn?.addEventListener('click', toggleLanguage);
    elements.modeToggle?.addEventListener('click', toggleScientificMode);
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // لوحة التاريخ
    elements.collapseBtn?.addEventListener('click', toggleHistory);
    elements.clearHistoryBtn?.addEventListener('click', clearHistory);
    
    // لوحة المفاتيح
    document.addEventListener('keydown', handleKeyboardInput);
    
    // اللمس والماوس
    setupTouchEvents();
    
    // تغيير حجم النافذة
    window.addEventListener('resize', handleResize);
}

// التبديل بين اللغات
function toggleLanguage() {
    isRTL = !isRTL;
    updateLanguage();
    saveSettings();
}

function updateLanguage() {
    const lang = isRTL ? 'ar' : 'en';
    const dir = isRTL ? 'rtl' : 'ltr';
    
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    
    // تحديث النصوص
    elements.langBtn.textContent = translations[lang].langBtn;
    elements.modeToggle.textContent = isScientificMode ? 
        translations[lang].basic : translations[lang].scientific;
    elements.historyTitle.textContent = translations[lang].history;
    elements.clearHistoryBtn.textContent = translations[lang].clearAll;
    
    // إضافة تأثيرات الانتقال
    document.body.style.transition = 'all 0.3s ease';
}

// التبديل بين الوضع العلمي والأساسي
function toggleScientificMode() {
    isScientificMode = !isScientificMode;
    
    if (isScientificMode) {
        elements.scientificButtons.classList.add('active');
        elements.modeToggle.textContent = isRTL ? 'أساسي' : 'Basic';
    } else {
        elements.scientificButtons.classList.remove('active');
        elements.modeToggle.textContent = isRTL ? 'علمي' : 'Scientific';
    }
    
    // تأثير انتقالي سلس
    elements.scientificButtons.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    saveSettings();
}

// التبديل بين السمات
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveSettings();
}

function applyTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-theme');
        elements.themeToggle.textContent = '🌙';
    } else {
        document.body.classList.remove('light-theme');
        elements.themeToggle.textContent = '☀️';
    }
}

// إدارة عرض التاريخ
function toggleHistory() {
    const isCollapsed = elements.historyPanel.style.width === '60px';
    
    if (isCollapsed) {
        elements.historyPanel.style.width = '300px';
        elements.collapseBtn.textContent = '▼';
        elements.historyPanel.querySelector('.history-content').style.display = 'flex';
    } else {
        elements.historyPanel.style.width = '60px';
        elements.collapseBtn.textContent = '▶';
        elements.historyPanel.querySelector('.history-content').style.display = 'none';
    }
}

// الوظائف الحاسوبية الأساسية
function appendValue(value) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    // تعامل خاص مع القيم الثابتة
    if (value === 'π') {
        value = Math.PI.toString();
    } else if (value === 'e') {
        value = Math.E.toString();
    }
    
    currentExpression += value;
    elements.expression.textContent = formatExpression(currentExpression);
    
    // حساب فوري للمعاينة
    try {
        const result = evaluateExpression(currentExpression);
        if (!isNaN(result) && isFinite(result)) {
            elements.result.value = formatNumber(result);
        }
    } catch (error) {
        // تجاهل الأخطاء في المعاينة
    }
    
    addButtonPressEffect(event?.target);
}

function appendOperator(operator) {
    if (shouldResetOnNextInput) {
        currentExpression = currentResult;
        shouldResetOnNextInput = false;
    }
    
    // منع إضافة عوامل متتالية
    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '*', '/', '^'].includes(lastChar)) {
        currentExpression = currentExpression.slice(0, -1);
    }
    
    currentExpression += operator;
    elements.expression.textContent = formatExpression(currentExpression);
    
    addButtonPressEffect(event?.target);
}

function appendFunction(func) {
    if (shouldResetOnNextInput) {
        clearAll();
        shouldResetOnNextInput = false;
    }
    
    currentExpression += func;
    elements.expression.textContent = formatExpression(currentExpression);
    
    addButtonPressEffect(event?.target);
}

// العمليات المتقدمة
function calculate() {
    if (!currentExpression) return;
    
    try {
        isCalculating = true;
        elements.calculator.classList.add('calculating');
        
        // تأخير بسيط للتأثير البصري
        setTimeout(() => {
            const result = evaluateExpression(currentExpression);
            
            if (isNaN(result) || !isFinite(result)) {
                showError();
                return;
            }
            
            const historyItem = {
                expression: currentExpression,
                result: result,
                timestamp: new Date().toLocaleString()
            };
            
            addToHistory(historyItem);
            
            currentResult = formatNumber(result);
            elements.result.value = currentResult;
            lastResult = result;
            shouldResetOnNextInput = true;
            
            // تأثير نجاح العملية
            addSuccessEffect();
            
        }, 150);
        
    } catch (error) {
        showError();
    } finally {
        setTimeout(() => {
            isCalculating = false;
            elements.calculator.classList.remove('calculating');
        }, 300);
    }
}

// تقييم التعبيرات الرياضية
function evaluateExpression(expr) {
    // تنظيف التعبير
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
    
    // معالجة العامل (!)
    cleanExpr = cleanExpr.replace(/(\d+(\.\d+)?)\!/g, (match, num) => {
        return factorial(parseFloat(num));
    });
    
    // تنفيذ آمن للتعبير
    const result = Function('"use strict"; return (' + cleanExpr + ')')();
    return result;
}

// حساب العامل
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// وظائف المسح
function clearAll() {
    currentExpression = '';
    currentResult = '0';
    elements.expression.textContent = '';
    elements.result.value = '0';
    shouldResetOnNextInput = false;
    
    addButtonPressEffect(event?.target);
}

function clearEntry() {
    elements.result.value = '0';
    addButtonPressEffect(event?.target);
}

function deleteChar() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        elements.expression.textContent = formatExpression(currentExpression);
        
        // إعادة حساب المعاينة
        if (currentExpression) {
            try {
                const result = evaluateExpression(currentExpression);
                if (!isNaN(result) && isFinite(result)) {
                    elements.result.value = formatNumber(result);
                }
            } catch (error) {
                elements.result.value = '0';
            }
        } else {
            elements.result.value = '0';
        }
    }
    
    addButtonPressEffect(event?.target);
}

// حساب النسبة المئوية
function percentage() {
    if (currentResult !== '0') {
        const result = parseFloat(currentResult) / 100;
        elements.result.value = formatNumber(result);
        currentResult = result.toString();
        shouldResetOnNextInput = true;
    }
    
    addButtonPressEffect(event?.target);
}

// إدارة التاريخ
function addToHistory(item) {
    history.unshift(item);
    
    // الحد الأقصى 50 عملية
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    updateHistoryDisplay();
    saveHistory();
}

function updateHistoryDisplay() {
    elements.historyList.innerHTML = '';
    
    history.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; opacity: 0.7;">${formatExpression(item.expression)}</span>
                <strong>${formatNumber(item.result)}</strong>
            </div>
            <div style="font-size: 10px; opacity: 0.5; margin-top: 2px;">${item.timestamp}</div>
        `;
        
        li.addEventListener('click', () => {
            elements.result.value = formatNumber(item.result);
            currentResult = item.result.toString();
            shouldResetOnNextInput = true;
            addRippleEffect(li);
        });
        
        elements.historyList.appendChild(li);
    });
}

function clearHistory() {
    history = [];
    elements.historyList.innerHTML = '';
    localStorage.removeItem('calc-history');
    
    // تأثير مسح
    elements.historyList.style.opacity = '0';
    setTimeout(() => {
        elements.historyList.style.opacity = '1';
    }, 200);
}

// تنسيق العرض
function formatNumber(num) {
    if (typeof num !== 'number') {
        num = parseFloat(num);
    }
    
    if (isNaN(num) || !isFinite(num)) {
        return 'خطأ';
    }
    
    // إزالة الأصفار الزائدة
    if (num % 1 === 0 && Math.abs(num) < 1e10) {
        return num.toString();
    }
    
    // تحديد عدد الخانات العشرية
    const decimals = Math.min(8, Math.max(0, 10 - Math.floor(Math.log10(Math.abs(num)))));
    return parseFloat(num.toFixed(decimals)).toString();
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
        .replace(/Math\.log10\(/g, 'log(')
        .replace(/Math\.log\(/g, 'ln(')
        .replace(/\*\*/g, '^');
}

// إدخال لوحة المفاتيح
function handleKeyboardInput(event) {
    const key = event.key;
    
    // منع السلوك الافتراضي للمفاتيح المهمة
    if (['Enter', 'Escape', 'Backspace'].includes(key)) {
        event.preventDefault();
    }
    
    // الأرقام
    if (/\d/.test(key)) {
        appendValue(key);
    }
    // العوامل
    else if (key === '+') {
        appendOperator('+');
    } else if (key === '-') {
        appendOperator('-');
    } else if (key === '*') {
        appendOperator('*');
    } else if (key === '/') {
        appendOperator('/');
    }
    // وظائف خاصة
    else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearAll();
    } else if (key === 'Backspace') {
        deleteChar();
    } else if (key === '.') {
        appendValue('.');
    } else if (key === '%') {
        percentage();
    }
}

// التأثيرات البصرية
function addButtonAnimations() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function addButtonPressEffect(button) {
    if (!button) return;
    
    button.classList.add('pressed');
    setTimeout(() => {
        button.classList.remove('pressed');
    }, 150);
    
    // إضافة تأثير موجة
    addRippleEffect(button);
}

function addRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event?.clientX - rect.left - size / 2) + 'px' || '50%';
    ripple.style.top = (event?.clientY - rect.top - size / 2) + 'px' || '50%';
    ripple.classList.add('ripple');
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function addSuccessEffect() {
    elements.result.style.color = '#34c759';
    elements.result.style.textShadow = '0 0 10px rgba(52, 199, 89, 0.5)';
    
    setTimeout(() => {
        elements.result.style.color = '';
        elements.result.style.textShadow = '';
    }, 1000);
}

function showError() {
    elements.result.value = isRTL ? 'خطأ' : 'Error';
    elements.result.classList.add('error');
    
    setTimeout(() => {
        elements.result.classList.remove('error');
        clearAll();
    }, 2000);
}

// أحداث اللمس المحسنة
function setupTouchEvents() {
    let touchStartTime;
    
    document.addEventListener('touchstart', function(event) {
        touchStartTime = Date.now();
        
        if (event.target.classList.contains('btn')) {
            event.target.style.transform = 'scale(0.95)';
        }
    });
    
    document.addEventListener('touchend', function(event) {
        const touchDuration = Date.now() - touchStartTime;
        
        if (event.target.classList.contains('btn')) {
            event.target.style.transform = 'scale(1)';
            
            // لمسة سريعة للنقر العادي
            if (touchDuration < 500) {
                addRippleEffect(event.target);
            }
        }
    });
}

// تعديل تخطيط الشاشة
function handleResize() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        elements.historyPanel.style.width = '100%';
        elements.historyPanel.style.maxHeight = '200px';
    } else {
        elements.historyPanel.style.width = '300px';
        elements.historyPanel.style.maxHeight = 'none';
    }
}

// حفظ وتحميل الإعدادات
function saveSettings() {
    localStorage.setItem('calc-theme', currentTheme);
    localStorage.setItem('calc-language', isRTL ? 'ar' : 'en');
    localStorage.setItem('calc-scientific-mode', isScientificMode);
}

function loadSettings() {
    const savedScientificMode = localStorage.getItem('calc-scientific-mode');
    if (savedScientificMode === 'true') {
        isScientificMode = true;
        elements.scientificButtons.classList.add('active');
        elements.modeToggle.textContent = isRTL ? 'أساسي' : 'Basic';
    }
}

function saveHistory() {
    localStorage.setItem('calc-history', JSON.stringify(history));
}

// تحديث العرض
function updateDisplay() {
    elements.result.value = currentResult;
    elements.expression.textContent = formatExpression(currentExpression);
}

// إضافة تأثيرات CSS ديناميكية
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .calculating {
        pointer-events: none;
    }
    
    .calculating .btn {
        opacity: 0.7;
    }
`;
document.head.appendChild(style);

// تصدير الوظائف للاستخدام العام
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
