"use client";

import { SignInButton, SignUpButton, UserButton, OrganizationSwitcher, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Header() {
  return (
    <header style={{ display: "flex", gap: 12, padding: 16, alignItems: "center" }}>
      <strong>Dial Hanna</strong>
      <span style={{ flex: 1 }} />
      <SignedOut>
        <SignInButton mode="modal" />
        <SignUpButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <OrganizationSwitcher />
        <UserButton />
      </SignedIn>
    </header>
  );
}
