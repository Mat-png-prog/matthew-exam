//app/(customer)/customer/settings/_components/CheckoutSettingsForm.tsx

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkoutDetailsSchema, CheckoutDetailsFormValues } from ".././validations";
/* import { updateCheckoutDetails } from "../_actions/settings"; */
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loading from "@/components/(spinner)/Loading";

interface CheckoutSettingsFormProps {
  user: User;
}

export function CheckoutSettingsForm({ user }: CheckoutSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Default values would normally come from a database
  const form = useForm<CheckoutDetailsFormValues>({
    resolver: zodResolver(checkoutDetailsSchema),
    defaultValues: {
      defaultShippingMethod: "standard",
      savePaymentInfo: false,
    },
  });

  async function onSubmit(values: CheckoutDetailsFormValues) {
    setIsLoading(true);
    
    try {
      const result = await updateCheckoutDetails(user.id, values);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader>
        <CardTitle>Checkout Preferences</CardTitle>
        <CardDescription>
          Configure your checkout experience to speed up purchases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <Loading />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="defaultShippingMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Default Shipping Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="standard" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Standard Shipping (3-5 business days)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="express" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Express Shipping (1-2 business days)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="overnight" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Overnight Shipping (Next business day)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="savePaymentInfo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Save Payment Information
                    </FormLabel>
                    <FormDescription>
                      Securely save your payment methods for faster checkout.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading && < Loading/>}
              Save preferences
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}