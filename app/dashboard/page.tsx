import { auth } from "@/auth";
import Link from "next/link";
import {
  DocumentTextIcon,
  PlusCircleIcon,
  ClipboardDocumentCheckIcon,
  UsersIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-gray-500">
          Role:{" "}
          <span className="font-semibold capitalize text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            {session.user.role}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {session.user.role === "user" && (
          <>
            <Link
              href="/dashboard/purchase-requests"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                My Purchase Requests
              </h2>
              <p className="text-gray-500 text-sm">Lihat dan kelola PR Anda</p>
            </Link>
            <Link
              href="/dashboard/purchase-requests/new"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors duration-200">
                <PlusCircleIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Buat PR Baru
              </h2>
              <p className="text-gray-500 text-sm">
                Ajukan purchase request baru
              </p>
            </Link>
            <Link
              href="/dashboard/cash-requests"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                My Cash Requests
              </h2>
              <p className="text-gray-500 text-sm">Lihat dan kelola CR Anda</p>
            </Link>
            <Link
              href="/dashboard/cash-requests/new"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                <PlusCircleIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Buat CR Baru
              </h2>
              <p className="text-gray-500 text-sm">Ajukan Cash Request baru</p>
            </Link>
          </>
        )}

        {session.user.role === "finance" && (
          <>
            <Link
              href="/dashboard/purchase-requests"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
                <ClipboardDocumentCheckIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Review Purchase Requests
              </h2>
              <p className="text-gray-500 text-sm">Approve atau reject PR</p>
            </Link>
            <Link
              href="/dashboard/cash-requests"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-fuchsia-100 text-fuchsia-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors duration-200">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Review Cash Requests
              </h2>
              <p className="text-gray-500 text-sm">Approve atau reject CR</p>
            </Link>
          </>
        )}

        {session.user.role === "admin" && (
          <>
            <Link
              href="/dashboard/purchase-requests"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <DocumentTextIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                All Purchase Requests
              </h2>
              <p className="text-gray-500 text-sm">Lihat semua PR</p>
            </Link>
            <Link
              href="/dashboard/cash-requests"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                All Cash Requests
              </h2>
              <p className="text-gray-500 text-sm">Lihat semua CR</p>
            </Link>
            <Link
              href="/dashboard/users"
              className="group bg-white border border-gray-200 p-6 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-200">
                <UsersIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Manage Users
              </h2>
              <p className="text-gray-500 text-sm">Kelola user dan role</p>
            </Link>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">
          Informasi Sistem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="font-semibold block text-gray-900 mb-1">User</span>
            <p className="text-gray-600">
              Dapat membuat, melihat, edit, dan delete PR/CR (hanya yang
              pending)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="font-semibold block text-gray-900 mb-1">
              Finance
            </span>
            <p className="text-gray-600">
              Dapat melihat semua PR/CR dan mengubah status (approve/reject)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <span className="font-semibold block text-gray-900 mb-1">
              Admin
            </span>
            <p className="text-gray-600">
              Dapat mengelola user dan melihat semua PR/CR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
