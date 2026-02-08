"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
  status: "pending" | "approved" | "rejected";
  createdBy: string;
  createdByName: string;
  createdAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
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
    if (!confirm("Apakah Anda yakin ingin menghapus PR ini?")) return;

    try {
      const response = await fetch(`/api/purchase-requests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/purchase-requests");
      }
    } catch (error) {
      console.error("Error deleting PR:", error);
    }
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
      <div className="flex justify-between items-center">
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
      <div className="bg-white rounded-lg shadow p-6">
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

      {/* Section 1 */}
      <div className="bg-white rounded-lg shadow p-6">
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
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Items</h3>
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

      {/* Approval Info */}
      {pr.status !== "pending" && (
        <div className="bg-white rounded-lg shadow p-6">
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

      {/* Actions */}
      <div className="flex justify-end space-x-4">
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
    </div>
  );
}
