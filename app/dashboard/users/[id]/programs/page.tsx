"use client";

import { useState, useEffect } from "react";
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
}

interface UserProgramAccess {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  programAccess: Program[];
}

export default function UserProgramsPage({ params }: RouteParams) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");

  const [user, setUser] = useState<UserProgramAccess | null>(null);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.id);
      await Promise.all([
        fetchUserProgramAccess(resolvedParams.id),
        fetchAllPrograms(),
      ]);
    };
    loadData();
  }, [params]);

  const fetchUserProgramAccess = async (id: string) => {
    try {
      const response = await fetch(`/api/users/${id}/programs`);
      if (response.ok) {
        const data: UserProgramAccess = await response.json();
        setUser(data);
        setSelectedProgramIds(data.programAccess.map((p) => p._id));
      } else {
        setError("Gagal memuat data user");
      }
    } catch (err) {
      console.error("Error fetching user program access:", err);
      setError("Terjadi kesalahan saat memuat data user");
    }
  };

  const fetchAllPrograms = async () => {
    try {
      const response = await fetch("/api/programs?activeOnly=true");
      if (response.ok) {
        const data: Program[] = await response.json();
        setAllPrograms(data);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProgram = (programId: string) => {
    if (selectedProgramIds.includes(programId)) {
      setSelectedProgramIds(
        selectedProgramIds.filter((id) => id !== programId),
      );
    } else {
      setSelectedProgramIds([...selectedProgramIds, programId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/users/${userId}/programs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programIds: selectedProgramIds }),
      });

      if (response.ok) {
        router.push("/dashboard/users");
      } else {
        const data = await response.json();
        setError(data.error || "Gagal menyimpan program access");
      }
    } catch (err) {
      console.error("Error saving program access:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-red-600">User tidak ditemukan</div>;
  }

  const getRoleLabel = (role: string) => {
    if (role === "user") return "Program untuk Membuat PR";
    if (role === "finance") return "Program untuk Review PR";
    return "Program Access";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Kelola Program Access
      </h1>
      <p className="text-gray-600 mb-6">
        {user.userName} ({user.userEmail}) - {user.userRole.toUpperCase()}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {getRoleLabel(user.userRole)}
        </h2>

        {allPrograms.length === 0 ? (
          <p className="text-gray-500">Tidak ada program aktif</p>
        ) : (
          <div className="space-y-3">
            {allPrograms.map((program) => (
              <div
                key={program._id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  id={`program-${program._id}`}
                  checked={selectedProgramIds.includes(program._id)}
                  onChange={() => handleToggleProgram(program._id)}
                  className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label
                  htmlFor={`program-${program._id}`}
                  className="ml-4 flex-1 cursor-pointer"
                >
                  <div className="font-semibold text-gray-900">
                    {program.name}
                    <span className="ml-2 text-sm font-mono text-gray-500">
                      ({program.code})
                    </span>
                  </div>
                  {program.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {program.description}
                    </div>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedProgramIds.length} program dipilih
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Menyimpan..." : "Simpan Program Access"}
        </button>
      </div>
    </div>
  );
}
