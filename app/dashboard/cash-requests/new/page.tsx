"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IVendor } from "@/types/cash-request";

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
  // const { data: session } = useSession();
  const [vendors, setVendors] = useState<IVendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [programs, setPrograms] = useState<Program[]>([]);

  // Form State
  const [programId, setProgramId] = useState("");
  const [activityName, setActivityName] = useState(""); // New field
  const [vendorName, setVendorName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Vendor Autocomplete Logic
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  const filteredVendors =
    vendorName === ""
      ? vendors
      : vendors.filter((v) =>
          v.name.toLowerCase().includes(vendorName.toLowerCase()),
        );

  // Item List State
  const [items, setItems] = useState<RequestItem[]>([
    { description: "", quantity: 1, price: 0 },
  ]);
  const [useTax, setUseTax] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);

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
  // Calculate totals whenever items or tax changes POINTER
  useEffect(() => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    // Tax Calculation (Deduction)
    const newTax = useTax ? newSubtotal * (taxPercentage / 100) : 0;

    setSubtotal(newSubtotal);
    setTaxAmount(newTax);
    // Grand Total = Subtotal - Tax
    setGrandTotal(newSubtotal - newTax);
  }, [items, useTax, taxPercentage]);

  const handleVendorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setVendorName(value);
    setSelectedVendor(""); // Reset selected vendor ID when typing
    setShowVendorSuggestions(true);

    // If clearing name, also clear details
    if (value === "") {
      setBankName("");
      setAccountNumber("");
    }
  };

  const selectVendor = (vendor: IVendor) => {
    setVendorName(vendor.name);
    setBankName(vendor.bankName);
    setAccountNumber(vendor.accountNumber);
    setSelectedVendor(vendor._id);
    setShowVendorSuggestions(false);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItem = (
    index: number,
    field: keyof RequestItem,
    value: string | number,
  ) => {
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
        activityName,
        vendorId: selectedVendor || undefined,
        vendorName,
        bankName,
        accountNumber,
        items,
        useTax,
        taxPercentage: useTax ? taxPercentage : 0,
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
              Informasi Program & Kegiatan
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                >
                  <option value="">-- Select Program --</option>
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.code} - {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Activity Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g. Workshop Pelatihan Staff"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informasi Penerima Pembayaran (Vendor)
            </h3>

            {/* Vendor Name with Autocomplete */}
            <div className="mb-4 relative">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Vendor / Penerima
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={handleVendorNameChange}
                onFocus={() => setShowVendorSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowVendorSuggestions(false), 200)
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                placeholder="Start typing to search or enter new vendor..."
                required
              />

              {/* Autocomplete Dropdown */}
              {showVendorSuggestions && filteredVendors.length > 0 && (
                <div className="absolute z-10 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm mt-1">
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor._id}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 text-gray-900"
                      onClick={() => selectVendor(vendor)}
                    >
                      <span className="block truncate font-medium">
                        {vendor.name}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {vendor.bankName} - {vendor.accountNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {showVendorSuggestions &&
                vendorName &&
                filteredVendors.length === 0 && (
                  <div className="absolute z-10 w-full bg-white shadow-lg rounded-md py-2 px-3 text-sm text-gray-500 mt-1 border border-gray-100">
                    New vendor will be added automatically
                  </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nama Bank
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g. BCA, Mandiri"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                  placeholder="e.g. 1234567890"
                  required
                />
              </div>
            </div>

            {/* Auto-fill notification */}
            {selectedVendor && (
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Vendor details auto-filled from database
              </p>
            )}
            {!selectedVendor && vendorName && (
              <p className="text-xs text-blue-600 mt-2 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                New vendor will be saved to database
              </p>
            )}
          </div>

          {/* Items Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Rincian Pembayaran
              </h2>
              <p className="text-xs text-gray-500">
                Tambahkan detail item/pos yang akan dibayar
              </p>
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
                  <div className="grow">
                    <input
                      type="text"
                      placeholder="Contoh: Sewa venue, Konsumsi rapat, ATK"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-center text-gray-900 placeholder-gray-400 font-medium"
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Harga satuan"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-right text-gray-900 placeholder-gray-400 font-medium"
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

              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useTax}
                      onChange={(e) => {
                        setUseTax(e.target.checked);
                        if (!e.target.checked) setTaxPercentage(0);
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Apply Tax (Deduction)</span>
                  </label>

                  {useTax && (
                    <div className="flex items-center space-x-2 ml-6">
                      <span className="text-sm text-gray-600">Rate:</span>
                      <input
                        type="number"
                        value={taxPercentage}
                        onChange={(e) =>
                          setTaxPercentage(parseFloat(e.target.value) || 0)
                        }
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-right text-gray-900 font-medium"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  )}
                </div>
                <span className="font-mono text-sm text-red-600">
                  - {formatCurrency(taxAmount)}
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
