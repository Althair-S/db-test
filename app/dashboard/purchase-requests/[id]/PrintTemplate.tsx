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
    activityName: string;
    department: string;
    createdByName: string;
    status: string;
    costingTo: string;
    items: PRItem[];
  };
  getTotalAmount: () => number;
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

export default function PrintTemplate({
  pr,
  getTotalAmount,
}: PrintTemplateProps) {
  return (
    <div className="hidden print:block font-sans text-black text-xs px-10 py-8">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-start border-b border-black pb-5 mb-6">
        <div>
          <h1 className="text-4xl font-extrabold uppercase tracking-wide">
            Purchase Request
          </h1>
          <p className="text-gray-600 mt-1">Internal Procurement Document</p>
        </div>

        <div className="text-right">
          <p className="font-mono font-bold text-lg tracking-wide">
            {pr.prNumber}
          </p>
          <p className="text-[11px] text-gray-600 mt-1">
            {new Date(pr.createdAt).toLocaleDateString("id-ID", {
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
          ["Department", pr.department],
          ["Costing To", pr.costingTo],
          ["Program Name", ".............."],
          ["Status", pr.status.toUpperCase()],
        ].map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[105px_8px_1fr] items-start"
          >
            <span className="font-semibold">{label}</span>
            <span>:</span>
            <span className="break-words">{value}</span>
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
              Item Description
            </th>
            <th className="border border-black px-2 py-2 w-16 text-center">
              Qty
            </th>
            <th className="border border-black px-2 py-2 w-16 text-center">
              Unit
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
          {pr.items.map((item, idx) => (
            <tr key={idx} className="align-top">
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
              <td className="border border-black px-2 py-2">
                <MoneyCell value={item.price} />
              </td>
              <td className="border border-black px-2 py-2">
                <MoneyCell value={item.totalPrice} bold />
              </td>
            </tr>
          ))}

          {/* ================= GRAND TOTAL ================= */}
          <tr className="font-bold bg-gray-100">
            <td
              colSpan={5}
              className="border border-black px-3 py-3 text-right"
            >
              GRAND TOTAL
            </td>
            <td className="border border-black px-3 py-3">
              <MoneyCell value={getTotalAmount()} bold />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ================= SIGNATURE ================= */}
      <div className="grid grid-cols-3 gap-10 mt-12 text-center">
        {[
          ["Requested By", pr.createdByName, "User"],
          ["Reviewed By", "Finance", "Finance Officer"],
          ["Approved By", "Nur Safitri Lasibani", "Executive Director"],
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
