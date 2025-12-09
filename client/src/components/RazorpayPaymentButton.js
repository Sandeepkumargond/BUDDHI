"use client";

import { useState, useEffect, useRef } from "react";

export default function RazorpayPaymentButton({
  feeStructureHeadId,
  feeStructureId,
  feeHead,
  amount,
  session,
  onPaymentSuccess,
  onPaymentError,
  onSuccess,
  buttonText,
  className = "",
  disabled = false,
}) {
  // Support both prop naming conventions
  const feeName = feeHead || feeStructureHeadId;
  const structureId = feeStructureId || feeStructureHeadId;
  const finalAmount = Number(amount || 0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const handlerCalled = useRef(false);
  const paymentInProgress = useRef(false);
  const razorpayRef = useRef(null);

  // Load Razorpay script
  useEffect(() => {
    // Check if script already loaded globally
    if (window.Razorpay) {
      console.log("✅ Razorpay script already available globally");
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.type = "text/javascript";
    script.onload = () => {
      console.log("✅ Razorpay script loaded successfully");
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("❌ Failed to load Razorpay script");
      setError("Failed to load Razorpay script. Please refresh the page.");
      setScriptLoaded(false);
    };
    document.body.appendChild(script);

    return () => {
      // Don't remove script to avoid reloading issues
      // if (script.parentNode) {
      //   script.parentNode.removeChild(script);
      // }
    };
  }, []);

  const clearError = () => {
    setError(null);
  };

  const handlePayment = async () => {
    // Prevent double-click/multiple submissions
    if (paymentInProgress.current || loading) {
      console.log("Payment already in progress, ignoring click");
      return;
    }

    paymentInProgress.current = true;
    setLoading(true);
    handlerCalled.current = false;

    try {
      if (!finalAmount || finalAmount <= 0) {
        throw new Error("Invalid payment amount");
      }

      // Razorpay maximum limit is ₹50,00,000 (50 lakhs)
      const RAZORPAY_MAX_AMOUNT = 5000000; // 50 lakhs in rupees
      if (finalAmount > RAZORPAY_MAX_AMOUNT) {
        throw new Error(`Amount exceeds maximum limit of ₹${RAZORPAY_MAX_AMOUNT.toLocaleString('en-IN')}. Please contact admin to split the payment.`);
      }

      if (!feeName || !session) {
        throw new Error("Missing fee structure information");
      }

      if (!scriptLoaded) {
        throw new Error("Razorpay script not loaded. Please refresh the page.");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay is not available. Please refresh and try again.");
      }

      console.log("💰 Starting payment process");
      console.log("Amount:", finalAmount);
      console.log("Fee Head:", feeName);
      console.log("Session:", session);

      // Step 1: Create order on backend
      console.log("📝 Creating payment order...");
      const orderResponse = await fetch(
        (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
          "/api/v1/razorpay/order",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: finalAmount,
            currency: "INR",
            receipt: `FEE_${feeName}_${session}_${Date.now()}`,
            notes: {
              feeHead: feeName,
              session: session,
            },
          }),
        }
      );

      console.log("Response status:", orderResponse.status);

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Server error response:", errorText);
        let errorMsg = `Server error (${orderResponse.status})`;
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.message || errorMsg;
          console.error("Error details:", errorData);
        } catch (e) {
          // Keep the default error message
        }
        throw new Error(errorMsg);
      }

      const orderData = await orderResponse.json();
      console.log("✅ Order response:", orderData);

      if (!orderData.success) {
        throw new Error(orderData.message || "Order creation failed");
      }

      if (!orderData.data) {
        throw new Error("Invalid order response - missing data");
      }

      const { order, keyId } = orderData.data;

      if (!order || !order.id) {
        console.error("Invalid order structure:", orderData);
        throw new Error("Invalid order from server");
      }

      if (!keyId) {
        console.error("No Razorpay key ID returned");
        throw new Error("Payment gateway not configured. Contact support.");
      }

      console.log("📦 Order created:", order.id);
      console.log("🔑 Razorpay Key ID:", keyId.substring(0, 10) + "***");
      console.log("💰 Amount:", order.amount / 100, order.currency);

      // Step 2: Create and open Razorpay checkout
      const razorpayOptions = {
        key: keyId,
        amount: order.amount, // Amount in paise
        currency: order.currency,
        order_id: order.id,
        name: "Buddhi Archives",
        description: "Fee Payment",
        notes: {
          feeHead: feeName,
          session: session,
        },
        handler: async (paymentResponse) => {
          try {
            handlerCalled.current = true;
            console.log("✅ Payment authorized by Razorpay");
            console.log("Payment response:", {
              orderId: paymentResponse.razorpay_order_id,
              paymentId: paymentResponse.razorpay_payment_id,
              signature: paymentResponse.razorpay_signature,
            });
            
            // Step 3: Verify payment on backend
            console.log("🔐 Verifying payment with backend...");
            const verifyResponse = await fetch(
              (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000") +
                "/api/v1/razorpay/verify",
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  orderId: paymentResponse.razorpay_order_id,
                  paymentId: paymentResponse.razorpay_payment_id,
                  signature: paymentResponse.razorpay_signature,
                  feeStructureHeadId: feeName,
                  session,
                }),
              }
            );

            const verifyData = await verifyResponse.json();
            console.log("Backend verification response:", verifyData);
            
            if (!verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed"
              );
            }

            console.log("✅ Payment verified and recorded!");
            setLoading(false);
            setError(null);
            // Call both onPaymentSuccess and onSuccess for flexibility
            if (onPaymentSuccess) {
              onPaymentSuccess(verifyData.data?.feePayment);
            }
            if (onSuccess) {
              onSuccess(verifyData.data?.feePayment);
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            const errorMessage =
              err.message || "Payment verification failed";
            setError(errorMessage);
            setLoading(false);
            paymentInProgress.current = false;
            if (onPaymentError) {
              onPaymentError(errorMessage);
            }
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Modal dismissed by user");
            paymentInProgress.current = false;
            if (!handlerCalled.current) {
              setLoading(false);
              const dismissMessage =
                "Payment cancelled. Please try again if needed.";
              setError(dismissMessage);
              if (onPaymentError) {
                onPaymentError(dismissMessage);
              }
            }
            handlerCalled.current = false;
          },
        },
      };

      console.log("🚀 Opening Razorpay checkout...");
      
      try {
        const razorpayInstance = new window.Razorpay(razorpayOptions);
        razorpayRef.current = razorpayInstance;
        razorpayInstance.open();
        console.log("✅ Razorpay modal opened");
      } catch (err) {
        console.error("❌ Error opening Razorpay:", err);
        throw new Error("Failed to open payment modal: " + err.message);
      }
    } catch (err) {
      console.error("❌ Payment error:", err);
      const errorMessage = err.message || "Payment failed";
      setError(errorMessage);
      setLoading(false);
      paymentInProgress.current = false;
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="text-xs text-red-700 bg-red-50 p-3 rounded border border-red-300 whitespace-pre-wrap">
          <strong>❌ Error:</strong> {error}
          <button
            onClick={clearError}
            className="text-xs mt-2 text-red-600 hover:text-red-800 underline font-semibold"
          >
            Dismiss & Retry
          </button>
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={
          disabled || loading || !scriptLoaded || !feeName || !finalAmount
        }
        className={`px-4 py-2 rounded font-medium transition-colors whitespace-nowrap text-sm ${
          disabled || loading || !scriptLoaded || !feeName || !finalAmount
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
        }`}
        title={
          !scriptLoaded
            ? "Loading payment gateway..."
            : !feeName
            ? "Fee information missing"
            : !finalAmount
            ? "Amount is required"
            : ""
        }
      >
        {!scriptLoaded ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="animate-spin">⏳</span> Loading...
          </span>
        ) : loading ? (
          <span className="flex items-center gap-2 justify-center">
            <span className="animate-spin">⏳</span> Processing...
          </span>
        ) : (
          buttonText || ("💳 Pay ₹" + Number(finalAmount || 0).toLocaleString("en-IN"))
        )}
      </button>
    </div>
  );
}



























































































































































































