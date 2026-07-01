"use client";

import { useState } from "react";
import CandidateCard from "./CandidateCard";
import { Search } from "lucide-react";

export default function CandidateList({ candidates, jobId }: { candidates: any[], jobId: string }) {
  const [search, setSearch] = useState("");

  const filteredCandidates = candidates.filter(c => 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
    (c.summary && c.summary.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-3 py-3.5 border border-slate-800 rounded-2xl leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm shadow-inner shadow-black/20"
          placeholder="Rechercher un candidat par nom, e-mail ou mot-clé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-6">
        {filteredCandidates.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Aucun candidat ne correspond à votre recherche.</p>
        ) : (
          filteredCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} jobId={jobId} />
          ))
        )}
      </div>
    </div>
  );
}
