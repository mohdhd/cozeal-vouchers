"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const discountSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().min(1, "Value must be at least 1"),
  descriptionEn: z.string().min(1, "English description is required"),
  descriptionAr: z.string().min(1, "Arabic description is required"),
  minQuantity: z.number().optional(),
  maxUses: z.number().optional(),
  validFrom: z.string(),
  validUntil: z.string(),
  universityRestriction: z.string().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountFormProps {
  initialData?: {
    id: string;
    code: string;
    type: string;
    value: number;
    descriptionEn: string;
    descriptionAr: string;
    minQuantity: number | null;
    maxUses: number | null;
    validFrom: string;
    validUntil: string;
    universityRestriction: string | null;
    isActive: boolean;
  };
}

export function DiscountForm({ initialData }: DiscountFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: initialData?.code || "",
      type: (initialData?.type as "PERCENTAGE" | "FIXED") || "PERCENTAGE",
      value: initialData?.value || 10,
      descriptionEn: initialData?.descriptionEn || "",
      descriptionAr: initialData?.descriptionAr || "",
      minQuantity: initialData?.minQuantity || undefined,
      maxUses: initialData?.maxUses || undefined,
      validFrom: initialData?.validFrom?.split("T")[0] || new Date().toISOString().split("T")[0],
      validUntil: initialData?.validUntil?.split("T")[0] || "",
      universityRestriction: initialData?.universityRestriction || "",
    },
  });

  const onSubmit = async (data: DiscountFormData) => {
    setIsLoading(true);

    try {
      const url = initialData
        ? `/api/admin/discounts/${initialData.id}`
        : "/api/admin/discounts";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          code: data.code.toUpperCase(),
          validFrom: new Date(data.validFrom).toISOString(),
          validUntil: new Date(data.validUntil).toISOString(),
        }),
      });

      if (response.ok) {
        toast.success(
          initialData ? "Discount code updated" : "Discount code created"
        );
        router.push("/admin/discounts");
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to save discount code");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {initialData ? "Edit Discount Code" : "New Discount Code"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="KSU2024"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Value {form.watch("type") === "PERCENTAGE" ? "(%)" : "(SAR)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (English)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="King Saud University - 20% Off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Arabic)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="جامعة الملك سعود - خصم ٢٠٪"
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="validFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Quantity (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum vouchers required to use this code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Uses (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty for unlimited uses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="universityRestriction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University Restriction (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="King Saud University"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Restrict this code to a specific university
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update" : "Create"} Discount Code
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
