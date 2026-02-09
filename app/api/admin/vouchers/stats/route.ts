import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { Voucher, Certificate } from "@/lib/models";

// GET - Get voucher inventory statistics
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Get all certificates
        const certificates = await Certificate.find({ isActive: true }).lean();

        // Get counts per certificate and status
        const stats = await Promise.all(
            certificates.map(async (cert) => {
                const [available, reserved, assigned, delivered, used, expired, expiringIn30Days] = await Promise.all([
                    Voucher.countDocuments({ certificateId: cert._id, status: "AVAILABLE" }),
                    Voucher.countDocuments({ certificateId: cert._id, status: "RESERVED" }),
                    Voucher.countDocuments({ certificateId: cert._id, status: "ASSIGNED" }),
                    Voucher.countDocuments({ certificateId: cert._id, status: "DELIVERED" }),
                    Voucher.countDocuments({ certificateId: cert._id, status: "USED" }),
                    Voucher.countDocuments({ certificateId: cert._id, status: "EXPIRED" }),
                    Voucher.countDocuments({
                        certificateId: cert._id,
                        status: "AVAILABLE",
                        expiresAt: {
                            $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                            $gt: new Date(),
                        },
                    }),
                ]);

                return {
                    certificate: {
                        _id: cert._id,
                        code: cert.code,
                        nameEn: cert.nameEn,
                        nameAr: cert.nameAr,
                    },
                    counts: {
                        available,
                        reserved,
                        assigned,
                        delivered,
                        used,
                        expired,
                        total: available + reserved + assigned + delivered + used + expired,
                    },
                    alerts: {
                        lowStock: available < 10,
                        expiringIn30Days,
                    },
                };
            })
        );

        // Overall totals
        const totals = {
            available: stats.reduce((sum, s) => sum + s.counts.available, 0),
            reserved: stats.reduce((sum, s) => sum + s.counts.reserved, 0),
            assigned: stats.reduce((sum, s) => sum + s.counts.assigned, 0),
            delivered: stats.reduce((sum, s) => sum + s.counts.delivered, 0),
            used: stats.reduce((sum, s) => sum + s.counts.used, 0),
            expired: stats.reduce((sum, s) => sum + s.counts.expired, 0),
            total: stats.reduce((sum, s) => sum + s.counts.total, 0),
        };

        // Get recent batches
        const recentBatches = await Voucher.aggregate([
            { $match: { batchId: { $exists: true, $ne: null } } },
            { $group: { _id: "$batchId", count: { $sum: 1 }, createdAt: { $first: "$createdAt" } } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
        ]);

        return NextResponse.json({
            success: true,
            stats,
            totals,
            recentBatches,
        });
    } catch (error) {
        console.error("Failed to fetch voucher stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch voucher stats" },
            { status: 500 }
        );
    }
}
