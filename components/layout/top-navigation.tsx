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
  homeHref?: string;
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
        "sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-brand-border bg-white px-4 md:px-8",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
        {mobileMenu}
        <div className="hidden min-w-0 lg:block">
          <p className="truncate text-sm font-semibold text-brand-navy">{today}</p>
          <p className="truncate text-sm text-muted-foreground">
            {greeting}, {user.firstName}
          </p>
        </div>
        <div className="relative hidden w-full max-w-xl xl:block">
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            type="search"
            placeholder="Search loans, transactions, documents..."
            className="h-11 rounded-xl border-brand-border bg-brand-background pl-11 text-sm shadow-none focus-visible:ring-brand-blue/25"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NavIconLink
          href={messagesHref}
          label="Messages"
          unreadCount={unreadMessages}
          icon={MessageSquare}
        />

        <NavIconLink
          href={notificationsHref}
          label="Notifications"
          unreadCount={unreadNotifications}
          icon={Bell}
        />

        <Separator
          orientation="vertical"
          className="mx-1 hidden h-8 bg-brand-border md:block"
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-11 gap-2.5 px-2 hover:bg-brand-background"
              />
            }
          >
            <Avatar className="size-9 ring-2 ring-brand-border">
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
};

function NavIconLink({ href, label, unreadCount, icon: Icon }: NavIconLinkProps) {
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      aria-label={hasUnread ? `${label}, ${unreadCount} unread` : label}
      className={cn(
        "group relative flex size-11 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-navy/70 transition-all duration-200",
        "hover:border-brand-blue/25 hover:bg-brand-background hover:text-brand-blue hover:shadow-sm",
        hasUnread && "border-brand-blue/20 bg-brand-blue/5 text-brand-blue",
      )}
    >
      <Icon
        className="size-5 transition-transform duration-200 group-hover:scale-105"
        strokeWidth={1.75}
      />
      {hasUnread ? (
        <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-brand-blue px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
