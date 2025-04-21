//app/(customer)/customer/settings/_components/CheckoutSettingsForm.tsx

"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { orderUpdateSchema } from "../validations";
import { updateOrCreateOrder } from "../_actions/settings"; // CHANGE: use new action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import type { OrderData, OrderUpdateFormValues } from "../types";
import { useTheme } from "next-themes";

interface OrderSettingsFormProps {
  order?: OrderData;    // Make order optional for insert flow
  userId: string;
}

export function OrderSettingsForm({ order, userId }: OrderSettingsFormProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();

  const form = useForm<OrderUpdateFormValues>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      Branch: order?.Branch ?? "",
      methodOfCollection: order?.methodOfCollection ?? "",
      salesRep: order?.salesRep ?? "",
      referenceNumber: order?.referenceNumber ?? "",
      firstName: order?.firstName ?? "",
      lastName: order?.lastName ?? "",
      companyName: order?.companyName ?? "",
      countryRegion: order?.countryRegion ?? "",
      streetAddress: order?.streetAddress ?? "",
      apartmentSuite: order?.apartmentSuite ?? "",
      townCity: order?.townCity ?? "",
      province: order?.province ?? "",
      postcode: order?.postcode ?? "",
      phone: order?.phone ?? "",
      email: order?.email ?? "",
      orderNotes: order?.orderNotes ?? "",
      agreeTerms: order?.agreeTerms ?? false,
      receiveEmailReviews: order?.receiveEmailReviews ?? false,
    },
  });

  const onSubmit = useCallback(async (values: OrderUpdateFormValues) => {
    setIsLoading(true);
    setLogs([]);
    try {
      // Pass orderId only if it exists, else undefined/null for insert
      const result = await updateOrCreateOrder(order?.id, values, userId);
      setLogs(result.logs ?? []);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Order submit error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [order?.id, userId]);

  // ... (renderTextField and renderCheckboxField are unchanged)
  const renderTextField = useCallback(({
    name,
    label,
    placeholder,
    type = "text",
    component: Component = Input,
  }: {
    name: keyof OrderUpdateFormValues;
    label: string;
    placeholder: string;
    type?: string;
    component?: typeof Input | typeof Textarea;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Component 
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={isLoading}
              className={Component === Textarea ? "min-h-[100px]" : ""}
              value={field.value as string}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ), [form.control, isLoading]);

  const renderCheckboxField = useCallback(({
    name,
    label,
  }: {
    name: 'agreeTerms' | 'receiveEmailReviews';
    label: string;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center space-x-2">
          <FormControl>
            <Checkbox
              checked={field.value as boolean}
              onCheckedChange={field.onChange}
              disabled={isLoading}
            />
          </FormControl>
          <FormLabel>{label}</FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
  ), [form.control, isLoading]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* ...REMAINDER OF FORM FIELDS ARE UNCHANGED... */}
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Order Details</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {renderTextField({ name: "Branch", label: "Branch", placeholder: "Branch" })}
            {renderTextField({ name: "methodOfCollection", label: "Method of Collection", placeholder: "Method of Collection" })}
            {renderTextField({ name: "salesRep", label: "Sales Representative", placeholder: "Sales Representative" })}
            {renderTextField({ name: "referenceNumber", label: "Reference Number", placeholder: "Reference Number" })}
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Personal Details</h3>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {renderTextField({ name: "firstName", label: "First Name", placeholder: "First Name" })}
            {renderTextField({ name: "lastName", label: "Last Name", placeholder: "Last Name" })}
            {renderTextField({ name: "companyName", label: "Company Name", placeholder: "Company Name" })}
            {renderTextField({ name: "countryRegion", label: "Country/Region", placeholder: "Country/Region" })}
            {renderTextField({ name: "streetAddress", label: "Street Address", placeholder: "Street Address" })}
            {renderTextField({ name: "apartmentSuite", label: "Apartment/Suite", placeholder: "Apartment/Suite" })}
            {renderTextField({ name: "townCity", label: "Town/City", placeholder: "Town/City" })}
            {renderTextField({ name: "province", label: "Province", placeholder: "Province" })}
            {renderTextField({ name: "postcode", label: "Postcode", placeholder: "Postcode" })}
            {renderTextField({ name: "phone", label: "Phone", placeholder: "Phone" })}
            {renderTextField({ name: "email", label: "Email", placeholder: "Email", type: "email" })}
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Additional Information</h3>
          {renderTextField({
            name: "orderNotes",
            label: "Order Notes",
            placeholder: "Enter any additional notes here...",
            component: Textarea
          })}
        </div>
        <div className="p-4 bg-card rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Preferences</h3>
          <div className="space-y-4">
            {renderCheckboxField({ name: "agreeTerms", label: "I agree to the terms and conditions" })}
            {renderCheckboxField({ name: "receiveEmailReviews", label: "Receive email reviews" })}
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isLoading ? (order?.id ? "Updating..." : "Saving...") : (order?.id ? "Update Order" : "Save Order")}
          </Button>
        </div>
        {logs.length > 0 && (
          <div className="mt-4 bg-card p-4 rounded-lg border border-border">
            <h3 className="font-semibold mb-2 text-foreground">Process Logs</h3>
            <ul className="space-y-1 text-sm text-foreground overflow-auto max-h-[200px]">
              {logs.map((log, idx) => (
                <li key={idx} className="break-words">{log}</li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </Form>
  );
}