import { razorpay } from "@/lib/razorpay";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        if (!razorpay) {
            return NextResponse.json(
                { error: "Razorpay keys are not configured" },
                { status: 500 }
            );
        }

        const order = await razorpay.orders.create({
            amount: 500 * 100, // Amount in paise (₹500)
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        return NextResponse.json({ orderId: order.id }, { status: 200 });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json(
            { error: "Error creating order" },
            { status: 500 }
        );
    }
}
