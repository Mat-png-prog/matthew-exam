"use client";

import { useState, useTransition } from "react";
import { createSupportMessage } from "@/app/_actions/support";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  SupportMessagePriority, 
  supportMessageSchema,
  type SupportMessageSchema 
} from "@/types/support";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface SupportFormProps {
  user: {
    displayName: string;
    maskedEmail: string;
    sessionId: string;
  };
}

export function SupportForm({ user }: SupportFormProps) {
  // Use React useTransition for better loading states
  const [isPending, startTransition] = useTransition();
  
  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportMessageSchema>({
    resolver: zodResolver(supportMessageSchema),
    defaultValues: {
      priority: SupportMessagePriority.LOW,
    },
  });

  // Handle form submission with proper type safety
  const onSubmit = handleSubmit(async (data: SupportMessageSchema) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    startTransition(async () => {
      try {
        const result = await createSupportMessage(formData);

        if (result.success) {
          toast.success("Message sent successfully!", {
            description: "We'll get back to you as soon as possible.",
          });
          // Reset form with react-hook-form
          reset();
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        toast.error("Failed to send message", {
          description: "Please try again later.",
        });
        console.error("Support form submission error:", error);
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Contact Support</h2>
        <p className="text-muted-foreground">
          We typically respond within 24 hours during business days.
        </p>
      </div>

      <div className="grid gap-4 p-4 border rounded-lg bg-card">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={user.displayName}
            readOnly
            aria-label="User name"
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={user.maskedEmail}
            readOnly
            aria-label="User email"
            className="bg-muted"
          />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            aria-describedby="title-error"
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p id="title-error" className="text-sm text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            {...register("priority")} 
            defaultValue={SupportMessagePriority.LOW}
          >
            <SelectTrigger aria-label="Select priority level">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SupportMessagePriority).map((priority) => (
                <SelectItem 
                  key={priority} 
                  value={priority}
                  aria-label={`Priority ${priority.toLowerCase()}`}
                >
                  {priority.charAt(0) + priority.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-destructive">
              {errors.priority.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            {...register("message")}
            className="min-h-[150px] resize-y"
            aria-describedby="message-error"
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <p id="message-error" className="text-sm text-destructive">
              {errors.message.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-label={isPending ? "Sending message..." : "Send message"}
        >
          {isPending ? (
            <div className="flex items-center gap-2">
              <div 
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden="true"
              />
              Sending...
            </div>
          ) : (
            "Send Message"
          )}
        </Button>
      </form>
    </div>
  );
}