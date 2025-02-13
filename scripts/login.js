document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Retrieve user data from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (
    storedUser &&
    storedUser.email === email &&
    storedUser.password === password
  ) {
    localStorage.setItem("username", storedUser.name); // Store the name for dashboard
    window.location.href = "dashboard.html"; // Redirect to dashboard
  } else {
    alert("Invalid email or password. Please try again.");
  }
});
