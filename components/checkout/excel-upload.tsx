"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Upload,
    Download,
    FileSpreadsheet,
    X,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Users,
} from "lucide-react";

export interface StudentData {
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

interface ExcelUploadProps {
    onStudentsChange: (students: StudentData[]) => void;
    students: StudentData[];
    disabled?: boolean;
}

export function ExcelUpload({ onStudentsChange, students, disabled }: ExcelUploadProps) {
    const t = useTranslations("checkout");
    const locale = useLocale();
    const isRTL = locale === "ar";

    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragging(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            await uploadFile(file);
        }
    }, [disabled]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setErrors([]);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/institutions/parse-students", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!data.success) {
                setUploadError(data.error);
                if (data.validationErrors) {
                    setErrors(data.validationErrors);
                }
                return;
            }

            setFileName(file.name);
            onStudentsChange(data.students);

            if (data.errors && data.errors.length > 0) {
                setErrors(data.errors);
            }
        } catch (error) {
            setUploadError("Failed to upload file. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = "/api/institutions/student-template";
    };

    const clearUpload = () => {
        setFileName(null);
        setErrors([]);
        setUploadError(null);
        onStudentsChange([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4">
            {/* Download Template Button */}
            <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTemplate}
                    disabled={disabled}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {isRTL ? "تحميل القالب" : "Download Template"}
                </Button>
            </div>

            {/* Upload Area */}
            {students.length === 0 ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"}
          `}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={disabled}
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                                {isRTL ? "جاري معالجة الملف..." : "Processing file..."}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-3 rounded-full bg-muted">
                                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {isRTL ? "اسحب وأفلت ملف Excel هنا" : "Drag & drop Excel file here"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {isRTL ? "أو انقر للتحديد" : "or click to browse"}
                                </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isRTL ? "الصيغ المدعومة: .xlsx, .xls" : "Supported formats: .xlsx, .xls"}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium">{fileName}</span>
                                <Badge variant="secondary">
                                    <Users className="h-3 w-3 mr-1" />
                                    {students.length} {isRTL ? "طالب" : "students"}
                                </Badge>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearUpload}
                                disabled={disabled}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Students Preview Table */}
                        <div className="border rounded-lg max-h-60 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>{isRTL ? "الاسم" : "Name"}</TableHead>
                                        <TableHead>{isRTL ? "البريد الإلكتروني" : "Email"}</TableHead>
                                        <TableHead>{isRTL ? "الرقم الجامعي" : "Student ID"}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.slice(0, 10).map((student, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell className="text-sm">{student.email}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {student.studentId || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {students.length > 10 && (
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                {isRTL
                                    ? `وعرض أول 10 طلاب فقط. الإجمالي: ${students.length}`
                                    : `Showing first 10 students. Total: ${students.length}`}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Error Display */}
            {uploadError && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-destructive">{uploadError}</p>
                    </div>
                </div>
            )}

            {/* Validation Errors */}
            {errors.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-yellow-800">
                                {isRTL
                                    ? `تم تخطي ${errors.length} صف بسبب أخطاء:`
                                    : `${errors.length} rows skipped due to errors:`}
                            </p>
                            <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                                {errors.slice(0, 5).map((error, index) => (
                                    <li key={index}>
                                        {isRTL ? `الصف ${error.row}` : `Row ${error.row}`}: {error.message}
                                    </li>
                                ))}
                                {errors.length > 5 && (
                                    <li>
                                        {isRTL
                                            ? `و ${errors.length - 5} أخطاء أخرى...`
                                            : `and ${errors.length - 5} more errors...`}
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
