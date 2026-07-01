import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ jobId: string, candidateId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { jobId, candidateId } = await context.params;
    const body = await request.json();
    const { notes } = body;

    const job = await prisma.job.findUnique({
      where: { id: jobId, userId: (session.user as any).id }
    });

    if (!job) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    const candidate = await prisma.candidate.update({
      where: { id: candidateId, jobId: job.id },
      data: { notes }
    });

    return NextResponse.json({ success: true, notes: candidate.notes });
  } catch (error) {
    console.error("API Notes Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
