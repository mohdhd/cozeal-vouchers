import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET() {
    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();

    // Define headers and sample data
    const data = [
        ["Name", "Email", "Student ID", "Department"],
        ["Ahmed Mohammed", "ahmed@university.edu.sa", "STU001", "Computer Science"],
        ["Fatima Ali", "fatima@university.edu.sa", "STU002", "Information Technology"],
        ["Omar Hassan", "omar@university.edu.sa", "STU003", "Engineering"],
    ];

    // Create worksheet from data
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Set column widths
    worksheet["!cols"] = [
        { wch: 25 }, // Name
        { wch: 35 }, // Email
        { wch: 15 }, // Student ID
        { wch: 25 }, // Department
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return as downloadable file
    return new NextResponse(buffer, {
        headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": "attachment; filename=student_voucher_template.xlsx",
        },
    });
}
