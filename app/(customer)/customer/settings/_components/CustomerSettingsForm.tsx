//app/(customer)/customer/settings/_components/CustomerSettingsForm.tsx

"use client"; // Indicates this is a Client Component that uses client-side features

import { useState, useEffect } from "react"; // Import for managing loading state and side effects
import { useForm } from "react-hook-form"; // Import for form handling and validation
import { zodResolver } from "@hookform/resolvers/zod"; // Import for zod schema validation
import { User } from "@prisma/client"; // Import Prisma User type
import { toast } from "sonner"; // Import for toast notifications

// Import UI components from shadcn/ui
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { personalInfoSchema, PersonalInfoFormValues } from "../validations"; // Import validation schema
import { updatePersonalInfo } from "../_actions/settings"; // Import server action
import { Separator } from "@/components/ui/separator"; // Import separator component
import Loading from "@/components/(spinner)/Loading"; // Import loading spinner component

// Define props interface for the component
interface UserSettingsFormProps {
  user: User; // Requires a User object from Prisma
}

export function UserSettingsForm({ user }: UserSettingsFormProps) {
  // State to track loading status during form submission
  const [isLoading, setIsLoading] = useState(false);

  // Initialize react-hook-form with zod validation
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema), // Connect zod schema for validation
    defaultValues: {
      // Set default form values from user object
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
    },
  });

  // Console log the user data that's exposed to the browser
  useEffect(() => {
    console.log("User data loaded in form:", {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      streetAddress: user.streetAddress,
      suburb: user.suburb,
      townCity: user.townCity,
      postcode: user.postcode,
      country: user.country,
    });
  }, [user]);

  // Form submission handler
  async function onSubmit(values: PersonalInfoFormValues) {
    // Log the submitted values
    console.log("Form values submitted:", values);
    
    // Set loading state to true during submission
    setIsLoading(true);
    
    try {
      // Call the server action to update personal info
      const result = await updatePersonalInfo(user.id, values);
      
      // Log the result from the server
      console.log("Update result:", result);
      
      // Show success or error toast based on result
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      // Handle any errors during submission
      toast.error("Something went wrong. Please try again.");
      console.error("Form submission error:", error);
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  }

  // Log form state changes for debugging
  useEffect(() => {
    console.log("Form state:", {
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      errors: form.formState.errors,
    });
  }, [form.formState]);

  return (
    <Card className="border-none shadow-none">
      {/* Enhanced header with increased visibility across themes */}
      <CardHeader className="bg-muted/50 dark:bg-muted/20 rounded-t-lg p-6">
        <CardTitle className="text-xl font-bold text-primary">Personal Information</CardTitle>
        <CardDescription className="text-foreground/80 mt-2 text-base">
          Update your personal information and address details.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal information section */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Username</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={(e) => {
                        field.onChange(e);
                        console.log("Username changed:", e.target.value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" onChange={(e) => {
                        field.onChange(e);
                        console.log("Email changed:", e.target.value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">First name</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={(e) => {
                        field.onChange(e);
                        console.log("First name changed:", e.target.value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Last name</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={(e) => {
                        field.onChange(e);
                        console.log("Last name changed:", e.target.value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Display name</FormLabel>
                    <FormControl>
                      <Input {...field} onChange={(e) => {
                        field.onChange(e);
                        console.log("Display name changed:", e.target.value);
                      }} />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed to other users.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Phone number</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" onChange={(e) => {
                        field.onChange(e);
                        console.log("Phone number changed:", e.target.value);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Separator between personal and address information */}
            <Separator className="my-5" />
            
            {/* Address information section with enhanced visibility */}
            <div>
              <h3 className="mb-4 text-lg font-medium text-primary bg-muted/30 dark:bg-muted/10 p-2 rounded-md">Address Information</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Street address</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => {
                          field.onChange(e);
                          console.log("Street address changed:", e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="suburb"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Suburb</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => {
                          field.onChange(e);
                          console.log("Suburb changed:", e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="townCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Town/City</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => {
                          field.onChange(e);
                          console.log("Town/City changed:", e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="postcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Postcode/ZIP</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => {
                          field.onChange(e);
                          console.log("Postcode changed:", e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="font-medium">Country</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => {
                          field.onChange(e);
                          console.log("Country changed:", e.target.value);
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full sm:w-auto" 
              disabled={isLoading}
              onClick={() => console.log("Save button clicked")}
            >
              {isLoading ? (
                <>
                  <Loading />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}