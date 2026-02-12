"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import PrintTemplate from "./PrintTemplate";
import { exportToExcel } from "@/lib/exportToExcel";

interface PRItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

interface PRComment {
  commentedBy: string;
  commentedByName: string;
  commentedByRole: string;
  comment: string;
  createdAt: string;
}

interface PurchaseRequest {
  _id: string;
  activityName: string;
  department: string;
  budgeted: boolean;
  costingTo: string;
  prNumber: string;
  program: string;
  programName: string;
  programCode: string;
  items: PRItem[];
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdByName: string;
  createdAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  comments: PRComment[];
  revisionRequested: boolean;
}

export default function PurchaseRequestDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [pr, setPr] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Signature configuration state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatures, setSignatures] = useState({
    reviewedBy: { name: "Finance", position: "Finance Officer" },
    approvedBy: {
      name: "Nur Safitri Lasibani",
      position: "Executive Director",
    },
  });

  useEffect(() => {
    if (id) {
      fetchPR();
    }
  }, [id]);

  const fetchPR = async () => {
    try {
      const response = await fetch(`/api/purchase-requests/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPr(data);
      } else {
        router.push("/dashboard/purchase-requests");
      }
    } catch (error) {
      console.error("Error fetching PR:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        fetchPR();
      }
    } catch (error) {
      console.error("Error approving PR:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason }),
      });

      if (response.ok) {
        setShowRejectModal(false);
        fetchPR();
      }
    } catch (error) {
      console.error("Error rejecting PR:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this purchase request?")) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/purchase-requests");
      } else {
        alert("Failed to delete purchase request");
      }
    } catch (error) {
      console.error("Error deleting PR:", error);
      alert("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Please enter a comment");
      return;
    }

    setCommentLoading(true);

    try {
      const response = await fetch(`/api/purchase-requests/${id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
      });

      if (response.ok) {
        setNewComment("");
        fetchPR(); // Refresh to show new comment
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("An error occurred");
    } finally {
      setCommentLoading(false);
    }
  };

  const handlePrint = () => {
    setShowSignatureModal(true);
  };

  const handleConfirmPrint = () => {
    setShowSignatureModal(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleExportExcel = () => {
    if (!pr) return;

    const currentDate = new Date().toISOString().split("T")[0];
    const filename = `PR-${pr.prNumber}-${currentDate}.xlsx`;

    // Prepare metadata
    const metadata = {
      "PR Number": pr.prNumber,
      "Activity Name": pr.activityName,
      Department: pr.department,
      Program: `${pr.programName} (${pr.programCode})`,
      Budgeted: pr.budgeted ? "Yes" : "No",
      "Costing To": pr.costingTo,
      "Created By": pr.createdByName,
      "Created At": new Date(pr.createdAt).toLocaleString("id-ID"),
      Status: pr.status.toUpperCase(),
    };

    // Prepare columns
    const columns = [
      { header: "Item", key: "item", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Unit", key: "unit", width: 10 },
      { header: "Price", key: "price", width: 15 },
      { header: "Total", key: "total", width: 15 },
    ];

    // Prepare data
    const data = pr.items.map((item) => ({
      item: item.item,
      quantity: item.quantity,
      unit: item.unit,
      price: formatRupiah(item.price),
      total: formatRupiah(item.totalPrice),
    }));

    // Prepare total row
    const totalRow = {
      item: "",
      quantity: "",
      unit: "",
      price: "Grand Total:",
      total: formatRupiah(getTotalAmount()),
    };

    exportToExcel({
      filename,
      sheetName: "Purchase Request",
      metadata,
      columns,
      data,
      totalRow,
    });
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTotalAmount = () => {
    return pr?.items.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!pr) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Purchase request not found</p>
      </div>
    );
  }

  const canEdit =
    session?.user.role === "user" &&
    pr.status === "pending" &&
    pr.createdBy === session.user.id;
  const canDelete =
    session?.user.role === "user" &&
    pr.status === "pending" &&
    pr.createdBy === session.user.id;
  const canApprove =
    session?.user.role === "finance" && pr.status === "pending";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Print Template - Separate Component */}
      <PrintTemplate
        pr={pr}
        getTotalAmount={getTotalAmount}
        signatures={signatures}
      />

      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-800">
          Purchase Request Detail
        </h1>
        <Link
          href="/dashboard/purchase-requests"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Kembali
        </Link>
      </div>

      {/* Status Badge */}
      <div className="bg-white rounded-lg shadow p-6 print:hidden">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              PR #{pr.prNumber}
            </h2>
            <p className="text-gray-600">Created by {pr.createdByName}</p>
          </div>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusBadge(pr.status)}`}
          >
            {pr.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Section 1 - Hidden in Print */}
      <div className="bg-white rounded-lg shadow p-6 print:hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Informasi Umum
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-medium text-gray-800">{pr.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budgeted</p>
            <p className="font-medium text-gray-800">
              {pr.budgeted ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Costing To</p>
            <p className="font-medium text-gray-800">{pr.costingTo}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created At</p>
            <p className="font-medium text-gray-800">
              {new Date(pr.createdAt).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6 print:hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pr.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.item}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatRupiah(item.price)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {formatRupiah(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-3 text-sm font-semibold text-gray-900 text-right"
                >
                  Grand Total:
                </td>
                <td className="px-4 py-3 text-sm font-bold text-indigo-600">
                  {formatRupiah(getTotalAmount())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Approval Info - Hidden in Print */}
      {pr.status !== "pending" && (
        <div className="bg-white rounded-lg shadow p-6 print:hidden">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {pr.status === "approved"
              ? "Approval Information"
              : "Rejection Information"}
          </h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              {pr.status === "approved" ? "Approved" : "Rejected"} by:{" "}
              <span className="font-medium text-gray-800">
                {pr.approvedByName}
              </span>
            </p>
            <p className="text-gray-600">
              Date:{" "}
              <span className="font-medium text-gray-800">
                {pr.approvedAt &&
                  new Date(pr.approvedAt).toLocaleString("id-ID")}
              </span>
            </p>
            {pr.rejectionReason && (
              <p className="text-gray-600">
                Reason:{" "}
                <span className="font-medium text-red-600">
                  {pr.rejectionReason}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Comments Section - Hidden in Print */}
      <div className="bg-white rounded-lg shadow p-6 print:hidden">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Comments & Discussion
        </h3>

        {/* Display existing comments */}
        {pr.comments && pr.comments.length > 0 ? (
          <div className="space-y-3 mb-6">
            {pr.comments.map((comment, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${
                  comment.commentedByRole === "finance"
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {comment.commentedByName}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded ml-2 ${
                        comment.commentedByRole === "finance"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {comment.commentedByRole}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic mb-6">
            No comments yet. Start a discussion here.
          </p>
        )}

        {/* Add comment form (finance and PR owner can comment) */}
        {(session?.user?.role === "finance" ||
          (session?.user?.role === "user" &&
            pr.createdBy === session?.user?.id)) && (
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {session?.user?.role === "finance"
                ? "Add Review Comment"
                : "Reply to Finance"}
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                session?.user?.role === "finance"
                  ? "Provide feedback or request revisions..."
                  : "Reply to finance comments or provide updates..."
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleAddComment}
                disabled={commentLoading || !newComment.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? "Submitting..." : "Submit Comment"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 print:hidden">
        {/* Print and Export buttons for approved PRs */}
        {pr.status === "approved" && (
          <>
            <button
              onClick={handleExportExcel}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition flex items-center gap-2"
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
              Export to Excel
            </button>
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
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
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print to PDF
            </button>
          </>
        )}

        {canDelete && (
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Delete
          </button>
        )}
        {canEdit && (
          <Link
            href={`/dashboard/purchase-requests/${id}/edit`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Edit
          </Link>
        )}
        {canApprove && (
          <>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {actionLoading ? "Processing..." : "Approve"}
            </button>
          </>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Reject Purchase Request
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Alasan penolakan (opsional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Hide navigation, modals, and interactive elements */
          nav,
          aside,
          button:not(.print-keep),
          .print-hidden,
          [class*="modal"] {
            display: none !important;
          }

          /* Hide comments section and approval info in print */
          div.bg-white.rounded-lg.shadow.p-6:has(h3:contains("Comments")),
          div.bg-white.rounded-lg.shadow.p-6:has(
              h3:contains("Approval Information")
            ),
          div.bg-white.rounded-lg.shadow.p-6:has(
              h3:contains("Rejection Information")
            ) {
            display: none !important;
          }

          /* Page setup */
          @page {
            margin: 1.5cm;
            size: A4 portrait;
          }

          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          /* Prevent page breaks inside important elements */
          table,
          .bg-white {
            page-break-inside: avoid;
          }

          /* Preserve background colors for print */
          .bg-blue-50,
          .bg-gray-50,
          .bg-green-100,
          .bg-red-100 {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Optimize spacing for print - more compact */
          .space-y-6 > * + * {
            margin-top: 0.5rem !important;
          }

          /* Reduce padding on cards */
          .p-6 {
            padding: 0.75rem !important;
          }

          /* Compact header margins */
          .mb-6 {
            margin-bottom: 0.5rem !important;
          }

          .mb-4 {
            margin-bottom: 0.25rem !important;
          }

          /* Make text more readable */
          body {
            font-size: 11pt;
            line-height: 1.4;
          }

          h1 {
            font-size: 18pt;
          }

          h2 {
            font-size: 14pt;
          }

          h3 {
            font-size: 12pt;
          }

          /* Ensure tables fit on page */
          table {
            width: 100%;
            font-size: 10pt;
          }

          /* Remove shadows for cleaner print */
          .shadow,
          .shadow-lg {
            box-shadow: none !important;
            border: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
}
