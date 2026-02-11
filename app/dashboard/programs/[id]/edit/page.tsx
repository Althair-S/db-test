"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

interface Program {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  prCounter: number;
}

export default function EditProgramPage({ params }: RouteParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [programId, setProgramId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [code, setCode] = useState("");
  const [prCounter, setPrCounter] = useState(0);

  useEffect(() => {
    const loadProgram = async () => {
      const resolvedParams = await params;
      setProgramId(resolvedParams.id);
      fetchProgram(resolvedParams.id);
    };
    loadProgram();
  }, [params]);

  const fetchProgram = async (id: string) => {
    try {
      const response = await fetch(`/api/programs/${id}`);
      if (response.ok) {
        const data: Program = await response.json();
        setName(data.name);
        setDescription(data.description);
        setIsActive(data.isActive);
        setCode(data.code);
        setPrCounter(data.prCounter);
      } else {
        setError("Program tidak ditemukan");
      }
    } catch {
      setError("Gagal memuat program");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          isActive,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/programs");
      } else {
        const data = await response.json();
        setError(data.error || "Gagal mengupdate program");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Program</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Code
            </label>
            <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
              {code}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Code tidak dapat diubah untuk menjaga konsistensi PR numbering
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current PR Counter
            </label>
            <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
              {prCounter}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Counter saat ini (read-only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
