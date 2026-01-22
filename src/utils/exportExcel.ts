import { saveAs } from "file-saver";

export function exportExcel(
  data: Record<string, any>[],
  filename: string = "export"
) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","), // header row
    ...data.map((row) =>
      headers
        .map((key) => {
          let val = row[key];
          if (typeof val === "string") val = val.replace(/"/g, '""').trim();
          return `"${val}"`;
        })
        .join(",")
    ),
  ];

  const csvString = "\uFEFF" + csvRows.join("\n"); // UTF-8 BOM for Excel
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename + ".csv");
}
