"use client";

import React, { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

const PaymentCard = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setLoading(true);
        try {
            // 1. Create order on the backend
            const response = await fetch("/api/create-order", {
                method: "POST",
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned a non-JSON response. Ensure environment variables are set.");
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create order");
            }

            // 2. Initialize Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                amount: 500 * 100,
                currency: "INR",
                name: "Razorpay Demo",
                description: "Test Transaction of ₹500",
                order_id: data.orderId,
                handler: async (response: any) => {
                    // 3. Verify payment on the backend
                    const verificationResponse = await fetch("/api/verify-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(response),
                    });

                    const verificationData = await verificationResponse.json();

                    if (verificationResponse.ok) {
                        router.push("/success");
                    } else {
                        alert("Payment verification failed: " + verificationData.error);
                    }
                },
                prefill: {
                    name: "John Doe",
                    email: "john@example.com",
                    contact: "9999999999",
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
        } catch (error: any) {
            console.error("Payment error:", error);
            alert(error.message || "An error occurred during payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Script
                id="razorpay-checkout-js"
                src="https://checkout.razorpay.com/v1/checkout.js"
            />
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Premium Subscription</h2>
                <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-600">Plan: Monthly Pro</span>
                    <span className="text-3xl font-extrabold text-blue-600">₹500</span>
                </div>
                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        "Pay Now"
                    )}
                </button>
                <p className="mt-4 text-xs text-gray-400 text-center">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </>
    );
};

export default PaymentCard;
