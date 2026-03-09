import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            await req.json();

        const secret = process.env.RAZORPAY_KEY_SECRET;

        if (!secret) {
            return NextResponse.json(
                { error: "Razorpay secret not configured" },
                { status: 500 }
            );
        }

        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest("hex");

        if (generated_signature === razorpay_signature) {
            return NextResponse.json(
                { message: "Payment verified successfully" },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return NextResponse.json(
            { error: "Error verifying payment" },
            { status: 500 }
        );
    }
}
