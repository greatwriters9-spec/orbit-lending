"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, ChevronDown, MessageSquare, Search, User } from "lucide-react";

import { SignOutMenuItem } from "@/components/auth/sign-out-menu-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui-kit/avatar";
import { Button } from "@/components/ui-kit/button";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui-kit/dropdown-menu";
import { Input } from "@/components/ui-kit/input";
import { RoleBadge } from "@/components/ui-kit/role-badge";
import { Separator } from "@/components/ui-kit/separator";
import { getMessagesRouteForRole } from "@/lib/auth/navigation";
import { cn } from "@/lib/utils";
import type { DashboardUser } from "@/types/auth";

type TopNavigationProps = {
  className?: string;
  mobileMenu?: ReactNode;
  user: DashboardUser;
  unreadNotifications?: number;
  unreadMessages?: number;
  notificationsHref?: string;
};

function formatNavDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function TopNavigation({
  className,
  mobileMenu,
  user,
  unreadNotifications = 0,
  unreadMessages = 0,
  notificationsHref = "/dashboard/notifications",
}: TopNavigationProps) {
  const now = new Date();
  const today = formatNavDate(now);
  const greeting = formatGreeting(now);
  const messagesHref = getMessagesRouteForRole(user.roleKey);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between gap-4 border-b border-brand-border bg-white/95 px-4 backdrop-blur-sm md:px-8",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
        {mobileMenu}
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold text-brand-navy">
            {today}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {greeting}, {user.firstName}
          </p>
        </div>
        <div className="relative hidden w-full max-w-md xl:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            type="search"
            placeholder="Search loans, transactions, documents..."
            className="h-10 border-brand-border bg-brand-background pl-10 text-sm shadow-none focus-visible:border-brand-blue/40 focus-visible:ring-brand-blue/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NavIconLink
          href={messagesHref}
          label="Messages"
          unreadCount={unreadMessages}
          icon={MessageSquare}
          accent="blue"
        />

        <NavIconLink
          href={notificationsHref}
          label="Notifications"
          unreadCount={unreadNotifications}
          icon={Bell}
          accent="amber"
        />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-8 md:block"
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-10 gap-2.5 px-2 hover:bg-brand-background"
              />
            }
          >
            <Avatar className="size-8 ring-2 ring-brand-border/60">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-brand-navy text-xs font-semibold text-white">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-none text-brand-navy">
                {user.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{user.role}</p>
            </div>
            <ChevronDown
              className="hidden size-4 text-muted-foreground md:block"
              strokeWidth={1.75}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="space-y-2">
                <p className="truncate text-sm font-medium normal-case">
                  {user.email}
                </p>
                <RoleBadge role={user.roleKey} label={user.role} />
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href={user.profileHref} />}>
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={messagesHref} />}>
              <MessageSquare className="size-4" />
              Messages
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={notificationsHref} />}>
              <Bell className="size-4" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

type NavIconLinkProps = {
  href: string;
  label: string;
  unreadCount: number;
  icon: typeof MessageSquare;
  accent: "blue" | "amber";
};

function NavIconLink({
  href,
  label,
  unreadCount,
  icon: Icon,
  accent,
}: NavIconLinkProps) {
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      aria-label={
        hasUnread ? `${label}, ${unreadCount} unread` : label
      }
      className={cn(
        "group relative flex size-11 items-center justify-center rounded-xl border transition-all duration-200",
        "bg-brand-background/70 shadow-sm",
        accent === "blue"
          ? "border-brand-border/80 text-brand-navy/70 hover:border-brand-blue/35 hover:bg-white hover:text-brand-blue hover:shadow-md"
          : "border-brand-border/80 text-brand-navy/70 hover:border-brand-warning/40 hover:bg-white hover:text-brand-warning hover:shadow-md",
        hasUnread &&
          (accent === "blue"
            ? "border-brand-blue/25 bg-brand-blue/[0.06] text-brand-blue"
            : "border-brand-warning/30 bg-brand-warning/[0.08] text-brand-warning"),
      )}
    >
      <Icon
        className="size-[22px] transition-transform duration-200 group-hover:scale-105"
        strokeWidth={2}
      />
      {hasUnread ? (
        <span
          className={cn(
            "absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-sm ring-2 ring-white",
            accent === "blue" ? "bg-brand-blue" : "bg-brand-warning",
          )}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
