"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

interface ImportFormProps {
  organizationId: string;
}

interface PreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export default function ImportForm({ organizationId }: ImportFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const parseFile = async (selectedFile: File) => {
    setParsing(true);
    setError(null);

    try {
      const text = await selectedFile.text();

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.errors.length > 0) {
            setError("Failed to parse CSV file");
            setParsing(false);
            return;
          }

          const headers = result.meta.fields || [];
          const rows = result.data.slice(0, 5).map((row: any) =>
            headers.map(h => row[h] || "")
          );

          setPreview({
            headers,
            rows,
            totalRows: result.data.length,
          });
          setParsing(false);
        },
      });
    } catch (err) {
      setError("Failed to read file");
      setParsing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      parseFile(droppedFile);
    } else {
      setError("Please upload a CSV file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("organizationId", organizationId);

      const response = await fetch("/api/customers/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to import data");
      }

      alert(`Successfully imported ${data.customersCreated} customers and ${data.invoicesCreated} invoices`);
      router.push("/dashboard/customers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import data");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `firstName,lastName,email,phone,address,city,state,zip,notes,invoiceNumber,invoiceDescription,invoiceAmount,invoiceDueDate
John,Smith,john@example.com,555-0101,123 Main St,New York,NY,10001,Preferred customer,INV-1001,Monthly service,450.00,2026-02-01
Jane,Doe,jane@example.com,555-0102,456 Oak Ave,Los Angeles,CA,90001,Net 30 terms,INV-1002,Project work,1200.00,2026-02-15`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Download Template */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-2">Need a template?</h3>
        <p className="text-sm text-revnu-gray mb-4">
          Download our CSV template to see the required format
        </p>
        <button
          onClick={downloadTemplate}
          className="px-4 py-2 bg-revnu-green/20 border border-revnu-green/30 rounded-lg text-revnu-green font-semibold hover:bg-revnu-green/30 transition"
        >
          Download Template
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Upload File</h3>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition ${
            isDragging
              ? "border-revnu-green bg-revnu-green/10"
              : "border-revnu-green/30 bg-revnu-dark/50"
          }`}
        >
          <div className="text-4xl mb-4">📁</div>
          <p className="text-white font-bold mb-2">
            Drag & drop your CSV or Excel file here
          </p>
          <p className="text-sm text-revnu-gray mb-4">or</p>

          <label className="inline-block px-6 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition cursor-pointer">
            Browse Files
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {file && (
          <div className="mt-4 p-4 bg-revnu-dark border border-revnu-green/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-sm text-revnu-gray">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {parsing && (
          <div className="mt-4 p-4 bg-revnu-green/10 border border-revnu-green/30 rounded-lg">
            <p className="text-revnu-green text-sm">Parsing CSV file...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Preview Table */}
      {preview && !error && (
        <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              Preview (showing first 5 of {preview.totalRows} rows)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-revnu-green/20">
                  {preview.headers.map((header, idx) => (
                    <th key={idx} className="text-left py-3 px-4 text-revnu-green font-bold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-revnu-green/10">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="py-3 px-4 text-revnu-gray">
                        {cell || <span className="text-revnu-gray/50">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full px-6 py-3 bg-revnu-green text-revnu-dark font-black rounded-lg hover:bg-revnu-greenLight transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Importing..." : `Import ${preview.totalRows} Rows`}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-3">File Format Requirements</h3>
        <ul className="text-sm text-revnu-gray space-y-2">
          <li>• <span className="text-white font-semibold">Required customer fields:</span> firstName, lastName</li>
          <li>• <span className="text-white font-semibold">Optional customer fields:</span> email, phone, address, city, state, zip, notes</li>
          <li>• <span className="text-white font-semibold">Optional invoice fields:</span> invoiceNumber, invoiceDescription, invoiceAmount, invoiceDueDate</li>
          <li>• Each row creates or updates a customer. If invoice fields are provided, an invoice is also created</li>
          <li>• Date format: YYYY-MM-DD (e.g., 2026-02-15)</li>
          <li>• Amount format: Decimal format (e.g., 450.00)</li>
          <li>• Duplicate emails will update existing customers instead of creating new ones</li>
          <li>• Column names are case-insensitive</li>
        </ul>
      </div>
    </div>
  );
}
