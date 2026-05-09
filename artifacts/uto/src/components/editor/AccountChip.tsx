import { useUser, useClerk, Show } from "@clerk/react";
import { useLocation } from "wouter";
import { LogOut, UserCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string | null, email?: string | null) {
  const src = (name || email || "").trim();
  if (!src) return "·";
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  return src.charAt(0).toUpperCase();
}

export function AccountChip() {
  const [, setLocation] = useLocation();

  return (
    <>
      <Show when="signed-out">
        <button
          type="button"
          onClick={() => setLocation("/sign-in")}
          className="h-8 px-2.5 rounded-md flex items-center gap-1.5 text-[12px] font-medium text-foreground/85 hover:bg-foreground/[.05] hover:text-foreground transition-colors"
          data-testid="button-signin"
        >
          <UserCircle2 size={15} strokeWidth={1.6} />
          Sign in
        </button>
      </Show>
      <Show when="signed-in">
        <SignedInChip />
      </Show>
    </>
  );
}

function SignedInChip() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();

  const name =
    user?.fullName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const avatar = user?.imageUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="h-8 pl-1 pr-2 rounded-md flex items-center gap-1.5 hover:bg-foreground/[.05] transition-colors"
          data-testid="account-chip"
        >
          {avatar ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={avatar}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground text-[10.5px] font-semibold flex items-center justify-center">
              {initials(name, email)}
            </div>
          )}
          <span className="text-[12px] font-medium text-[#716e6e] max-w-[120px] truncate">
            {name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] p-1.5">
        <DropdownMenuLabel className="px-2.5 py-1.5">
          <div className="text-[12.5px] font-medium text-[#716e6e] truncate">
            {name}
          </div>
          {email && email !== name ? (
            <div className="text-[10.5px] text-muted-foreground truncate">
              {email}
            </div>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => signOut(() => setLocation("/"))}
          className="text-[12.5px] gap-2 text-[#716e6e]"
          data-testid="button-signout"
        >
          <LogOut size={13} strokeWidth={1.7} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
