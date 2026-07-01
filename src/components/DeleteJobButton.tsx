"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ? Tous les CV associés seront supprimés. Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/job/${jobId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Erreur lors de la suppression de l'offre.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 border border-red-500/20 transition-all hover:bg-red-500/20 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Supprimer l'offre
    </button>
  );
}
