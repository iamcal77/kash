const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, ".")));

// Use sandbox URL for testing
const mpesaAPI = axios.create({
  baseURL: "https://sandbox.safaricom.co.ke",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
let tokenData = {
  token: null,
  expiresAt: null,
};

// Get OAuth Token with better error handling
async function getOAuthToken() {
  try {
    // Check if we have a valid cached token
    if (
      tokenData.token &&
      tokenData.expiresAt &&
      Date.now() < tokenData.expiresAt
    ) {
      console.log("Using cached token");
      return tokenData.token;
    }

    const auth = Buffer.from(
      `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
    ).toString("base64");

    console.log("Requesting new OAuth token...");
    console.log("Auth string:", auth);

    const response = await mpesaAPI.get(
      "/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    console.log("OAuth Response:", response.data);

    const token = response.data.access_token;
    const expiresIn = response.data.expires_in;

    tokenData = {
      token,
      expiresAt: Date.now() + expiresIn * 1000 - 60000,
    };

    return token;
  } catch (error) {
    console.error("OAuth Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

// STK Push endpoint with retries
app.post("/stkpush", async (req, res) => {
  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount <= maxRetries) {
    try {
      const { phone, amount } = req.body;
      console.log("Processing STK Push Request:", { phone, amount });

      const token = await getOAuthToken();
      console.log("Using token:", token);

      const timestamp = new Date()
        .toISOString()
        .replace(/[^0-9]/g, "")
        .slice(0, 14);

      const password = Buffer.from(
        `${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`
      ).toString("base64");

      const stkPushRequest = {
        BusinessShortCode: process.env.SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: parseInt(amount),
        PartyA: phone,
        PartyB: process.env.SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: "Loan Verification",
        TransactionDesc: "Loan Verification Fee",
      };

      console.log("STK Push Request:", stkPushRequest);

      const stkResponse = await mpesaAPI.post(
        "/mpesa/stkpush/v1/processrequest",
        stkPushRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = stkResponse.data;
      console.log("STK Push Success:", responseData);

      if (responseData.ResponseCode === "0") {
        const transactionData = {
          merchantRequestId: responseData.MerchantRequestID,
          checkoutRequestId: responseData.CheckoutRequestID,
          amount,
          phone,
          timestamp: new Date().toISOString(),
          status: "pending",
        };

        console.log("Transaction initiated:", transactionData);
      }

      return res.status(200).json({
        success: true,
        ...responseData,
        message:
          "STK push sent successfully. Please check your phone to complete the payment.",
      });
    } catch (error) {
      console.error("STK Push Error:", {
        attempt: retryCount + 1,
        status: error.response?.status,
        data: error.response?.data,
      });

      // If it's an auth error, clear token and retry
      if (
        error.response?.status === 404 ||
        error.response?.data?.errorCode === "404.001.03"
      ) {
        tokenData = { token: null, expiresAt: null };
        retryCount++;

        if (retryCount <= maxRetries) {
          console.log(`Retrying STK push (attempt ${retryCount})...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          continue;
        }
      }

      // If we're here, either it's not an auth error or we've exhausted retries
      return res.status(error.response?.status || 500).json({
        success: false,
        error: "Failed to initiate STK Push",
        message: error.response?.data?.CustomerMessage || error.message,
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("Using Safaricom Sandbox endpoints");
});
