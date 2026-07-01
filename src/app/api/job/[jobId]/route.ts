import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, context: { params: Promise<{ jobId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { jobId } = await context.params;

    const job = await prisma.job.findUnique({
      where: { id: jobId, userId: (session.user as any).id }
    });

    if (!job) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    await prisma.job.delete({
      where: { id: jobId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Delete Job Error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
