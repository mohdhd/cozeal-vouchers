"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Users, Send, Loader2, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

interface StudentRecipient {
    name: string;
    email: string;
    studentId?: string;
    voucherId?: string;
    deliveryStatus: "PENDING" | "SENT" | "OPENED" | "FAILED";
    deliveredAt?: string;
    deliveryError?: string;
}

interface StudentRecipientsCardProps {
    orderId: string;
    orderStatus: string;
    deliveryMethod?: string;
    recipients: StudentRecipient[];
}

const statusConfig = {
    PENDING: { icon: Clock, color: "bg-yellow-100 text-yellow-800", label: "Pending" },
    SENT: { icon: CheckCircle, color: "bg-green-100 text-green-800", label: "Sent" },
    OPENED: { icon: CheckCircle, color: "bg-blue-100 text-blue-800", label: "Opened" },
    FAILED: { icon: XCircle, color: "bg-red-100 text-red-800", label: "Failed" },
};

export function StudentRecipientsCard({
    orderId,
    orderStatus,
    deliveryMethod,
    recipients,
}: StudentRecipientsCardProps) {
    const [isAssigning, setIsAssigning] = useState(false);
    const [localRecipients, setLocalRecipients] = useState(recipients);

    const pendingCount = localRecipients.filter((r) => r.deliveryStatus === "PENDING").length;
    const sentCount = localRecipients.filter((r) => r.deliveryStatus === "SENT" || r.deliveryStatus === "OPENED").length;
    const failedCount = localRecipients.filter((r) => r.deliveryStatus === "FAILED").length;

    const canAssign = orderStatus === "PAID" && pendingCount > 0;

    const handleAssignVouchers = async () => {
        setIsAssigning(true);
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/assign-vouchers`, {
                method: "POST",
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                // Refresh the page to get updated recipient statuses
                window.location.reload();
            } else {
                toast.error(result.error || "Failed to assign vouchers");
            }
        } catch (error) {
            toast.error("Failed to assign vouchers");
        } finally {
            setIsAssigning(false);
        }
    };

    if (deliveryMethod !== "DIRECT_TO_STUDENTS" || !recipients || recipients.length === 0) {
        return null;
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Student Recipients
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {localRecipients.length} students will receive vouchers directly
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {pendingCount > 0 && (
                            <Badge variant="secondary">{pendingCount} pending</Badge>
                        )}
                        {sentCount > 0 && (
                            <Badge className="bg-green-100 text-green-800">{sentCount} sent</Badge>
                        )}
                        {failedCount > 0 && (
                            <Badge variant="destructive">{failedCount} failed</Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Action Buttons */}
                {canAssign && (
                    <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Ready to Assign Vouchers</p>
                                <p className="text-sm text-muted-foreground">
                                    {pendingCount} vouchers will be assigned and emailed to students
                                </p>
                            </div>
                            <Button
                                onClick={handleAssignVouchers}
                                disabled={isAssigning}
                                className="gap-2"
                            >
                                {isAssigning ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" />
                                        Assign Vouchers & Send
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Failed recipients alert */}
                {failedCount > 0 && (
                    <div className="mb-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-destructive">{failedCount} emails failed to send</p>
                                <p className="text-sm text-muted-foreground">
                                    You can retry sending emails to failed recipients
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleAssignVouchers}
                                disabled={isAssigning}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retry Failed
                            </Button>
                        </div>
                    </div>
                )}

                {/* Recipients Table */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Student ID</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localRecipients.map((recipient, index) => {
                                const status = statusConfig[recipient.deliveryStatus];
                                const StatusIcon = status.icon;
                                return (
                                    <TableRow key={index}>
                                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{recipient.name}</TableCell>
                                        <TableCell>{recipient.email}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {recipient.studentId || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`gap-1 ${status.color}`}>
                                                <StatusIcon className="h-3 w-3" />
                                                {status.label}
                                            </Badge>
                                            {recipient.deliveryError && (
                                                <p className="text-xs text-destructive mt-1">
                                                    {recipient.deliveryError}
                                                </p>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
