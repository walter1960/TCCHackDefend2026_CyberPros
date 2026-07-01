import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id: jobId } = await context.params;
    const job = await prisma.job.findUnique({
      where: { id: jobId, userId: (session.user as any).id },
      include: {
        candidates: {
          where: { status: "SELECTED" },
          orderBy: { score: "desc" }
        }
      }
    });

    if (!job) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const rows = [
      ["Nom", "Email", "Téléphone", "Score", "Statut", "Avis de l'IA"].join(";"),
      ...job.candidates.map(c => 
        [
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${(c.email || '').replace(/"/g, '""')}"`,
          `"${(c.phone || '').replace(/"/g, '""')}"`,
          c.score,
          c.status,
          `"${(c.summary || '').replace(/"/g, '""')}"`
        ].join(";")
      )
    ];

    const csvContent = "\uFEFF" + rows.join("\n"); // UTF-8 BOM pour Excel

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="candidats-${job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv"`
      }
    });

  } catch (error) {
    console.error("Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
