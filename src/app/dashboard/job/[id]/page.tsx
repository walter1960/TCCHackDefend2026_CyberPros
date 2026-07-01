import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, Mail, Phone, RefreshCw } from "lucide-react";
import ScanButton from "@/components/ScanButton";
import CandidateCard from "@/components/CandidateCard";
import DeleteJobButton from "@/components/DeleteJobButton";

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const job = await prisma.job.findUnique({
    where: { 
      id,
      userId: (session.user as any)?.id 
    },
    include: {
      candidates: {
        orderBy: { score: 'desc' },
      }
    }
  });

  if (!job) {
    return <div>Offre introuvable.</div>;
  }

  // AI has filtered top candidates if they exist and are SELECTED
  const selectedCandidates = job.candidates.filter(c => c.status === "SELECTED").slice(0, job.targetCount);
  const pendingOrRejected = job.candidates.filter(c => c.status !== "SELECTED");

  const isArchived = job.status === "ARCHIVED" || (job.deadline && new Date(job.deadline) < new Date());

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Link>
        <DeleteJobButton jobId={job.id} />
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{job.title}</h1>
              {isArchived && (
                <span className="inline-flex items-center rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 border border-red-500/20">
                  Clôturée
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-2 line-clamp-2">{job.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <span className="block text-2xl font-bold text-indigo-400">{job.candidates.length}</span>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">CV Analysés</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-center">
              <span className="block text-2xl font-bold text-green-400">{selectedCandidates.length} / {job.targetCount}</span>
              <span className="block text-xs text-slate-500 uppercase tracking-wider font-semibold">Sélectionnés</span>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Critères demandés à l'IA</h3>
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
            <p className="font-mono text-sm text-slate-400 whitespace-pre-wrap">{job.criteria}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-green-400" />
          Les {job.targetCount} Meilleurs Profils
        </h2>
        {!isArchived && <ScanButton jobId={job.id} />}
      </div>

      {selectedCandidates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/50 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 mb-4">
            <RefreshCw className="h-6 w-6 text-slate-500 animate-spin-slow" />
          </div>
          <h3 className="text-lg font-medium text-slate-300">En attente de CV...</h3>
          <p className="mt-2 text-sm text-slate-500">
            L'application scanne automatiquement votre boîte mail pour trouver des CV correspondant à vos critères.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {selectedCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} jobId={job.id} />
          ))}
        </div>
      )}
      
      {pendingOrRejected.length > 0 && (
         <div className="mt-12 pt-8 border-t border-slate-800">
           <h3 className="text-lg font-medium text-slate-400 mb-4">Autres candidats filtrés ({pendingOrRejected.length})</h3>
           {/* Can list them minimally here */}
         </div>
      )}
    </div>
  );
}
