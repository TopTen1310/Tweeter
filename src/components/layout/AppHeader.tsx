import { Navbar, Dropdown, Avatar, Button } from "flowbite-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Dispatch, SetStateAction } from "react";

interface Props {
  setToggleModal: Dispatch<SetStateAction<boolean>>;
}

export default function AppHeader({ setToggleModal }: Props) {
  const { data: sessionData } = useSession();
  const router = useRouter();

  return (
    <header className="AppHeader w-full bg-white">
      <Navbar fluid={true} className="mx-auto max-w-[90rem]">
        <Link href="/">
          <img
            src="/images/tweeter.svg"
            className="h-6 sm:h-9"
            alt="app Logo"
          />
        </Link>
        <div className="flex md:order-2">
          {sessionData ? (
            <Dropdown
              arrowIcon={false}
              inline={true}
              label={
                <Avatar
                  alt="User settings"
                  img={
                    sessionData.user.image ||
                    "https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                  }
                  rounded={true}
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{sessionData.user.name}</span>
                <span className="block truncate text-sm font-medium">
                  {sessionData.user.email}
                </span>
              </Dropdown.Header>
              <Link href={`/profile/${sessionData.user.id}`}>
                <Dropdown.Item>Profile</Dropdown.Item>
              </Link>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => void signOut()}>
                Sign out
              </Dropdown.Item>
            </Dropdown>
          ) : (
            <Button onClick={() => setToggleModal(true)}>Login</Button>
          )}
          <Navbar.Toggle />
        </div>
        <Navbar.Collapse>
          <Link href="/">
            <span
              className={`cursor-pointer text-sm ${
                router.pathname === "/"
                  ? "text-blue-500"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              Home
            </span>
          </Link>
          <Link href="/explore">
            <span
              className={`cursor-pointer text-sm ${
                router.pathname === "/explore"
                  ? "text-blue-500"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              Explore
            </span>
          </Link>
          <Link href="/bookmarks">
            <span
              className={`cursor-pointer text-sm ${
                router.pathname === "/bookmarks"
                  ? "text-blue-500"
                  : "text-gray-700 hover:text-blue-500"
              }`}
            >
              Bookmarks
            </span>
          </Link>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
}
