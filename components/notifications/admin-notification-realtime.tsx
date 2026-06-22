"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

import { cleanEnv } from "@/lib/env";

type AdminNotificationRealtimeProps = {
  initialCount: number;
  onCountChange?: (count: number) => void;
};

export function AdminNotificationRealtime({
  initialCount,
  onCountChange,
}: AdminNotificationRealtimeProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    onCountChange?.(count);
  }, [count, onCountChange]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const url = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const key = cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!url || !key) {
      return;
    }

    const supabase = createBrowserClient(url, key);

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
          filter: "channel=eq.in_app",
        },
        () => {
          setCount((current) => current + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "admin_notifications",
          filter: "channel=eq.in_app",
        },
        (payload) => {
          const next = payload.new as { read?: boolean };
          const previous = payload.old as { read?: boolean };
          if (previous?.read === false && next?.read === true) {
            setCount((current) => Math.max(0, current - 1));
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
