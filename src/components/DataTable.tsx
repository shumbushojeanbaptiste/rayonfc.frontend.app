import React from "react";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
};

export type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  className?: string;
  tableClassName?: string;
};

export default function DataTable<T>({
  columns,
  data,
  className,
  tableClassName,
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className || ""}`}>
      <table className={`w-full border-collapse border ${tableClassName || ""}`}>
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left px-3 py-2 border-b border-gray-300 dark:border-gray-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                No data found
              </td>
            </tr>
          )}
          {data.map((row, idx) => (
            <tr
              key={(row as any).id ?? idx}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                idx % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 truncate"
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
