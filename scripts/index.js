// Constants and Configuration
const CONFIG = {
  BREAKPOINTS: {
    MOBILE: 768,
  },
  VALIDATION: {
    NAME: {
      pattern: /^[A-Za-z\s]{2,50}$/,
      message: "Please enter a valid name (2-50 characters, letters only)",
    },
    PHONE: {
      pattern: /^254[17]\d{8}$/,
      message:
        "Please enter a valid Kenyan phone number (format: 254XXXXXXXXX)",
    },
    ID: {
      pattern: /^\d{8}$/,
      message: "Please enter a valid 8-digit ID number",
    },
  },
};

// Navigation Manager
class NavigationManager {
  constructor() {
    this.hamburger = document.getElementById("hamburger");
    this.navLinks = document.getElementById("nav-links");
    this.isMenuOpen = false;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Toggle menu on hamburger click
    this.hamburger?.addEventListener("click", () => this.toggleMenu());

    // Handle window resize
    window.addEventListener("resize", () => this.handleResize());

    // Close menu when clicking outside
    document.addEventListener("click", (e) => this.handleOutsideClick(e));
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.navLinks?.classList.toggle("show");
    this.hamburger?.classList.toggle("open");

    // Update ARIA attributes
    this.hamburger?.setAttribute("aria-expanded", this.isMenuOpen.toString());
    this.navLinks?.setAttribute("aria-hidden", (!this.isMenuOpen).toString());
  }

  handleResize() {
    if (window.innerWidth > CONFIG.BREAKPOINTS.MOBILE && this.isMenuOpen) {
      this.isMenuOpen = false;
      this.navLinks?.classList.remove("show");
      this.hamburger?.classList.remove("open");
      this.hamburger?.setAttribute("aria-expanded", "false");
      this.navLinks?.setAttribute("aria-hidden", "true");
    }
  }

  handleOutsideClick(event) {
    if (
      this.isMenuOpen &&
      !this.hamburger?.contains(event.target) &&
      !this.navLinks?.contains(event.target)
    ) {
      this.toggleMenu();
    }
  }
}

// Form Manager
class FormManager {
  constructor() {
    this.form = document.getElementById("loanForm");
    this.formFields = {
      name: document.getElementById("name"),
      phone: document.getElementById("mpesa"),
      idNumber: document.getElementById("idNumber"),
      loanType: document.getElementById("loanType"),
    };
    this.errorElements = {
      name: document.getElementById("name-error"),
      phone: document.getElementById("phone-error"),
      idNumber: document.getElementById("id-error"),
      loanType: document.getElementById("loan-type-error"),
    };

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Form submission
    this.form?.addEventListener("submit", (e) => this.handleSubmit(e));

    // Real-time validation
    Object.entries(this.formFields).forEach(([key, field]) => {
      field?.addEventListener("input", () => this.validateField(key, field));
      field?.addEventListener("blur", () => this.validateField(key, field));
    });
  }

  validateField(fieldName, field) {
    if (!field) return false;

    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    switch (fieldName) {
      case "name":
        isValid = CONFIG.VALIDATION.NAME.pattern.test(value);
        errorMessage = isValid ? "" : CONFIG.VALIDATION.NAME.message;
        break;

      case "phone":
        let phoneValue = value.replace(/\s+/g, "");
        if (phoneValue.startsWith("0")) {
          phoneValue = "254" + phoneValue.slice(1);
          field.value = phoneValue;
        }
        isValid = CONFIG.VALIDATION.PHONE.pattern.test(phoneValue);
        errorMessage = isValid ? "" : CONFIG.VALIDATION.PHONE.message;
        break;

      case "idNumber":
        isValid = CONFIG.VALIDATION.ID.pattern.test(value);
        errorMessage = isValid ? "" : CONFIG.VALIDATION.ID.message;
        break;

      case "loanType":
        isValid = !!value;
        errorMessage = isValid ? "" : "Please select a loan type";
        break;
    }

    this.updateFieldValidation(fieldName, isValid, errorMessage);
    return isValid;
  }

  updateFieldValidation(fieldName, isValid, errorMessage) {
    const field = this.formFields[fieldName];
    const errorElement = this.errorElements[fieldName];

    if (field && errorElement) {
      field.classList.toggle("invalid", !isValid);
      field.setAttribute("aria-invalid", (!isValid).toString());
      errorElement.textContent = errorMessage;
      errorElement.style.display = errorMessage ? "block" : "none";
    }
  }

  validateAllFields() {
    return Object.entries(this.formFields).every(([key, field]) =>
      this.validateField(key, field)
    );
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      // Validate all fields
      if (!this.validateAllFields()) {
        throw new Error("Please correct the errors in the form");
      }

      // Get form values
      const formData = {
        name: this.formFields.name?.value.trim(),
        phone: this.formFields.phone?.value.trim(),
        idNumber: this.formFields.idNumber?.value.trim(),
        loanType: this.formFields.loanType?.value,
      };

      // Store in localStorage
      Object.entries(formData).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });

      // Show loading state
      this.updateSubmitButtonState(true);

      // Simulate processing time (remove in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to loan details page
      window.location.href = "/loan-details.html";
    } catch (error) {
      console.error("Form submission error:", error);
      alert(error.message);
    } finally {
      this.updateSubmitButtonState(false);
    }
  }

  updateSubmitButtonState(isLoading) {
    const submitButton = this.form?.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading
        ? "Processing..."
        : "Find Your Loan Eligibility";
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    // Initialize navigation
    const navigation = new NavigationManager();

    // Initialize form
    const form = new FormManager();

    console.log("Application initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
  }
});
