"use client";

import { useState } from "react";
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
import { Loader2, DollarSign, Building2 } from "lucide-react";

const settingsSchema = z.object({
  voucherBasePrice: z.string().min(1),
  vatPercentage: z.string().min(1),
  companyNameEn: z.string().min(1),
  companyNameAr: z.string().min(1),
  companyVatNumber: z.string(),
  companyCrNumber: z.string(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: {
    voucherBasePrice: string;
    vatPercentage: string;
    companyNameEn: string;
    companyNameAr: string;
    companyVatNumber: string;
    companyCrNumber: string;
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucher_base_price: data.voucherBasePrice,
          vat_percentage: data.vatPercentage,
          company_name_en: data.companyNameEn,
          company_name_ar: data.companyNameAr,
          company_vat_number: data.companyVatNumber,
          company_cr_number: data.companyCrNumber,
        }),
      });

      if (response.ok) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="voucherBasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Voucher Price (SAR)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      The base price for a single CompTIA Security+ voucher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vatPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Value Added Tax percentage (KSA standard is 15%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Company Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (English)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyNameAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input dir="rtl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyVatNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 300000000000003" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your ZATCA VAT registration number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyCrNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commercial Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1010000000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your Saudi CR number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </form>
      </Form>
    </div>
  );
}
