"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVendorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    accountNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/dashboard/vendors");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create vendor");
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      setError("Failed to create vendor");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Add New Vendor</h1>
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Vendor / Supplier <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: CV Abadi Jaya atau PT Sejahtera"
            />
            <p className="mt-1 text-xs text-gray-500">
              Masukkan nama lengkap vendor atau supplier yang akan dibayar
            </p>
          </div>

          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Bank <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: BCA, Mandiri, BNI, BRI"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bank tempat rekening vendor terdaftar
            </p>
          </div>

          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nomor Rekening <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Contoh: 1234567890"
            />
            <p className="mt-1 text-xs text-gray-500">
              Nomor rekening vendor untuk transfer pembayaran
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Vendor"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
