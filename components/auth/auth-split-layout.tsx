import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  className?: string;
  formPanel: ReactNode;
  trustPanel?: ReactNode;
};

export function AuthSplitLayout({ className, formPanel }: AuthSplitLayoutProps) {
  return <div className={className}>{formPanel}</div>;
}
