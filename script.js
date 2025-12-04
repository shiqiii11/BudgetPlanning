let expenses = [];
let editingIndex = null;

// Validation functions
function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorDiv = document.getElementById(fieldId + "Error");
    input.classList.add("input-error");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}

function clearErrors() {
    const inputs = ["title", "amount", "date"];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        const errorDiv = document.getElementById(id + "Error");
        input.classList.remove("input-error");
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    });
}

// Populate year dropdown
function loadFilterYears() {
    const yearSelect = document.getElementById("filterYear");
    const currentYear = new Date().getFullYear();

    yearSelect.innerHTML = "";
    for (let y = currentYear; y >= currentYear - 10; y--) {
        yearSelect.innerHTML += `<option value="${y}">${y}</option>`;
    }
    displayExpenses();
}

// Add Expense
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("expenseForm").addEventListener("submit", function(e) {
        e.preventDefault();

        let title = document.getElementById("title").value.trim();
        let amount = document.getElementById("amount").value.trim();
        let date = document.getElementById("date").value;

        // Clear previous errors
        clearErrors();

        // Validate fields
        let isValid = true;
        if (!title) {
            showError("title", "This field is required");
            isValid = false;
        }
        if (!amount) {
            showError("amount", "This field is required");
            isValid = false;
        }
        if (!date) {
            showError("date", "This field is required");
            isValid = false;
        }

        if (!isValid) return;

        if (editingIndex !== null) {
            // Update existing expense
            expenses[editingIndex] = {
                title: title,
                amount: Number(amount),
                date: new Date(date)
            };
            editingIndex = null;
            document.getElementById("formTitle").textContent = "Title";
            document.getElementById("submitBtn").textContent = "Add Expense";
        } else {
            // Add new expense
            expenses.push({
                title: title,
                amount: Number(amount),
                date: new Date(date)
            });
        }

        document.getElementById("expenseForm").reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById("date").value = today;
        clearErrors();
        displayExpenses();
    });
});

// Display expenses
function displayExpenses() {
    const list = document.getElementById("expenseList");
    const year = document.getElementById("filterYear").value;

    const filtered = expenses.map((e, index) => ({ ...e, originalIndex: index })).filter(e => e.date.getFullYear() == year);

    if (filtered.length === 0) {
        list.innerHTML = `<li class="list-group-item text-center text-muted">Found no expenses.</li>`;
        updateChart([]);
        return;
    }

    list.innerHTML = "";
    filtered.forEach(e => {
        const dateObj = e.date;
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[dateObj.getMonth()];
        const day = dateObj.getDate();
        const dateStr = e.date.toISOString().split('T')[0];
        
        list.innerHTML += `
            <li class="list-group-item" data-index="${e.originalIndex}">
                <div style="background: #444; border-radius: 8px; padding: 12px; text-align: center; min-width: 60px; flex-shrink: 0;">
                    <div style="color: #999; font-size: 11px; text-transform: uppercase;">${month}</div>
                    <div style="color: #999; font-size: 11px; margin-bottom: 2px;">${dateStr.split('-')[0]}</div>
                    <div style="color: white; font-size: 18px; font-weight: 600;">${day}</div>
                </div>
                <span style="color: white; font-weight: 500; flex-grow: 1;">${e.title}</span>
                <span style="background: #5a1f7d; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 600; text-align: right;">$${e.amount.toFixed(2)}</span>
                <button class="btn-edit" onclick="editExpense(${e.originalIndex})">✎</button>
                <button class="btn-delete" onclick="deleteExpense(${e.originalIndex})">×</button>
            </li>
        `;
    });

    updateChart(filtered.map(e => ({ title: e.title, amount: e.amount, date: e.date })));
}

// Chart.js (Monthly total expenses)
let barChart;

function updateChart(data) {
    let monthlyTotals = Array(12).fill(0);

    data.forEach(exp => {
        let month = exp.date.getMonth();
        monthlyTotals[month] += exp.amount;
    });

    if (barChart) barChart.destroy();

    barChart = new Chart(document.getElementById("chart"), {
        type: "bar",
        data: {
            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
            datasets: [{
                label: "RM",
                data: monthlyTotals,
                backgroundColor: "rgba(138, 102, 204, 0.7)",
                borderColor: "rgba(90, 31, 125, 1)",
                borderWidth: 0,
                borderRadius: 12,
                borderSkipped: false,
                categoryPercentage: 0.6,
                barPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#999'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            }
        }
    });
}

// Edit expense
function editExpense(index) {
    editingIndex = index;
    const expense = expenses[index];
    
    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("date").value = expense.date.toISOString().split('T')[0];
    
    document.getElementById("formTitle").textContent = "Edit Expense";
    document.getElementById("submitBtn").textContent = "Update Expense";
    
    // Scroll to form
    document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" });
}

// Delete expense
function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenses.splice(index, 1);
        displayExpenses();
    }
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("date").value = today;
    
    // Allow only numbers in amount field
    const amountInput = document.getElementById("amount");
    amountInput.addEventListener("input", function(e) {
        // Remove any non-numeric characters except decimal point
        this.value = this.value.replace(/[^\d.]/g, '');
        // Ensure only one decimal point
        const parts = this.value.split('.');
        if (parts.length > 2) {
            this.value = parts[0] + '.' + parts[1];
        }
        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
            this.value = parts[0] + '.' + parts[1].substring(0, 2);
        }
    });
    
    document.getElementById("filterYear").addEventListener("change", displayExpenses);
    loadFilterYears();
    
    // Cancel button handler
    document.querySelector(".btn-cancel").addEventListener("click", function() {
        editingIndex = null;
        document.getElementById("expenseForm").reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById("date").value = today;
        document.getElementById("formTitle").textContent = "Title";
        document.getElementById("submitBtn").textContent = "Add Expense";
    });
    
    console.log("App initialized");
});