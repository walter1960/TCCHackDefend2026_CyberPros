"use client";

import { useState } from "react";
import { Mail, Phone, FileText, ChevronDown, ChevronUp, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CandidateCard({ candidate, jobId }: { candidate: any, jobId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [interviewGuide, setInterviewGuide] = useState<any>(
    candidate.interviewGuide ? JSON.parse(candidate.interviewGuide) : null
  );
  const [showGuide, setShowGuide] = useState(false);

  const handleGenerateInterview = async () => {
    if (interviewGuide) {
      setShowGuide(!showGuide);
      return;
    }

    setIsGenerating(true);
    setShowGuide(true);
    try {
      const res = await fetch(`/api/job/${jobId}/candidate/${candidate.id}/interview`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewGuide(data);
      } else {
        console.error("Erreur génération entretien");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-indigo-500/20 bg-slate-900 p-6 shadow-lg shadow-indigo-500/5"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold text-white">{candidate.name || "Candidat Anonyme"}</h3>
            <div className="flex items-center justify-center h-8 px-3 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold">
              Score: {candidate.score}%
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-300">
            {candidate.email && (
              <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <Mail className="h-4 w-4" /> {candidate.email}
              </a>
            )}
            {candidate.phone && (
              <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                <Phone className="h-4 w-4" /> {candidate.phone}
              </a>
            )}
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mt-4">
            <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Avis de l'IA</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{candidate.summary}</p>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col justify-center items-center gap-4">
          <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800 text-center w-full">
            <FileText className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 mb-2">Analyse Native</p>
          </div>
          <button
            onClick={handleGenerateInterview}
            disabled={isGenerating}
            className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-indigo-600/10 border border-indigo-500/30 px-4 py-3 text-sm font-semibold text-indigo-300 transition-all hover:bg-indigo-600 hover:text-white active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
            {interviewGuide ? (showGuide ? "Masquer l'entretien" : "Voir l'entretien") : "Préparer l'entretien"}
            {interviewGuide && !isGenerating && (
              showGuide ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-6"
          >
            <div className="pt-6 border-t border-slate-800">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                  <p className="text-sm text-slate-400">Génération du guide d'entretien sur-mesure...</p>
                </div>
              ) : interviewGuide ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Technical Questions */}
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
                    <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      Questions Techniques
                    </h4>
                    <ul className="space-y-3">
                      {interviewGuide.technicalQuestions?.map((q: string, i: number) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-blue-500/50 mt-0.5">•</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Behavioral Questions */}
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-800">
                    <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      Questions Comportementales
                    </h4>
                    <ul className="space-y-3">
                      {interviewGuide.behavioralQuestions?.map((q: string, i: number) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-purple-500/50 mt-0.5">•</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses to probe */}
                  <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 lg:col-span-2">
                    <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400" />
                      Points d'attention à creuser
                    </h4>
                    <ul className="space-y-3">
                      {interviewGuide.weaknessesToProbe?.map((q: string, i: number) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-orange-500/50 mt-0.5">•</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-red-400">
                  Erreur lors de la génération. Veuillez réessayer.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
