//app/(customer)/_components/(sidebar)/CustomerEditForm.tsx
"use client";

import { useState } from "react";
import { User, CustomerTier } from "./types";
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
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CustomerEditFormProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  streetAddress: z.string().optional(),
  suburb: z.string().optional(),
  townCity: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  // Read-only fields
  username: z.string().optional(),
  id: z.string(),
  role: z.string().optional(),
});

export default function CustomerEditForm({ 
  user, 
  onUpdate, 
  onCancel 
}: CustomerEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with user data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: user.id,
      username: user.username || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      displayName: user.displayName || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      streetAddress: user.streetAddress || "",
      suburb: user.suburb || "",
      townCity: user.townCity || "",
      postcode: user.postcode || "",
      country: user.country || "",
      role: user.role || "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Here you would normally submit to backend
      // For now we just update the local state
      onUpdate({
        ...user,
        ...data,
        // Preserve these values
        avatarUrl: user.avatarUrl,
        backgroundUrl: user.backgroundUrl,
      });
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-xl font-medium text-center mb-4">Edit Profile</div>

        {/* Account Information - Read Only */}
        <Card className="border border-border">
          <CardContent className="pt-4 space-y-4">
            <h3 className="text-md font-medium text-foreground">Account Information</h3>
            <Separator />
            
            {/* Username - Read Only */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted" />
                  </FormControl>
                  <FormDescription>Username cannot be changed</FormDescription>
                </FormItem>
              )}
            />
            
            {/* Role/Tier - Read Only */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <FormControl>
                    <Input {...field} disabled className="bg-muted capitalize" />
                  </FormControl>
                  <FormDescription>Account type can only be changed by an admin</FormDescription>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Personal Information - Editable */}
        <Card className="border border-border">
          <CardContent className="pt-4 space-y-4">
            <h3 className="text-md font-medium text-foreground">Personal Information</h3>
            <Separator />
            
            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="How you'll be seen by others" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your first name" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your last name" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Contact Information - Editable */}
        <Card className="border border-border">
          <CardContent className="pt-4 space-y-4">
            <h3 className="text-md font-medium text-foreground">Contact Information</h3>
            <Separator />
            
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="your@email.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Phone */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" placeholder="Your phone number" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Address Information - Editable */}
        <Card className="border border-border">
          <CardContent className="pt-4 space-y-4">
            <h3 className="text-md font-medium text-foreground">Address Information</h3>
            <Separator />
            
            {/* Street Address */}
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main St" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Suburb */}
            <FormField
              control={form.control}
              name="suburb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suburb</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your suburb" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* City */}
            <FormField
              control={form.control}
              name="townCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town/City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your city" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Postcode */}
            <FormField
              control={form.control}
              name="postcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postcode</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12345" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Country */}
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your country" />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}