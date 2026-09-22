import type { jsPDF as JsPDF } from "jspdf";
import { getBusinessSettings, type BusinessSettings } from "@/features/settings/settingsService";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});
const date = new Intl.DateTimeFormat("es-MX", { dateStyle: "long" });
const purple: [number, number, number] = [91, 45, 145];

type Client = { name: string; business_name: string | null };
type QuoteDocument = {
  folio: string;
  title: string;
  description: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
  clients: Client | null;
  quote_items: {
    description: string;
    quantity: number;
    unit_price: number;
    sort_order: number;
  }[];
};
type ReceiptDocument = {
  project: { folio: string; name: string; clients: Client | null };
  payment: {
    id: string;
    amount: number;
    paid_at: string;
    reference: string | null;
    notes: string | null;
  };
  kindLabel: string;
  methodLabel: string;
};
type FinanceDocument = {
  projects: Array<{
    folio: string;
    name: string;
    price: number;
    clients: Client | null;
    collected: number;
    expenses: number;
  }>;
  totals: { contracted: number; collected: number; expenses: number };
};

function header(doc: JsPDF, title: string, subtitle: string, settings?: BusinessSettings | null) {
  doc.setFillColor(...purple);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(settings?.business_name || "DevDesdeCeroMX", 16, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("DevDesdeCeroMx Manager", 16, 23);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 194, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(subtitle, 194, 23, { align: "right" });
  doc.setTextColor(30);
}
function label(doc: JsPDF, text: string, value: string, x: number, y: number) {
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(text.toUpperCase(), x, y);
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text(value || "—", x, y + 6);
}
function footer(doc: JsPDF, settings?: BusinessSettings | null) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(225);
    doc.line(16, 282, 194, 282);
    doc.setFontSize(7);
    doc.setTextColor(125);
    const contact = [settings?.email, settings?.phone, settings?.website].filter(Boolean).join(" · ");
    doc.text(contact || "Documento generado desde DevDesdeCeroMx Manager", 16, 288);
    doc.text(`Página ${page} de ${pages}`, 194, 288, { align: "right" });
  }
}

export async function downloadQuotePdf(quote: QuoteDocument) {
  const { jsPDF } = await import("jspdf");
  const { data: settings } = await getBusinessSettings();
  const doc = new jsPDF();
  header(doc, "COTIZACIÓN", quote.folio, settings);
  label(
    doc,
    "Cliente",
    quote.clients?.business_name || quote.clients?.name || "Cliente",
    16,
    47,
  );
  label(doc, "Fecha", date.format(new Date(quote.created_at)), 112, 47);
  label(doc, "Proyecto", quote.title, 16, 65);
  label(
    doc,
    "Vigencia",
    quote.valid_until
      ? date.format(new Date(`${quote.valid_until}T12:00:00`))
      : "Sin fecha límite",
    112,
    65,
  );
  let y = 86;
  if (quote.description) {
    const lines = doc.splitTextToSize(quote.description, 178);
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(lines, 16, y);
    y += lines.length * 5 + 8;
  }
  doc.setFillColor(245, 242, 249);
  doc.rect(16, y, 178, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("CONCEPTO", 19, y + 6);
  doc.text("CANT.", 137, y + 6, { align: "right" });
  doc.text("PRECIO", 164, y + 6, { align: "right" });
  doc.text("IMPORTE", 191, y + 6, { align: "right" });
  y += 15;
  doc.setFont("helvetica", "normal");
  for (const item of [...quote.quote_items].sort(
    (a, b) => a.sort_order - b.sort_order,
  )) {
    const lines = doc.splitTextToSize(item.description, 102),
      height = Math.max(9, lines.length * 5);
    if (y + height > 258) {
      doc.addPage();
      header(doc, "COTIZACIÓN", quote.folio, settings);
      y = 47;
    }
    doc.setFontSize(8);
    doc.text(lines, 19, y);
    doc.text(String(item.quantity), 137, y, { align: "right" });
    doc.text(money.format(item.unit_price), 164, y, { align: "right" });
    doc.text(money.format(item.quantity * item.unit_price), 191, y, {
      align: "right",
    });
    y += height;
    doc.setDrawColor(238);
    doc.line(16, y, 194, y);
    y += 5;
  }
  y = Math.min(y + 3, 236);
  doc.setFontSize(9);
  const totalLine = (name: string, value: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(name, 150, y, { align: "right" });
    doc.text(money.format(value), 191, y, { align: "right" });
    y += 7;
  };
  totalLine("Subtotal", quote.subtotal);
  if (quote.discount) totalLine("Descuento", -quote.discount);
  if (quote.tax) totalLine("Impuestos", quote.tax);
  totalLine("Total", quote.total, true);
  const documentNotes = [quote.notes, settings?.quote_terms].filter(Boolean).join("\n\n");
  if (documentNotes && y < 265) {
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Notas", 16, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(doc.splitTextToSize(documentNotes, 120), 16, y + 6);
  }
  footer(doc, settings);
  doc.save(`cotizacion-${quote.folio}.pdf`);
}

export async function downloadPaymentReceiptPdf({
  project,
  payment,
  kindLabel,
  methodLabel,
}: ReceiptDocument) {
  const { jsPDF } = await import("jspdf");
  const { data: settings } = await getBusinessSettings();
  const doc = new jsPDF();
  header(doc, "RECIBO DE PAGO", project.folio, settings);
  label(
    doc,
    "Recibimos de",
    project.clients?.business_name || project.clients?.name || "Cliente",
    16,
    51,
  );
  label(doc, "Proyecto", project.name, 16, 70);
  label(
    doc,
    "Fecha de pago",
    date.format(new Date(`${payment.paid_at}T12:00:00`)),
    112,
    70,
  );
  doc.setFillColor(245, 242, 249);
  doc.roundedRect(16, 91, 178, 36, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...purple);
  doc.setFontSize(24);
  doc.text(money.format(payment.amount), 105, 113, { align: "center" });
  label(doc, "Concepto", kindLabel, 16, 145);
  label(doc, "Método", methodLabel, 112, 145);
  label(doc, "Referencia", payment.reference || "Sin referencia", 16, 164);
  label(doc, "Folio interno", payment.id.slice(0, 8).toUpperCase(), 112, 164);
  const receiptNotes = [payment.notes, settings?.receipt_notes].filter(Boolean).join(" · ");
  if (receiptNotes) label(doc, "Notas", receiptNotes, 16, 185);
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(
    "Este documento es un comprobante administrativo y no sustituye un comprobante fiscal.",
    105,
    252,
    { align: "center" },
  );
  footer(doc, settings);
  doc.save(`recibo-${project.folio}-${payment.paid_at}.pdf`);
}

export async function downloadFinanceReportPdf({
  projects,
  totals,
}: FinanceDocument) {
  const { jsPDF } = await import("jspdf");
  const { data: settings } = await getBusinessSettings();
  const doc = new jsPDF();
  header(doc, "REPORTE FINANCIERO", date.format(new Date()), settings);
  const profit = totals.collected - totals.expenses;
  label(doc, "Contratado", money.format(totals.contracted), 16, 49);
  label(doc, "Cobrado", money.format(totals.collected), 75, 49);
  label(doc, "Gastos", money.format(totals.expenses), 134, 49);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...purple);
  doc.text(`Utilidad: ${money.format(profit)}`, 16, 72);
  let y = 88;
  doc.setFillColor(245, 242, 249);
  doc.rect(16, y, 178, 9, "F");
  doc.setFontSize(8);
  doc.setTextColor(30);
  doc.text("PROYECTO", 19, y + 6);
  doc.text("CONTRATADO", 132, y + 6, { align: "right" });
  doc.text("COBRADO", 163, y + 6, { align: "right" });
  doc.text("UTILIDAD", 191, y + 6, { align: "right" });
  y += 15;
  for (const project of projects) {
    if (y > 260) {
      doc.addPage();
      header(doc, "REPORTE FINANCIERO", "Continuación", settings);
      y = 48;
    }
    doc.setFont("helvetica", "bold");
    doc.text(
      doc.splitTextToSize(`${project.folio} · ${project.name}`, 88),
      19,
      y,
    );
    doc.setFont("helvetica", "normal");
    doc.text(money.format(project.price), 132, y, { align: "right" });
    doc.text(money.format(project.collected), 163, y, { align: "right" });
    doc.text(money.format(project.collected - project.expenses), 191, y, {
      align: "right",
    });
    y += 7;
    doc.setTextColor(105);
    doc.text(
      project.clients?.business_name || project.clients?.name || "Cliente",
      19,
      y,
    );
    doc.setTextColor(30);
    y += 9;
    doc.setDrawColor(238);
    doc.line(16, y, 194, y);
    y += 6;
  }
  footer(doc, settings);
  doc.save(`reporte-financiero-${new Date().toISOString().slice(0, 10)}.pdf`);
}
