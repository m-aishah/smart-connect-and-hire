import Link from "next/link";
import Image from "next/image";
import { BadgePlus, LogOut, Search, UserPlus, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSession, signOut } from "@/lib/actions/auth";

const Navbar = async () => {
  const session = await getSession();

  return (
    <header className="px-5 py-3 bg-white shadow-sm font-work-sans">
      <nav className="flex justify-between items-center">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="logo"
            width={143}
            height={30}
            className="h-8 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-5">
          {/* Search Icon - shown to all users */}
          {/* <Link href="/search" className="text-black-100">
            <Search className="size-6" />
          </Link> */}

          {session ? (
            // Logged in state
            <>
              {/* Create link - only shown to service providers */}
              {session.userType === "provider" && (
                <Link
                  href="/service/create"
                  className="font-semibold text-black-100"
                >
                  <span className="max-sm:hidden">Create</span>
                  <BadgePlus className="size-6 sm:hidden" />
                </Link>
              )}

              {/* Logout Form */}
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
                className="font-semibold text-red-500 cursor-pointer"
              >
                <button type="submit">
                  <span className="max-sm:hidden">Logout</span>
                  <LogOut className="size-6 sm:hidden text-red-500" />
                </button>
              </form>

              {/* User Profile Link */}
              <Link href={`/user/${session.id}`} className="avatar">
                <Avatar className="size-10">
                  <AvatarImage
                    src={session.image || ""}
                    alt={session.name || ""}
                  />
                  <AvatarFallback>
                    {session.name
                      ? session.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .substring(0, 2)
                      : "UN"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : (
            // Logged out state - Show Sign Up and Sign In buttons
            <>
              <Link href="/auth/signin">
                <Button variant="outline" className="font-medium border-purple-200 text-purple-700 rounded-xl">
                  <LogIn className="size-5 mr-2" />
                  <span className="max-sm:hidden">Sign In</span>
                </Button>
              </Link>
              
              <Link href="/auth/signup">
                <Button className="bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-xl">
                  <UserPlus className="size-5 mr-2" />
                  <span className="max-sm:hidden">Sign Up</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;