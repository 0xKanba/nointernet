let result = document.getElementById("result");

function appendValue(value) {
  result.value += value;
}

function clearDisplay() {
  result.value = "";
}

function deleteChar() {
  result.value = result.value.slice(0, -1);
}

function calculate() {
  try {
    // استبدال الرموز
    let expression = result.value.replace(/×/g, '*').replace(/÷/g, '/');
    result.value = eval(expression).toString();
  } catch (e) {
    result.value = "خطأ";
  }
}
