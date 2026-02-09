import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

interface StudentData {
    name: string;
    email: string;
    studentId?: string;
    department?: string;
}

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: "Invalid file type. Please upload an Excel file (.xlsx or .xls)" },
                { status: 400 }
            );
        }

        // Read file buffer
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "buffer" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return NextResponse.json(
                { success: false, error: "Excel file is empty" },
                { status: 400 }
            );
        }

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | undefined)[][];

        if (jsonData.length < 2) {
            return NextResponse.json(
                { success: false, error: "Excel file must have a header row and at least one data row" },
                { status: 400 }
            );
        }

        // Get header row and normalize column names
        const headers = (jsonData[0] || []).map((h) =>
            String(h || "").toLowerCase().trim()
        );

        // Find column indices
        const nameIndex = headers.findIndex((h) =>
            ["name", "student name", "full name", "الاسم"].includes(h)
        );
        const emailIndex = headers.findIndex((h) =>
            ["email", "email address", "البريد الإلكتروني", "الايميل"].includes(h)
        );
        const studentIdIndex = headers.findIndex((h) =>
            ["student id", "studentid", "id", "الرقم الجامعي"].includes(h)
        );
        const departmentIndex = headers.findIndex((h) =>
            ["department", "dept", "القسم"].includes(h)
        );

        // Validate required columns exist
        if (nameIndex === -1) {
            return NextResponse.json(
                { success: false, error: "Missing required column: 'Name'. Please use the template provided." },
                { status: 400 }
            );
        }

        if (emailIndex === -1) {
            return NextResponse.json(
                { success: false, error: "Missing required column: 'Email'. Please use the template provided." },
                { status: 400 }
            );
        }

        // Parse data rows
        const students: StudentData[] = [];
        const errors: ValidationError[] = [];
        const seenEmails = new Set<string>();

        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0 || row.every((cell) => !cell)) {
                continue; // Skip empty rows
            }

            const name = String(row[nameIndex] || "").trim();
            const email = String(row[emailIndex] || "").trim().toLowerCase();
            const studentId = studentIdIndex !== -1 ? String(row[studentIdIndex] || "").trim() : undefined;
            const department = departmentIndex !== -1 ? String(row[departmentIndex] || "").trim() : undefined;

            // Validate name
            if (!name) {
                errors.push({
                    row: i + 1,
                    field: "name",
                    message: "Name is required",
                });
                continue;
            }

            // Validate email
            if (!email) {
                errors.push({
                    row: i + 1,
                    field: "email",
                    message: "Email is required",
                });
                continue;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                errors.push({
                    row: i + 1,
                    field: "email",
                    message: `Invalid email format: ${email}`,
                });
                continue;
            }

            // Check for duplicates
            if (seenEmails.has(email)) {
                errors.push({
                    row: i + 1,
                    field: "email",
                    message: `Duplicate email: ${email}`,
                });
                continue;
            }

            seenEmails.add(email);
            students.push({
                name,
                email,
                studentId: studentId || undefined,
                department: department || undefined,
            });
        }

        if (errors.length > 0 && students.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "No valid students found in file",
                    validationErrors: errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            students,
            totalRows: jsonData.length - 1,
            validCount: students.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error("Error parsing Excel file:", error);
        return NextResponse.json(
            { success: false, error: "Failed to parse Excel file" },
            { status: 500 }
        );
    }
}
