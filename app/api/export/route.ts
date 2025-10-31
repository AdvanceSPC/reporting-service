import { db } from "@/lib/db";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import PDFDocument from "pdfkit";
import stream from "stream";
import { promisify } from "util";

const pipeline = promisify(stream.pipeline);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const format = searchParams.get("format") || "csv";
        const channel = searchParams.get("channel");
        const start = searchParams.get("start");
        const end = searchParams.get("end");

        // Construcción segura del query
        let query = "SELECT * FROM interactions WHERE 1=1";
        const params: any[] = [];

        if (channel) {
            query += " AND channel = ?";
            params.push(channel);
        }
        if (start && end) {
            query += " AND created_at BETWEEN ? AND ?";
            params.push(start, end);
        }
        query += " ORDER BY created_at DESC LIMIT 1000";

        const [rows]: any = await db.execute(query, params);
        if (!rows || rows.length === 0)
            return NextResponse.json({ error: "No hay datos para exportar" }, { status: 404 });

        // ===== CSV EXPORT =====
        if (format === "csv") {
            const csv = Papa.unparse(rows);
            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": 'attachment; filename="report.csv"',
                },
            });
        }

        // ===== EXCEL EXPORT =====
        if (format === "excel") {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Reporte");

            sheet.columns = Object.keys(rows[0]).map((key) => ({
                header: key,
                key,
                width: 20,
            }));

            rows.forEach((row: any) => sheet.addRow(row));

            const buffer = await workbook.xlsx.writeBuffer();
            return new NextResponse(buffer, {
                headers: {
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition": 'attachment; filename="report.xlsx"',
                },
            });
        }

        // ===== PDF EXPORT =====
        if (format === "pdf") {
            const pdfStream = new stream.PassThrough();
            const doc = new PDFDocument({ margin: 30, size: "A4" });

            doc.pipe(pdfStream);
            doc.fontSize(16).text("Reporte de Interacciones", { align: "center" });
            doc.moveDown();

            rows.forEach((r: any, i: number) => {
                doc
                    .fontSize(10)
                    .text(
                        `${i + 1}. Canal: ${r.channel} | Cliente: ${r.caller || "-"} | Mensaje: ${r.message || "-"
                        } | Fecha: ${new Date(r.created_at).toLocaleString()}`
                    );
                doc.moveDown(0.3);
            });

            doc.end();

            const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                const chunks: any[] = [];
                pdfStream.on("data", (chunk) => chunks.push(chunk));
                pdfStream.on("end", () => resolve(Buffer.concat(chunks)));
                pdfStream.on("error", reject);
            });

            // Convertir Buffer a Uint8Array
            return new NextResponse(new Uint8Array(pdfBuffer), {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": 'attachment; filename="report.pdf"',
                },
            });
        }

        return NextResponse.json({ error: "Formato no soportado" }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Error al exportar datos", details: String(err) },
            { status: 500 }
        );
    }
}
