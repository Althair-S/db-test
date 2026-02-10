import React from "react";

interface PRItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

interface PrintTemplateProps {
  pr: {
    prNumber: string;
    createdAt: string;
    programName: string;
    program: string;
    activityName: string;
    department: string;
    createdByName: string;
    status: string;
    costingTo: string;
    items: PRItem[];
  };
  formatRupiah: (value: number) => string;
  getTotalAmount: () => number;
}

export default function PrintTemplate({
  pr,
  formatRupiah,
  getTotalAmount,
}: PrintTemplateProps) {
  return (
    <div className="hidden print:block font-sans text-black text-xs px-8 py-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide">
            Purchase Request
          </h1>
          <p className="text-gray-600">Created by {pr.createdByName}</p>
        </div>

        <div className="text-right">
          <p className="font-mono font-bold text-lg">{pr.prNumber}</p>
          <p className="text-[11px] text-gray-600 mt-1">
            Date:{" "}
            {new Date(pr.createdAt).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ================= INFO GRID ================= */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-2 mb-6 text-xs">
        <div className="grid grid-cols-[110px_8px_1fr]">
          <span className="font-semibold">Department</span>
          <span>:</span>
          <span className="break-words"></span>
        </div>

        <div className="grid grid-cols-[110px_8px_1fr]">
          <span className="font-semibold">Costing To</span>
          <span>:</span>
          <span className="break-words">{pr.costingTo}</span>
        </div>
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table className="w-full border border-black border-collapse mb-4">
        <thead>
          <tr className="bg-gray-200 text-[11px]">
            <th className="border border-black px-2 py-2 w-8 text-center">
              No
            </th>
            <th className="border border-black px-2 py-2 text-left">
              Item Description
            </th>
            <th className="border border-black px-2 py-2 w-16 text-center">
              Qty
            </th>
            <th className="border border-black px-2 py-2 w-16 text-center">
              Unit
            </th>
            <th className="border border-black px-2 py-2 w-28 text-right">
              Price
            </th>
            <th className="border border-black px-2 py-2 w-32 text-right">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {pr.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black px-2 py-2 text-center">
                {idx + 1}
              </td>
              <td className="border border-black px-2 py-2">{item.item}</td>
              <td className="border border-black px-2 py-2 text-center">
                {item.quantity}
              </td>
              <td className="border border-black px-2 py-2 text-center">
                {item.unit}
              </td>
              <td className="border border-black px-2 py-2 text-right">
                {formatRupiah(item.price)}
              </td>
              <td className="border border-black px-2 py-2 text-right font-semibold">
                {formatRupiah(item.totalPrice)}
              </td>
            </tr>
          ))}
          {/* TOTAL */}
          <tr className="font-bold bg-gray-100">
            <td
              colSpan={5}
              className="border border-black px-2 py-2 text-right"
            >
              GRAND TOTAL
            </td>
            <td className="border border-black px-2 py-2 text-right">
              {formatRupiah(getTotalAmount())}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= SIGNATURE ================= */}
      <div className="grid grid-cols-3 gap-6 mt-10 text-center">
        <div>
          <p className="mb-12">Requested By</p>
          <div className="border-b border-black mx-auto w-36 mb-1"></div>
          <p className="font-semibold">{pr.createdByName}</p>
          <p className="text-[11px] text-gray-600">User</p>
        </div>

        <div>
          <p className="mb-12">Reviewed By</p>
          <div className="border-b border-black mx-auto w-36 mb-1"></div>
          <p className="font-semibold">Finance</p>
          <p className="text-[11px] text-gray-600">Finance Officer</p>
        </div>

        <div>
          <p className="mb-12">Approved By</p>
          <div className="border-b border-black mx-auto w-36 mb-1"></div>
          <p className="font-semibold">Direktur Eksekutif</p>
          <p className="text-[11px] text-gray-600">Authorized</p>
        </div>
      </div>
    </div>
  );
}
