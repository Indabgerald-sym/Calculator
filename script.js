var display = document.getElementById('display');
var expr = '';          
var justEvaluated = false;

function isOp(c) { return c === '+' || c === '-' || c === '*' || c === '/'; }

function fmt(n) {
  if (!isFinite(n) || Math.abs(n) >= 1e15) return 'Error';
  var s = String(parseFloat(n.toPrecision(12)));
  return s.indexOf('e') !== -1 ? 'Error' : s;
}

function evaluate(s) {
  var tokens = [], num = '';
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (isOp(c) && !(c === '-' && num === '' && (tokens.length === 0))) {
      tokens.push(parseFloat(num)); tokens.push(c); num = '';
    } else {
      num += c;
    }
  }
  tokens.push(parseFloat(num));

  
  var t = [tokens[0]];
  for (var j = 1; j < tokens.length; j += 2) {
    var o = tokens[j], n = tokens[j + 1];
    if (o === '*') t[t.length - 1] *= n;
    else if (o === '/') {
      if (n === 0) return NaN;
      t[t.length - 1] /= n;
    } else { t.push(o); t.push(n); }
  }
  
  var r = t[0];
  for (var k = 1; k < t.length; k += 2) {
    r = t[k] === '+' ? r + t[k + 1] : r - t[k + 1];
  }
  return r;
}

function render() {
  var text = expr === '' ? '0' : expr.replace(/\*/g, '×').replace(/\//g, '÷');
  display.value = text;
  display.style.fontSize = text.length > 16 ? '20px' : text.length > 10 ? '28px' : '40px';
}

function press(k) {
  if (expr === 'Error') { expr = ''; justEvaluated = false; }

  if (k === 'C') { expr = ''; justEvaluated = false; render(); return; }

  if (k === 'B') {
    if (justEvaluated) { expr = ''; justEvaluated = false; }
    else expr = expr.slice(0, -1);
    render(); return;
  }

  if (k >= '0' && k <= '9') {
    if (justEvaluated) { expr = ''; justEvaluated = false; }
    if (expr.length < 30) expr += k;
    render(); return;
  }

  if (k === '.') {
    if (justEvaluated) { expr = ''; justEvaluated = false; }
    var lastNum = expr.match(/[0-9.]*$/)[0];
    if (lastNum.indexOf('.') === -1) expr += (lastNum === '' ? '0.' : '.');
    render(); return;
  }

  if (k === '=') {
    if (expr === '') return;
    var s = expr;
    while (s.length && isOp(s[s.length - 1])) s = s.slice(0, -1);  
    if (s === '' || s === '-') return;
    expr = fmt(evaluate(s));      
    justEvaluated = true;
    render(); return;
  }

  // + - * /
  justEvaluated = false;          
  if (expr === '') {
    if (k === '-') expr = '-';
    render(); return;
  }
  if (isOp(expr[expr.length - 1])) {
    if (expr.length === 1) { render(); return; }   
    expr = expr.slice(0, -1) + k;                  
  } else {
    expr += k;
  }
  render();
}

document.querySelectorAll('button').forEach(function (b) {
  b.addEventListener('click', function () { press(b.getAttribute('data-k')); });
});

document.addEventListener('keydown', function (e) {
  var k = e.key;
  if ((k >= '0' && k <= '9') || '+-*/.'.indexOf(k) !== -1) press(k);
  else if (k === 'Enter' || k === '=') { e.preventDefault(); press('='); }
  else if (k === 'Backspace') press('B');
  else if (k === 'Escape' || k === 'c' || k === 'C') press('C');
});