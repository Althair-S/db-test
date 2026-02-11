import { auth } from "@/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Selamat Datang, {session.user.name}!
        </h1>
        <p className="text-gray-600">
          Role:{" "}
          <span className="font-semibold capitalize">{session.user.role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {session.user.role === "user" && (
          <>
            <Link
              href="/dashboard/purchase-requests"
              className="bg-linear-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-2">My Purchase Requests</h2>
              <p className="text-blue-100">Lihat dan kelola PR Anda</p>
            </Link>
            <Link
              href="/dashboard/purchase-requests/new"
              className="bg-linear-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-2">Buat PR Baru</h2>
              <p className="text-green-100">Ajukan purchase request baru</p>
            </Link>
          </>
        )}

        {session.user.role === "finance" && (
          <Link
            href="/dashboard/purchase-requests"
            className="bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <h2 className="text-xl font-bold mb-2">Review Purchase Requests</h2>
            <p className="text-purple-100">Approve atau reject PR</p>
          </Link>
        )}

        {session.user.role === "admin" && (
          <>
            <Link
              href="/dashboard/purchase-requests"
              className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-2">All Purchase Requests</h2>
              <p className="text-indigo-100">Lihat semua PR</p>
            </Link>
            <Link
              href="/dashboard/users"
              className="bg-linear-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <h2 className="text-xl font-bold mb-2">Manage Users</h2>
              <p className="text-orange-100">Kelola user dan role</p>
            </Link>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Informasi Sistem
        </h2>
        <div className="space-y-2 text-gray-600">
          <p>
            <span className="font-semibold">User:</span> Dapat membuat, melihat,
            edit, dan delete PR (hanya yang pending)
          </p>
          <p>
            <span className="font-semibold">Finance:</span> Dapat melihat semua
            PR dan mengubah status (approve/reject)
          </p>
          <p>
            <span className="font-semibold">Admin:</span> Dapat mengelola user
            dan melihat semua PR
          </p>
        </div>
      </div>
    </div>
  );
}
