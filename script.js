// ---------- Data (saved in the browser) ----------
let expenses = [];
try { expenses = JSON.parse(localStorage.getItem("expenses")) || []; } catch (e) { expenses = []; }

const $ = id => document.getElementById(id);
$("date").valueAsDate = new Date();

const save = () => { try { localStorage.setItem("expenses", JSON.stringify(expenses)); } catch (e) {} };
const money = n => "₹" + n.toFixed(2);

// ---------- Chart ----------
let chart = null;
const colors = ["#1f7a5a", "#e0a030", "#3b78c4", "#c4503b", "#8a6bbf"];

function drawChart() {
  if (typeof Chart === "undefined") return;           // Chart.js failed to load
  const sums = {};
  expenses.forEach(e => sums[e.category] = (sums[e.category] || 0) + e.amount);
  const labels = Object.keys(sums);
  const data = Object.values(sums);

  if (chart) chart.destroy();
  chart = new Chart($("chart"), {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors }] },
    options: { maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
  });
}

// ---------- Render ----------
function render() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  $("total").textContent = money(total);

  const list = $("list");
  list.innerHTML = "";
  if (expenses.length === 0) {
    list.innerHTML = '<li class="empty">No expenses yet. Add your first one above.</li>';
  }
  expenses.slice().reverse().forEach(e => {
    const li = document.createElement("li");
    li.innerHTML =
      '<div><div></div><div class="meta"></div></div>' +
      '<div><span class="amt"></span> <button class="del" aria-label="Delete expense">✕</button></div>';
    li.querySelector("div div").textContent = e.title;                       // safe: no HTML injection
    li.querySelector(".meta").textContent = e.category + " · " + e.date;
    li.querySelector(".amt").textContent = money(e.amount);
    li.querySelector(".del").onclick = () => removeExpense(e.id);
    list.appendChild(li);
  });
  drawChart();
}

// ---------- Actions ----------
function addExpense() {
  const title = $("title").value.trim();
  const amount = parseFloat($("amount").value);
  if (!title || !(amount > 0)) { alert("Enter a title and an amount greater than 0."); return; }

  expenses.push({
    id: Date.now(),
    title,
    amount,
    category: $("category").value,
    date: $("date").value
  });
  save();
  $("title").value = "";
  $("amount").value = "";
  render();
}

function removeExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  save();
  render();
}

$("addBtn").addEventListener("click", addExpense);
render();