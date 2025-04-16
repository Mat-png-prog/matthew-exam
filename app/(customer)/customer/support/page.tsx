'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supportMessageSchema, SupportMessageSchema } from './validations';

// The most secure and performant way is to get the real user data from the server/session.
// This example assumes you have a getUser() in your root-level auth.ts that fetches the real session user info.
// Do NOT trust any customer information from the browser or local state.
// You should pass the real user info to this page as props from a server component (recommended).

type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
};

interface SupportPageProps {
  user: UserInfo;
}

export default function SupportPage({ user }: SupportPageProps) {
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupportMessageSchema>({
    resolver: zodResolver(supportMessageSchema),
  });

  const onSubmit = async (data: SupportMessageSchema) => {
    setSent(false);
    console.log("Submitting support message:", data);
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('message', data.message);

    try {
      const response = await fetch('/customer/support/submit', {
        method: 'POST',
        body: formData,
      });
      console.log("Server response:", response);
      if (response.ok) {
        setSent(true);
        reset();
        console.log("Message sent successfully.");
      } else {
        const errorText = await response.text();
        console.error("Failed to send message:", errorText);
      }
    } catch (err) {
      console.error("Exception sending message:", err);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-semibold">First Name</label>
          <input value={user.firstName} readOnly className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-semibold">Last Name</label>
          <input value={user.lastName} readOnly className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-semibold">Email</label>
          <input value={user.email} readOnly className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block font-semibold">Title</label>
          <input {...register('title')} className="input input-bordered w-full" />
          {errors.title && <span className="text-red-600">{errors.title.message}</span>}
        </div>
        <div>
          <label className="block font-semibold">Message</label>
          <textarea {...register('message')} rows={6} className="textarea textarea-bordered w-full" />
          {errors.message && <span className="text-red-600">{errors.message.message}</span>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
        {sent && <p className="text-green-600 mt-4">Message sent!</p>}
      </form>
    </div>
  );
}