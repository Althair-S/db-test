"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

interface PRItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

interface PurchaseRequest {
  _id: string;
  department: string;
  budgeted: boolean;
  costingTo: string;
  prNumber: string;
  items: PRItem[];
  status: string;
}

export default function EditPurchaseRequestPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [department, setDepartment] = useState("");
  const [budgeted, setBudgeted] = useState(false);
  const [costingTo, setCostingTo] = useState("");
  const [prNumber, setPrNumber] = useState("");
  const [items, setItems] = useState<PRItem[]>([]);

  useEffect(() => {
    if (id) {
      fetchPR();
    }
  }, [id]);

  const fetchPR = async () => {
    try {
      const response = await fetch(`/api/purchase-requests/${id}`);
      if (response.ok) {
        const data: PurchaseRequest = await response.json();

        if (data.status !== "pending") {
          setError("Cannot edit approved or rejected purchase requests");
          setTimeout(
            () => router.push(`/dashboard/purchase-requests/${id}`),
            2000,
          );
          return;
        }

        setDepartment(data.department);
        setBudgeted(data.budgeted);
        setCostingTo(data.costingTo);
        setPrNumber(data.prNumber);
        setItems(data.items);
      } else {
        router.push("/dashboard/purchase-requests");
      }
    } catch (error) {
      console.error("Error fetching PR:", error);
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department,
          budgeted,
          costingTo,
          prNumber,
          items,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/purchase-requests/${id}`);
      } else {
        const data = await response.json();
        setError(data.error || "Gagal mengupdate purchase request");
      }
    } catch (err) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Edit Purchase Request
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PR Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budgeted <span className="text-red-500">*</span>
              </label>
              <select
                value={budgeted ? "yes" : "no"}
                onChange={(e) => setBudgeted(e.target.value === "yes")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costing To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={costingTo}
                onChange={(e) => setCostingTo(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
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
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              + Tambah Item
            </button>
          </div>

          {items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Item {index + 1}</h3>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Hapus
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.item}
                    onChange={(e) => updateItem(index, "item", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                    required
                    placeholder="pcs, kg, box, dll"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (IDR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, "price", Number(e.target.value))
                    }
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Price
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold">
                    {formatRupiah(item.totalPrice)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
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
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Menyimpan..." : "Update Purchase Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
