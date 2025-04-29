"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RoutingHubPage() {
  return (
    <div className="mt-[20vh] container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-12">Routing Hub</h1>

      <div className="flex flex-col sm:flex-row justify-evenly gap-6 w-full max-w-3xl mx-auto">
        <Button asChild variant="default" className="w-full sm:w-auto px-8 py-6 text-left" size="lg">
          <Link href="/admin">
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Admin</span>
              <span className="text-sm text-muted-foreground">Click to go to admin route</span>
            </div>
          </Link>
        </Button>

        <Button asChild variant="default" className="w-full sm:w-auto px-8 py-6 text-left" size="lg">
          <Link href="/">
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Home</span>
              <span className="text-sm text-muted-foreground">Click to go to home route</span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  )
}
