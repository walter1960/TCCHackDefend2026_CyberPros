import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInterviewGuide } from "@/lib/gemini";

export async function POST(request: Request, context: { params: Promise<{ jobId: string, candidateId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { jobId, candidateId } = await context.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId, userId: (session.user as any).id }
    });

    if (!job) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId, jobId: job.id }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidat introuvable" }, { status: 404 });
    }

    if (candidate.interviewGuide) {
      return NextResponse.json(JSON.parse(candidate.interviewGuide));
    }

    const cvTextToAnalyze = candidate.cvText && candidate.cvText.length > 50 
      ? candidate.cvText 
      : candidate.summary || "Aucun détail disponible";

    const guide = await generateInterviewGuide(cvTextToAnalyze, job.criteria);

    if (!guide) {
      return NextResponse.json({ error: "Erreur lors de la génération du guide" }, { status: 500 });
    }

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { interviewGuide: JSON.stringify(guide) }
    });

    return NextResponse.json(guide);
  } catch (error) {
    console.error("API Interview Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
