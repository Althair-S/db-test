"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ICashRequest } from "@/types/cash-request";
import PrintTemplate from "./PrintTemplate";
import { useReactToPrint } from "react-to-print";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { exportToExcel } from "@/lib/exportToExcel";

export default function CashRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [cr, setCr] = useState<ICashRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Signature configuration state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatures, setSignatures] = useState({
    reviewedBy: { name: "", position: "Finance Officer" },
    approvedBy: {
      name: "Nur Safitri Lasibani",
      position: "Executive Director",
    },
  });

  useEffect(() => {
    fetchCR();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCR = async () => {
    try {
      const response = await fetch(`/api/cash-requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCr(data);
      } else {
        console.error("Failed to fetch cash request");
      }
    } catch (error) {
      console.error("Error fetching cash request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintAction = useReactToPrint({
    contentRef: printRef,
    documentTitle: `CR-${cr?._id}`,
  });

  const handlePrint = () => {
    setShowSignatureModal(true);
  };

  const handleConfirmPrint = () => {
    setShowSignatureModal(false);
    setTimeout(() => {
      if (handlePrintAction) handlePrintAction();
    }, 100);
  };

  const handleExportExcel = () => {
    if (!cr) return;

    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `CR-${cr._id}-${currentDate}.xlsx`;

    // Calculate items
    const items =
      cr.items && cr.items.length > 0
        ? cr.items
        : [
            {
              description: cr.description || "-",
              quantity: 1,
              price: cr.amount || 0,
              total: cr.amount || 0,
            },
          ];

    const subtotal = items.reduce(
      (sum: number, i: { total: number }) => sum + i.total,
      0,
    );
    const total =
      cr.totalAmount ||
      items.reduce((sum: number, i: { total: number }) => sum + i.total, 0);

    // Prepare metadata
    const metadata = {
      "Program Name": cr.programName || "-",
      "Program Code": cr.programCode || "-",
      "Activity Name": cr.activityName || "-",
      "Vendor Name": cr.vendorName,
      "Bank Name": cr.bankName,
      "Account Number": cr.accountNumber,
      "Created By": cr.createdByName,
      "Created At": new Date(cr.createdAt).toLocaleString("id-ID"),
      Status: cr.status.toUpperCase(),
    };

    // Prepare columns
    const columns = [
      { header: "Item", key: "description", width: 35 },
      { header: "Qty", key: "quantity", width: 8 },
      { header: "Price", key: "price", width: 15 },
      { header: "Total", key: "total", width: 15 },
    ];

    // Prepare data
    const data = items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      price: formatCurrency(item.price),
      total: formatCurrency(item.total),
    }));

    // Prepare total rows
    const totalRows = [];
    if (cr.useTax) {
      totalRows.push({
        description: "",
        quantity: "",
        price: "Subtotal:",
        total: formatCurrency(subtotal),
      });
      totalRows.push({
        description: "",
        quantity: "",
        price: `Tax Deduction (${cr.taxPercentage || 0}%):`,
        total: `- ${formatCurrency(cr.taxAmount || 0)}`,
      });
    }
    totalRows.push({
      description: "",
      quantity: "",
      price: "Grand Total (Net):",
      total: formatCurrency(total),
    });

    // For multiple total rows, combine them into the data array
    const dataWithTotals = [
      ...data,
      { description: "", quantity: "", price: "", total: "" },
      ...totalRows,
    ];

    exportToExcel({
      filename,
      sheetName: "Cash Request",
      metadata,
      columns,
      data: dataWithTotals,
    });
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this cash request?")) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`/api/cash-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCr(updated);
        alert("Cash request approved successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error approving cash request:", error);
      alert("Failed to approve cash request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`/api/cash-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setCr(updated);
        setShowRejectForm(false);
        alert("Cash request rejected");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error rejecting cash request:", error);
      alert("Failed to reject cash request");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const bgClass =
      styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
    return `px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${bgClass}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!cr) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Cash request not found</div>
      </div>
    );
  }

  const items =
    cr.items && cr.items.length > 0
      ? cr.items
      : [
          {
            description: cr.description || "-",
            quantity: 1,
            price: cr.amount || 0,
            total: cr.amount || 0,
          },
        ]; // Backward compatibility

  const total =
    cr.totalAmount ||
    items.reduce((sum: number, i: { total: number }) => sum + i.total, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden Print Template */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintTemplate cr={cr} signatures={signatures} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Cash Request Details
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export to Excel</span>
          </button>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow">
        {/* Status Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className={getStatusBadge(cr.status)}>
              {cr.status.toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Program Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Program Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Program Name</p>
              <p className="font-medium text-gray-900">
                {cr.programName || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Program Code</p>
              <p className="font-mono font-medium text-gray-900">
                {cr.programCode || "-"}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Activity Name</p>
              <p className="font-medium text-gray-900">
                {cr.activityName || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Vendor Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vendor Name</p>
              <p className="font-medium text-gray-900">{cr.vendorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium text-gray-900">{cr.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-medium text-gray-900">{cr.accountNumber}</p>
            </div>
          </div>
        </div>

        {/* Request Items */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Request Items
          </h2>

          <table className="min-w-full divide-y divide-gray-200 mb-4 border rounded overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-20">
                  Qty
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-32">
                  Price
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase w-36">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              {/* Only show Tax if enabled */}
              {cr.useTax && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-2 text-sm font-medium text-red-600 text-right"
                  >
                    Tax Deduction ({cr.taxPercentage || 0}%)
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-red-600 text-right">
                    - {formatCurrency(cr.taxAmount || 0)}
                  </td>
                </tr>
              )}
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-sm font-bold text-gray-900 text-right"
                >
                  Grand Total (Net)
                </td>
                <td className="px-4 py-2 text-sm font-bold text-gray-900 text-right">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Metadata */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Approval Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="font-medium text-gray-900">{cr.createdByName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium text-gray-900">
                {new Date(cr.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
            {cr.approvedBy && (
              <>
                <div>
                  <p className="text-sm text-gray-600">Approved By</p>
                  <p className="font-medium text-gray-900">
                    {cr.approvedByName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Approved At</p>
                  <p className="font-medium text-gray-900">
                    {cr.approvedAt &&
                      new Date(cr.approvedAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </>
            )}
            {cr.rejectionReason && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Rejection Reason</p>
                <p className="font-medium text-red-600">{cr.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions (Finance only, for pending requests) */}
        {session?.user?.role === "finance" && cr.status === "pending" && (
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Actions
            </h2>

            {!showRejectForm ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Processing..." : "✓ Approve"}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  ✗ Reject
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Contoh: Budget tidak mencukupi, Detail item perlu diperjelas, Vendor belum terverifikasi"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Jelaskan alasan mengapa Cash Request ini ditolak
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionReason.trim()}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Confirm Rejection"}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason("");
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signature Configuration Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Konfigurasi Tanda Tangan
            </h3>

            <div className="space-y-6">
              {/* Reviewed By */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Reviewed By
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={signatures.reviewedBy.name}
                      onChange={(e) =>
                        setSignatures({
                          ...signatures,
                          reviewedBy: {
                            ...signatures.reviewedBy,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Masukkan nama"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posisi / Jabatan
                    </label>
                    <input
                      type="text"
                      value={signatures.reviewedBy.position}
                      onChange={(e) =>
                        setSignatures({
                          ...signatures,
                          reviewedBy: {
                            ...signatures.reviewedBy,
                            position: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Masukkan posisi/jabatan"
                    />
                  </div>
                </div>
              </div>

              {/* Approved By */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Approved By
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama
                    </label>
                    <input
                      type="text"
                      value={signatures.approvedBy.name}
                      onChange={(e) =>
                        setSignatures({
                          ...signatures,
                          approvedBy: {
                            ...signatures.approvedBy,
                            name: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Masukkan nama"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posisi / Jabatan
                    </label>
                    <input
                      type="text"
                      value={signatures.approvedBy.position}
                      onChange={(e) =>
                        setSignatures({
                          ...signatures,
                          approvedBy: {
                            ...signatures.approvedBy,
                            position: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Masukkan posisi/jabatan"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowSignatureModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmPrint}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
