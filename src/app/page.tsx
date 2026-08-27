"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { defaultLocale } from "@/i18n/config";

// Redirect root to default locale (client-side for static export)
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${defaultLocale}`);
  }, [router]);

  // Return a minimal loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}
