import { GoogleGenerativeAI, Schema, Type } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const cvSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Nom du candidat s'il est trouvé, sinon chaîne vide" },
    email: { type: Type.STRING, description: "Email du candidat s'il est trouvé, sinon chaîne vide" },
    phone: { type: Type.STRING, description: "Téléphone du candidat s'il est trouvé, sinon chaîne vide" },
    score: { type: Type.INTEGER, description: "Un entier entre 0 et 100 représentant la correspondance avec les critères" },
    summary: { type: Type.STRING, description: "Un résumé (en français, max 3 phrases) expliquant concisément pourquoi ce score a été attribué (points forts et points faibles)." }
  },
  required: ["name", "email", "phone", "score", "summary"]
};

export async function scorePdfCV(pdfBuffer: Buffer, jobCriteria: string): Promise<{ score: number, summary: string, name: string, email: string, phone: string }> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: cvSchema
      }
    });

    const prompt = `Tu es un expert en recrutement (RH) ultra compétent. On te donne un CV (sous forme de fichier PDF) et les critères d'une offre d'emploi. Ta mission est d'analyser le CV et de fournir un résultat JSON strict en suivant le schéma demandé.
CRITÈRES DE L'OFFRE :
${jobCriteria}`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: pdfBuffer.toString("base64"),
          mimeType: "application/pdf"
        }
      }
    ]);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    
    return {
      score: parsed.score || 0,
      summary: parsed.summary || "Erreur lors de la génération du résumé.",
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || ""
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 0, summary: "Erreur d'analyse par l'IA.", name: "", email: "", phone: "" };
  }
}

export async function scoreCV(cvText: string, jobCriteria: string): Promise<{ score: number, summary: string, name: string, email: string, phone: string }> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: cvSchema
      }
    });

    const prompt = `Tu es un expert en recrutement (RH) ultra compétent. On te donne un CV (sous forme de texte) et les critères d'une offre d'emploi. Ta mission est d'analyser le CV et de fournir un résultat JSON strict en suivant le schéma demandé.
CRITÈRES DE L'OFFRE :
${jobCriteria}

TEXTE DU CV :
${cvText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    
    return {
      score: parsed.score || 0,
      summary: parsed.summary || "Erreur lors de la génération du résumé.",
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || ""
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { score: 0, summary: "Erreur d'analyse par l'IA.", name: "", email: "", phone: "" };
  }
}

const interviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    technicalQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Liste de 3 à 5 questions techniques pertinentes au vu du CV et de l'offre."
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Liste de 2 à 3 questions comportementales ou situationnelles pertinentes."
    },
    weaknessesToProbe: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Liste de points faibles ou zones d'ombre du CV à creuser pendant l'entretien."
    }
  },
  required: ["technicalQuestions", "behavioralQuestions", "weaknessesToProbe"]
};

export async function generateInterviewGuide(cvText: string, jobCriteria: string): Promise<{ technicalQuestions: string[], behavioralQuestions: string[], weaknessesToProbe: string[] } | null> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: interviewSchema
      }
    });

    const prompt = `Tu es un expert en recrutement (RH) ultra compétent. Tu dois préparer un entretien pour un candidat dont voici le résumé ou texte du CV, postulant à l'offre suivante.
Génère un guide d'entretien structuré en JSON avec des questions précises (techniques et comportementales) adaptées aux forces et faiblesses du candidat.

CRITÈRES DE L'OFFRE :
${jobCriteria}

RÉSUMÉ/TEXTE DU CV DU CANDIDAT :
${cvText}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    
    return parsed;
  } catch (error) {
    console.error("Gemini Interview Generation Error:", error);
    return null;
  }
}
