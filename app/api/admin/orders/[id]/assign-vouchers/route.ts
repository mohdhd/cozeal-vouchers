import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order, Voucher, VoucherRecipient } from "@/lib/models";
import { auth } from "@/lib/auth";
import { sendEmail, getVoucherDeliveryEmailHtml } from "@/lib/email";
import mongoose from "mongoose";

interface StudentRecipient {
    name: string;
    email: string;
    studentId?: string;
    voucherId?: mongoose.Types.ObjectId;
    deliveryStatus: "PENDING" | "SENT" | "OPENED" | "FAILED";
    deliveredAt?: Date;
    deliveryError?: string;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Check admin auth
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const { id } = await params;

        // Get the order
        const order = await Order.findById(id).populate("items.certificateId");
        if (!order) {
            return NextResponse.json(
                { success: false, error: "Order not found" },
                { status: 404 }
            );
        }

        // Validate order is ready for voucher assignment
        if (order.status !== "PAID") {
            return NextResponse.json(
                { success: false, error: "Order must be paid before assigning vouchers" },
                { status: 400 }
            );
        }

        if (order.deliveryMethod !== "DIRECT_TO_STUDENTS") {
            return NextResponse.json(
                { success: false, error: "This order is not set for direct-to-students delivery" },
                { status: 400 }
            );
        }

        if (!order.studentRecipients || order.studentRecipients.length === 0) {
            return NextResponse.json(
                { success: false, error: "No student recipients found in order" },
                { status: 400 }
            );
        }

        // Get certificate info from order items
        const certificateId = order.items?.[0]?.certificateId?._id || order.items?.[0]?.certificateId;
        const certificateName = order.items?.[0]?.certificateName || "CompTIA Voucher";

        if (!certificateId) {
            return NextResponse.json(
                { success: false, error: "No certificate found in order" },
                { status: 400 }
            );
        }

        // Get available vouchers for this certificate
        const pendingRecipients = order.studentRecipients.filter(
            (r: StudentRecipient) => r.deliveryStatus === "PENDING" && !r.voucherId
        );

        if (pendingRecipients.length === 0) {
            return NextResponse.json(
                { success: false, error: "All recipients already have vouchers assigned" },
                { status: 400 }
            );
        }

        const availableVouchers = await Voucher.find({
            certificateId,
            status: "AVAILABLE",
            expiresAt: { $gt: new Date() },
        })
            .sort({ expiresAt: 1 }) // Use oldest expiring first
            .limit(pendingRecipients.length);

        if (availableVouchers.length < pendingRecipients.length) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Not enough vouchers available. Need ${pendingRecipients.length}, have ${availableVouchers.length}`,
                },
                { status: 400 }
            );
        }

        // Assign vouchers and send emails
        const results: { email: string; success: boolean; error?: string }[] = [];
        const updatedRecipients = [...order.studentRecipients];

        for (let i = 0; i < pendingRecipients.length; i++) {
            const recipient = pendingRecipients[i];
            const voucher = availableVouchers[i];

            const recipientIndex = updatedRecipients.findIndex(
                (r: StudentRecipient) => r.email === recipient.email
            );

            try {
                // Update voucher status
                await Voucher.updateOne(
                    { _id: voucher._id },
                    {
                        status: "ASSIGNED",
                        assignedAt: new Date(),
                        assignedToOrderId: order._id,
                        assignedBy: session.user.id,
                        recipientEmail: recipient.email,
                        recipientName: recipient.name,
                        deliveryMethod: "EMAIL_STUDENT",
                        deliveryStatus: "PENDING",
                        $push: {
                            history: {
                                action: "ASSIGNED_TO_STUDENT",
                                timestamp: new Date(),
                                userId: session.user.id,
                                details: `Assigned to ${recipient.name} (${recipient.email}) for order ${order.orderNumber}`,
                            },
                        },
                    }
                );

                // Create or update VoucherRecipient record
                await VoucherRecipient.findOneAndUpdate(
                    {
                        orderId: order._id,
                        email: recipient.email,
                    },
                    {
                        orderId: order._id,
                        institutionId: order.institutionId,
                        name: recipient.name,
                        email: recipient.email,
                        studentId: recipient.studentId,
                        certificateId,
                        voucherId: voucher._id,
                        status: "ASSIGNED",
                    },
                    { upsert: true }
                );

                // Format expiry date
                const expiryDate = voucher.expiresAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });

                // Send email to student
                const emailHtml = getVoucherDeliveryEmailHtml(
                    recipient.name,
                    voucher.code,
                    certificateName,
                    expiryDate,
                    order.customerName,
                    "en"
                );

                const emailSent = await sendEmail({
                    to: recipient.email,
                    subject: `Your ${certificateName} Voucher from ${order.customerName}`,
                    html: emailHtml,
                });

                if (emailSent) {
                    // Update voucher delivery status
                    await Voucher.updateOne(
                        { _id: voucher._id },
                        {
                            status: "DELIVERED",
                            deliveredAt: new Date(),
                            deliveryStatus: "SENT",
                            $push: {
                                history: {
                                    action: "EMAIL_SENT",
                                    timestamp: new Date(),
                                    details: `Email sent to ${recipient.email}`,
                                },
                            },
                        }
                    );

                    // Update VoucherRecipient
                    await VoucherRecipient.updateOne(
                        { orderId: order._id, email: recipient.email },
                        { status: "DELIVERED", deliveredAt: new Date() }
                    );

                    // Update recipient in order
                    updatedRecipients[recipientIndex] = {
                        ...updatedRecipients[recipientIndex],
                        voucherId: voucher._id,
                        deliveryStatus: "SENT",
                        deliveredAt: new Date(),
                    };

                    results.push({ email: recipient.email, success: true });
                } else {
                    throw new Error("Email sending failed");
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";

                // Update recipient with error
                updatedRecipients[recipientIndex] = {
                    ...updatedRecipients[recipientIndex],
                    voucherId: voucher._id,
                    deliveryStatus: "FAILED",
                    deliveryError: errorMessage,
                };

                // Update VoucherRecipient
                await VoucherRecipient.updateOne(
                    { orderId: order._id, email: recipient.email },
                    { status: "FAILED", deliveryError: errorMessage }
                );

                results.push({ email: recipient.email, success: false, error: errorMessage });
            }
        }

        // Update order with new recipient statuses
        const sentCount = results.filter((r) => r.success).length;
        const failedCount = results.filter((r) => !r.success).length;
        const allSent = failedCount === 0 && updatedRecipients.every(
            (r: StudentRecipient) => r.deliveryStatus === "SENT"
        );

        await Order.updateOne(
            { _id: order._id },
            {
                studentRecipients: updatedRecipients,
                fulfillmentStatus: allSent ? "DELIVERED" : "PARTIALLY_DELIVERED",
            }
        );

        return NextResponse.json({
            success: true,
            message: `Assigned and sent ${sentCount} vouchers${failedCount > 0 ? `, ${failedCount} failed` : ""}`,
            results,
            sentCount,
            failedCount,
        });
    } catch (error) {
        console.error("Error assigning vouchers:", error);
        return NextResponse.json(
            { success: false, error: "Failed to assign vouchers" },
            { status: 500 }
        );
    }
}
