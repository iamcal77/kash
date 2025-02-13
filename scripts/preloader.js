// Hide Preloader after Page Load
window.onload = function () {
  const preloader = document.getElementById("preloader");
  preloader.style.opacity = "0";
  setTimeout(() => {
    preloader.style.display = "none";
  }, 5000); // Smooth fade-out transition
};
