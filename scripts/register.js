document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const phone = document.getElementById("register-phone").value;
    const password = document.getElementById("register-password").value;

    // Store user data in localStorage
    const userData = { name, email, phone, password };
    localStorage.setItem("user", JSON.stringify(userData));

    alert("Registration successful! Please log in.");
    window.location.href = "login.html"; // Redirect to login page
  });
