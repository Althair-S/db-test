"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PRItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

interface Program {
  _id: string;
  name: string;
  code: string;
  description: string;
}

export default function NewPurchaseRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Section 1
  const [programId, setProgramId] = useState("");
  const [activityName, setActivityName] = useState("");
  const [department, setDepartment] = useState("");
  const [budgeted, setBudgeted] = useState(false);
  const [costingTo, setCostingTo] = useState("");
  const [prNumberPreview, setPrNumberPreview] = useState("");

  // Available programs
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  // Section 2 - Items
  const [items, setItems] = useState<PRItem[]>([
    { item: "", quantity: 1, unit: "", price: 0, totalPrice: 0 },
  ]);

  // Fetch accessible programs
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Update PR number preview when program changes
  useEffect(() => {
    if (programId) {
      const selectedProgram = programs.find((p) => p._id === programId);
      if (selectedProgram) {
        const currentYear = new Date().getFullYear();
        setPrNumberPreview(`${selectedProgram.code}-${currentYear}-XXXX`);
      }
    } else {
      setPrNumberPreview("");
    }
  }, [programId, programs]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs/accessible");
      if (response.ok) {
        const data = await response.json();
        setPrograms(data);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { item: "", quantity: 1, unit: "", price: 0, totalPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof PRItem,
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-calculate total price
    if (field === "quantity" || field === "price") {
      newItems[index].totalPrice =
        newItems[index].quantity * newItems[index].price;
    }

    setItems(newItems);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/purchase-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          activityName,
          department,
          budgeted,
          costingTo,
          items,
        }),
      });

      if (response.ok) {
        router.push("/dashboard/purchase-requests");
      } else {
        const data = await response.json();
        setError(data.error || "Gagal membuat purchase request");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Buat Purchase Request Baru
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Section 1 */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Section 1: Informasi Umum
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Program <span className="text-red-500">*</span>
              </label>
              {loadingPrograms ? (
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  Loading programs...
                </div>
              ) : programs.length === 0 ? (
                <div className="w-full px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                  Anda tidak memiliki akses ke program apapun. Hubungi admin
                  untuk mendapatkan akses.
                </div>
              ) : (
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent -gray-400"
                >
                  <option value="">Pilih Program</option>
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.name} ({program.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                PR Number (Auto-Generated)
              </label>
              <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                {prNumberPreview || "Pilih program untuk melihat preview"}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                PR Number akan di-generate otomatis saat menyimpan
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                required
                placeholder="Contoh: Pelatihan Guru Digital 2026, Seminar Entrepreneurship"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent -gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Nama kegiatan atau event yang memerlukan pembelian
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                placeholder="Contoh: Pendidikan, Keuangan, IT, Marketing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent -gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Departemen atau divisi yang mengajukan permintaan
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Budgeted <span className="text-red-500">*</span>
              </label>
              <select
                value={budgeted ? "yes" : "no"}
                onChange={(e) => setBudgeted(e.target.value === "yes")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent -gray-400"
              >
                <option value="no">No - Belum dianggarkan</option>
                <option value="yes">Yes - Sudah dianggarkan</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Apakah biaya ini sudah masuk dalam budget/anggaran program?
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Costing To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={costingTo}
                onChange={(e) => setCostingTo(e.target.value)}
                required
                placeholder="Contoh: Budget Program X 2026, Dana Operasional"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent -gray-400"
              />
              <p className="mt-1 text-xs text-gray-500">
                Sumber dana atau pos anggaran yang akan digunakan
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 - Items */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Section 2: Items
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              + Tambah Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    Name Item
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 w-24">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 w-32">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 w-40">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200 w-40">
                    Total Price
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200 w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) =>
                          updateItem(index, "item", e.target.value)
                        }
                        required
                        placeholder="Contoh: Laptop HP, Proyektor, ATK"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm -gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", Number(e.target.value))
                        }
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm -gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        required
                        placeholder="pcs, kg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm -gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(index, "price", Number(e.target.value))
                        }
                        required
                        min="0"
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm -gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm">
                        {formatRupiah(item.totalPrice)}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-center space-x-2">
                        <button
                          type="button"
                          onClick={addItem}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition"
                          title="Tambah item baru"
                        >
                          Tambah
                        </button>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                            title="Hapus item ini"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-800">
                Grand Total:
              </span>
              <span className="text-2xl font-bold text-indigo-600">
                {formatRupiah(getTotalAmount())}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
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
            {loading ? "Menyimpan..." : "Simpan Purchase Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

