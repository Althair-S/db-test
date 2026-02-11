import React from "react";
import { ICashRequest } from "@/types/cash-request";

interface PrintTemplateProps {
  cr: ICashRequest;
}

/* ================= HELPER ================= */
const formatNumberID = (value: number) => value.toLocaleString("id-ID");

/* Cell khusus uang: Rp kiri, angka kanan */
const MoneyCell = ({
  value,
  bold = false,
}: {
  value: number;
  bold?: boolean;
}) => (
  <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
    <span>Rp</span>
    <span className="font-mono text-right tabular-nums">
      {formatNumberID(value)}
    </span>
  </div>
);

export default function PrintTemplate({ cr }: PrintTemplateProps) {
  // Normalize items for legacy records
  const items =
    cr.items && cr.items.length > 0
      ? cr.items
      : [
          {
            description: cr.description || "N/A",
            quantity: 1,
            price: cr.amount || 0,
            total: cr.amount || 0,
          },
        ];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = cr.taxAmount || 0;
  const total = cr.totalAmount || subtotal + tax;

  return (
    <div className="hidden print:block font-sans text-black text-xs px-10 py-8">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start border-b border-black pb-5 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-wide">
            Cash Request
          </h1>
          <p className="text-gray-600 mt-1">Payment Request Document</p>
        </div>

        <div className="text-right">
          <p className="font-mono font-bold text-lg tracking-wide uppercase">
            {cr.status}
          </p>
          <p className="text-[11px] text-gray-600 mt-1">
            {new Date(cr.createdAt).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ================= META INFO ================= */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-3 mb-6">
        {[
          ["Program", `${cr.programCode} - ${cr.programName}`],
          ["Pay To", cr.vendorName],
          ["Bank", cr.bankName],
          ["Account No.", cr.accountNumber],
        ].map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[105px_8px_1fr] items-start"
          >
            <span className="font-semibold">{label}</span>
            <span>:</span>
            <span className="wrap-break-word">{value}</span>
          </div>
        ))}
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table className="w-full border border-black border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100 text-[11px] uppercase">
            <th className="border border-black px-2 py-2 w-8 text-center">
              No
            </th>
            <th className="border border-black px-2 py-2 text-left">
              Description
            </th>
            <th className="border border-black px-2 py-2 w-16 text-center">
              Qty
            </th>
            <th className="border border-black px-2 py-2 w-28 text-center">
              Price
            </th>
            <th className="border border-black px-2 py-2 w-32 text-center">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, idx) => (
            <tr key={idx} className="align-top">
              <td className="border border-black px-2 py-2 text-center">
                {idx + 1}
              </td>
              <td className="border border-black px-2 py-2">
                {item.description}
              </td>
              <td className="border border-black px-2 py-2 text-center">
                {item.quantity}
              </td>
              <td className="border border-black px-2 py-2">
                <MoneyCell value={item.price} />
              </td>
              <td className="border border-black px-2 py-2">
                <MoneyCell value={item.total} />
              </td>
            </tr>
          ))}

          {/* ================= TOTALS ================= */}
          {/* Subtotal */}
          <tr className="">
            <td
              colSpan={4}
              className="border border-black px-3 py-2 text-right font-medium"
            >
              Subtotal
            </td>
            <td className="border border-black px-3 py-2">
              <MoneyCell value={subtotal} />
            </td>
          </tr>

          {/* Tax */}
          {cr.useTax && (
            <tr>
              <td
                colSpan={4}
                className="border border-black px-3 py-2 text-right font-medium"
              >
                Tax (PPN 11%)
              </td>
              <td className="border border-black px-3 py-2">
                <MoneyCell value={tax} />
              </td>
            </tr>
          )}

          {/* Grand Total */}
          <tr className="font-bold bg-gray-100">
            <td
              colSpan={4}
              className="border border-black px-3 py-3 text-right"
            >
              GRAND TOTAL
            </td>
            <td className="border border-black px-3 py-3">
              <MoneyCell value={total} bold />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= SIGNATURE ================= */}
      <div className="grid grid-cols-3 gap-10 mt-12 text-center">
        {[
          ["Requested By", cr.createdByName, "User"],
          ["Reviewed By", "Finance", "Finance Officer"],
          [
            "Approved By",
            cr.approvedByName || "(....................)",
            "Direktur Eksekutif",
          ],
        ].map(([title, name, role]) => (
          <div key={title}>
            <p className="mb-14">{title}</p>
            <div className="border-b border-black w-40 mx-auto mb-2"></div>
            <p className="font-semibold">{name}</p>
            <p className="text-[11px] text-gray-600">{role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
