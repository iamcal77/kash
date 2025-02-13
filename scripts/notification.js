// Sample Data for Random Notifications
const users = [
  { name: "Fred 0727xxx1697", loanAmount: 47000, loanType: "Car Loan" },
  { name: "Alice 0722xxx1234", loanAmount: 12000, loanType: "Personal Loan" },
  { name: "John 0711xxx5678", loanAmount: 50000, loanType: "Business Loan" },
  { name: "Sarah 0733xxx7890", loanAmount: 20000, loanType: "Education Loan" },
  { name: "David 0708xxx6543", loanAmount: 15000, loanType: "Personal Loan" },
];

// Function to Show Notification with Random Data
function showRandomNotification() {
  const notification = document.getElementById("notification");
  const randomUser = users[Math.floor(Math.random() * users.length)];

  // Update Notification Content
  document.getElementById("notif-name").textContent = randomUser.name;
  document.getElementById("notif-amount").textContent =
    randomUser.loanAmount.toLocaleString();
  document.getElementById("notif-loan-type").textContent = randomUser.loanType;
  document.getElementById("notif-time").textContent = "Just Now";

  // Show Notification with Smooth Animation
  notification.classList.add("show");

  // Automatically hide after 5 seconds
  setTimeout(() => {
    hideNotification();
  }, 5000);
}

// Function to Hide Notification
function hideNotification() {
  const notification = document.getElementById("notification");
  notification.classList.remove("show");
}

// Function to Trigger Notifications at Random Intervals
function triggerRandomNotifications() {
  setInterval(() => {
    showRandomNotification();
  }, Math.floor(Math.random() * 10000) + 5000); // Between 5 to 15 seconds
}

// Close Notification Manually
document
  .getElementById("notification-close")
  .addEventListener("click", hideNotification);

// Start Notifications on Page Load
window.onload = triggerRandomNotifications;
