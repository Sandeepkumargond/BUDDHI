"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { apiService } from "@/lib/api";
import RazorpayPaymentButton from "@/components/RazorpayPaymentButton";

export default function IdCardPayment() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);

  useEffect(() => {
    checkRazorpayConfig();
    fetchApplication();
  }, [params.id]);

  const checkRazorpayConfig = async () => {
    try {
      const response = await apiService.request("/razorpay/credentials", { method: "GET" });
      setRazorpayConfigured(response.success && response.data);
    } catch (error) {
      console.error("Razorpay not configured");
    }
  };

  const fetchApplication = async () => {
    try {
      const response = await apiService.request(`/id-card-student/my-applications/${params.id}`, { 
        method: "GET" 
      });
      setApplication(response.data);
    } catch (error) {
      showToast.error("Failed to fetch application details");
      router.push("/student/id-card");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // PaymentData comes from RazorpayPaymentButton after Razorpay verification
      // It contains the feePayment record with razorpayPaymentId, razorpayOrderId
      console.log("Payment success data:", paymentData);
      
      await apiService.request(`/id-card-student/applications/${params.id}/payment`, {
        method: "PATCH",
        body: {
          paymentId: paymentData.razorpayPaymentId || paymentData.transactionId,
          orderId: paymentData.razorpayOrderId,
          paymentStatus: 'completed'
        }
      });

      showToast.success("Payment completed successfully! Your application is now under review.");
      setTimeout(() => {
        router.push("/student/id-card");
      }, 2000);
    } catch (error) {
      console.error("Payment update error:", error);
      showToast.error("Payment completed but failed to update application. Please contact support.");
    }
  };

  const handlePaymentError = async (error) => {
    console.error("Payment error:", error);
    showToast.error("Payment failed. Please try again.");
    
    try {
      await apiService.request(`/id-card-student/applications/${params.id}/payment`, {
        method: "PATCH",
        body: {
          paymentStatus: 'failed'
        }
      });
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Application not found</div>
      </div>
    );
  }

  if (application.paymentStatus === 'completed') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Already Completed</h2>
          <p className="text-green-700 mb-4">
            Your payment has been processed successfully. Your application is under review.
          </p>
          <button
            onClick={() => router.push("/student/id-card")}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            View Application Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
        <p className="text-gray-600">ID Card Application Payment</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Application Details</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Application ID:</span>
            <span className="font-medium">{application._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Student Name:</span>
            <span className="font-medium">{application.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Enrollment No:</span>
            <span className="font-medium">{application.enrollmentNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Course:</span>
            <span className="font-medium">{application.course} - {application.branch}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Academic Year:</span>
            <span className="font-medium">{application.academicYear}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-semibold">Total Amount:</span>
            <span className="text-3xl font-bold">₹{application.paymentAmount}</span>
          </div>

          {!razorpayConfigured ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Payment gateway is not configured by the administrator. Please contact the admin office.
              </p>
            </div>
          ) : (
            <>
              <RazorpayPaymentButton
                feeStructureHeadId="ID Card Fee"
                amount={application.paymentAmount}
                session={application.academicYear}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                buttonText="Pay Now with Razorpay"
                className="w-full px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
              />

              <div className="mt-4 text-sm text-gray-600">
                <p className="mb-2">Payment Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Payments are processed securely through Razorpay</li>
                  <li>You will receive a payment confirmation email</li>
                  <li>Your application will be reviewed after successful payment</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/student/id-card")}
          className="flex-1 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back to Applications
        </button>
      </div>
    </div>
  );
}
