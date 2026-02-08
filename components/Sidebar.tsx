"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      roles: ["admin", "finance", "user"],
    },
    {
      name: "My PRs",
      href: "/dashboard/purchase-requests",
      icon: DocumentTextIcon,
      roles: ["user"],
    },
    {
      name: "Review Requests",
      href: "/dashboard/purchase-requests",
      icon: ClipboardDocumentCheckIcon,
      roles: ["finance"],
    },
    {
      name: "All Requests",
      href: "/dashboard/purchase-requests",
      icon: DocumentTextIcon,
      roles: ["admin"],
    },
    {
      name: "Manage Users",
      href: "/dashboard/users",
      icon: UsersIcon,
      roles: ["admin"],
    },
  ];

  const filteredNav = navigation.filter((item) =>
    item.roles.includes(session?.user?.role || ""),
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-indigo-900 to-indigo-800 text-white
          transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-64 flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-indigo-700">
          <h1 className="text-2xl font-bold">PR System</h1>
          <p className="text-indigo-300 text-sm mt-1">
            {session?.user?.role?.toUpperCase()}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                  ${
                    isActive(item.href)
                      ? "bg-indigo-700 text-white shadow-lg"
                      : "text-indigo-200 hover:bg-indigo-700/50 hover:text-white"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-indigo-700">
          <div className="mb-3 px-4 py-2 bg-indigo-700/50 rounded-lg">
            <p className="text-sm text-indigo-300">Logged in as</p>
            <p className="font-semibold truncate">{session?.user?.name}</p>
            <p className="text-xs text-indigo-300 truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
