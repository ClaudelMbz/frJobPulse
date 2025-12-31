
import { GoogleGenAI, Type } from "@google/genai";
import { JobSearchResult, MasterProfile, ApplicationPackage, ApplicationType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const GENERATION_MODEL = "gemini-3-pro-preview";

/**
 * Normalise les textes pour s'assurer que les mentions de contrat sont en minuscules
 */
const normalizeContractText = (text: string): string => {
  return text
    .replace(/ALTERNANCE DE 24 MOIS/gi, "alternance de 24 mois")
    .replace(/RYTHME DE 3 MOIS \/ 3 MOIS/gi, "rythme de 3 mois / 3 mois")
    .replace(/STAGE DE 3 MOIS/gi, "stage de 3 mois")
    .replace(/FIN MAI 2026/gi, "fin mai 2026")
    .replace(/SEPTEMBRE 2026/gi, "septembre 2026");
};

export const generateApplicationPackage = async (
  profile: MasterProfile,
  job: JobSearchResult,
  fullDescription: string,
  type: ApplicationType = 'alternance'
): Promise<ApplicationPackage> => {
  try {
    const targetPhrase = type === 'alternance' 
      ? "alternance de 24 mois avec un rythme de 3 mois / 3 mois à partir de septembre 2026"
      : "stage de 3 mois à partir de fin mai 2026";

    const prompt = `
      ROLE: Expert Recruteur Tech & Spécialiste ATS.
      OBJECTIF: Adapter le profil pour une candidature de type ${type.toUpperCase()}.

      OFFRE D'EMPLOI :
      """
      ${fullDescription}
      """

      PROFIL MASTER ORIGINAL :
      ${JSON.stringify(profile)}

      CONSIGNES CRITIQUES :
      1. PROFIL PROFESSIONNEL (bio) : Adapte ce texte à l'offre. Inclus obligatoirement la phrase suivante exactement : "${targetPhrase}" en minuscules.
      
      2. COMPÉTENCES TECHNIQUES (skills) : 
         - Sélectionne les 10 compétences les plus stratégiques.
         - IMPORTANT : Tous les mots-clés que tu détectes comme "manquants" (absents du profil master mais requis par l'offre) DOIVENT ÊTRE OBLIGATOIREMENT INCLUS dans cette liste de compétences techniques pour le CV.
      
      3. ABRÉVIATIONS TECHNIQUES : INTERDICTION ABSOLUE d'expliquer les abréviations. Ne jamais ajouter de parenthèses explicatives. 
         - CORRECT: "NLP", "ETL", "RAG", "API".
         - INCORRECT: "NLP (Natural Language Processing)", "ETL (Extract Transform Load)".
      
      4. RESTRICTION DE MODIFICATION : INTERDICTION de modifier les Expériences, Projets, Formations, Certifications, Langues et Intérêts. Garde les textes originaux du Profil Master à 100%.
      
      5. LETTRE DE MOTIVATION :
         - Rédige UNIQUEMENT le corps (Madame, Monsieur...).
         - Maximum 250 mots. Justifie ton intérêt pour ce ${type}.
         - Mentionne obligatoirement le type de contrat ("${targetPhrase}") en minuscules dans le texte.
         - INTERDICTION : Pas de signature, pas de formule de politesse finale, pas d'objet. Termine après ton dernier argument.

      FORMAT DE RÉPONSE JSON:
      { 
        "matchScore": number, 
        "missingSkills": string[], 
        "extractedJobTitle": string, 
        "extractedCompany": string,
        "optimizedProfile": MasterProfile, 
        "coverLetter": string, 
        "analysis": string 
      }
    `;

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        temperature: 0.1
      },
    });

    let resultText = response.text;
    if (!resultText) throw new Error("Réponse vide.");
    
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(resultText) as ApplicationPackage;
    
    // Sécurité : Réinjection des champs non-modifiables
    data.optimizedProfile.experiences = profile.experiences;
    data.optimizedProfile.education = profile.education;
    data.optimizedProfile.projects = profile.projects;
    data.optimizedProfile.certifications = profile.certifications;
    data.optimizedProfile.languages = profile.languages;
    data.optimizedProfile.interests = profile.interests;

    // Normalisation des textes de contrat
    if (data.optimizedProfile?.bio) {
      data.optimizedProfile.bio = normalizeContractText(data.optimizedProfile.bio);
    }
    if (data.coverLetter) {
      data.coverLetter = normalizeContractText(data.coverLetter);
    }
    
    // GESTION DES SKILLS : S'assurer que les missingSkills sont bien présents dans la liste finale
    let finalSkillsArray: string[] = [];
    if (Array.isArray(data.optimizedProfile.skills)) {
      finalSkillsArray = [...(data.optimizedProfile.skills as any)];
    } else if (typeof data.optimizedProfile.skills === 'string') {
      finalSkillsArray = data.optimizedProfile.skills.split(',').map(s => s.trim());
    }

    // On force l'ajout des missingSkills s'ils n'y sont pas déjà
    if (data.missingSkills && Array.isArray(data.missingSkills)) {
      data.missingSkills.forEach(skill => {
        const exists = finalSkillsArray.some(s => s.toLowerCase() === skill.toLowerCase());
        if (!exists && skill.trim() !== "") {
          finalSkillsArray.unshift(skill.trim()); // On les met au début pour plus d'impact
        }
      });
    }

    // On limite à 12 pour ne pas casser la mise en page PDF
    data.optimizedProfile.skills = finalSkillsArray.slice(0, 12).join(', ');

    return data;
  } catch (error) { 
    console.error(error); 
    throw error; 
  }
};
