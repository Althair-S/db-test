"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IVendor } from "@/types/cash-request";
import { useSession } from "next-auth/react";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Program {
  _id: string;
  name: string;
  code: string;
}

interface RequestItem {
  description: string;
  quantity: number;
  price: number;
}

export default function NewCashRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [useManualInput, setUseManualInput] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Form State
  const [programId, setProgramId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Item List State
  const [items, setItems] = useState<RequestItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [useTax, setUseTax] = useState(false);

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch available programs
    fetch("/api/programs")
      .then((res) => res.json())
      .then((data) => setPrograms(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching programs:", err));

    // Try to fetch vendors
    fetch("/api/vendors")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => setVendors(data))
      .catch(() => setVendors([]));
  }, []);

  // Calculate totals whenever items or tax changes
  useEffect(() => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );
    const newTax = useTax ? newSubtotal * 0.11 : 0;

    setSubtotal(newSubtotal);
    setTaxAmount(newTax);
    setGrandTotal(newSubtotal + newTax);
  }, [items, useTax]);

  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendor(vendorId);
    setUseManualInput(false);

    if (vendorId) {
      const vendor = vendors.find((v) => v._id === vendorId);
      if (vendor) {
        setVendorName(vendor.name);
        setBankName(vendor.bankName);
        setAccountNumber(vendor.accountNumber);
      }
    } else {
      setVendorName("");
      setBankName("");
      setAccountNumber("");
    }
  };

  const handleManualToggle = () => {
    setUseManualInput(!useManualInput);
    setSelectedVendor("");
    setVendorName("");
    setBankName("");
    setAccountNumber("");
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof RequestItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate items
    if (
      items.some(
        (item) => !item.description || item.quantity <= 0 || item.price < 0,
      )
    ) {
      setError(
        "Please check your items. Description is required, and quantity/price must be valid.",
      );
      setLoading(false);
      return;
    }

    try {
      const payload = {
        programId,
        vendorId: selectedVendor || undefined,
        vendorName,
        bankName,
        accountNumber,
        items,
        useTax,
      };

      const response = await fetch("/api/cash-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/dashboard/cash-requests");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create cash request");
      }
    } catch (error) {
      console.error("Error creating cash request:", error);
      setError("Failed to create cash request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Create Cash Request
        </h1>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Program Selection */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Program Information
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Program <span className="text-red-500">*</span>
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Select Program --</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.code} - {program.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Vendor Information
            </h2>

            {vendors.length > 0 && (
              <div className="mb-4">
                <label className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    checked={useManualInput}
                    onChange={handleManualToggle}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">
                    Input vendor manually (not in list)
                  </span>
                </label>

                {!useManualInput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Existing Vendor
                    </label>
                    <select
                      value={selectedVendor}
                      onChange={(e) => handleVendorSelect(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">-- Select Vendor --</option>
                      {vendors.map((vendor) => (
                        <option key={vendor._id} value={vendor._id}>
                          {vendor.name} - {vendor.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name / Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  disabled={!useManualInput && selectedVendor !== ""}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter vendor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  disabled={!useManualInput && selectedVendor !== ""}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  disabled={!useManualInput && selectedVendor !== ""}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Enter account number"
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Request Items
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Item Description"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-center"
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-right"
                      min="0"
                      required
                    />
                  </div>
                  <div className="w-36 pt-2 text-right font-mono text-sm font-medium text-gray-700">
                    {formatCurrency(item.quantity * item.price)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="mt-6 border-t pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useTax}
                    onChange={(e) => setUseTax(e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Apply Tax (PPN 11%)</span>
                </label>
                <span className="font-mono text-sm text-gray-600">
                  {formatCurrency(taxAmount)}
                </span>
              </div>

              <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Submit Cash Request"}
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
