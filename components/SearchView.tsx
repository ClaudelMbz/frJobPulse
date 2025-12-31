
import React, { useState, useEffect } from 'react';
import { generateApplicationPackage } from '../services/geminiService';
import { MasterProfile, ApplicationPackage, ApplicationType } from '../types';
import { FileText, Loader2, Sparkles, BrainCircuit, CheckCircle2, Download, ClipboardPaste, Zap, AlertTriangle, UserCheck, Eye, RefreshCw, LayoutTemplate, Calendar, GraduationCap } from 'lucide-react';
import { downloadCvPdf, downloadLetterPdf } from '../utils/pdfGenerator';

export const SearchView: React.FC = () => {
  const [jobDescription, setJobDescription] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [appType, setAppType] = useState<ApplicationType>('alternance');
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [generatedPackage, setGeneratedPackage] = useState<ApplicationPackage | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewMode, setPreviewMode] = useState<'cv' | 'letter' | null>(null);

  useEffect(() => {
    const scrapedData = sessionStorage.getItem('jobpulse_temp_job_description');
    if (scrapedData) {
      setJobDescription(scrapedData);
      sessionStorage.removeItem('jobpulse_temp_job_description');
    }
  }, []);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setErrorMessage("Veuillez coller la description de l'offre d'emploi.");
      setGenerationStatus('error');
      return;
    }

    const savedProfile = localStorage.getItem('jobpulse_master_profile');
    if (!savedProfile) {
      setErrorMessage("Profil manquant ! Complétez d'abord l'onglet 'Mon Profil' pour que l'IA puisse travailler.");
      setGenerationStatus('error');
      return;
    }

    const profile: MasterProfile = JSON.parse(savedProfile);
    setLoading(true);
    setGenerationStatus('analyzing');
    setErrorMessage('');
    setPreviewMode(null);

    try {
      const result = await generateApplicationPackage(
        profile, 
        { title: "Extraction...", company: "...", location: "France", url: "", snippet: "", source: "Direct" }, 
        jobDescription,
        appType
      );
      setGeneratedPackage(result);
      setGenerationStatus('ready');
    } catch (error) {
      console.error(error);
      setErrorMessage("Erreur lors de la génération. Le texte de l'offre est-il trop court ou mal formaté ?");
      setGenerationStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCv = () => {
    if (!generatedPackage) return;
    downloadCvPdf(generatedPackage.optimizedProfile, generatedPackage.extractedJobTitle);
  };

  const handleDownloadLetter = () => {
    if (!generatedPackage) return;
    downloadLetterPdf(
      generatedPackage.optimizedProfile, 
      generatedPackage.extractedCompany, 
      generatedPackage.extractedJobTitle, 
      generatedPackage.coverLetter
    );
  };

  const reset = () => {
    setJobDescription('');
    setGeneratedPackage(null);
    setGenerationStatus('idle');
    setPreviewMode(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col min-h-full animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-indigo-400" size={32} />
          Générateur de Candidature <span className="text-indigo-500">Elite</span>
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Collez le texte de l'offre. L'IA adapte votre CV et votre lettre selon le mode choisi (Alternance ou Stage).
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Input Side */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-bold flex items-center gap-2">
                 <ClipboardPaste size={18} className="text-indigo-400" />
                 Texte de l'offre d'emploi
               </h3>
               {jobDescription && (
                 <button onClick={reset} className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
                   <RefreshCw size={12} /> Réinitialiser
                 </button>
               )}
            </div>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Ex: 'Nous recherchons un Développeur Full Stack...'"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 h-80 focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600 custom-scrollbar text-sm leading-relaxed font-sans mb-4"
            />

            {/* Nouveau Menu Type de Candidature */}
            <div className="mb-6">
              <label className="block text-slate-400 text-[10px] uppercase font-bold mb-3 tracking-widest text-center">Type de Candidature Souhaité</label>
              <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-1.5">
                <button 
                  onClick={() => setAppType('alternance')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${appType === 'alternance' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                >
                  <Calendar size={16} />
                  Alternance
                </button>
                <button 
                  onClick={() => setAppType('stage')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${appType === 'stage' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}
                >
                  <GraduationCap size={18} />
                  Stage
                </button>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !jobDescription.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
              {loading ? 'Extraction & Optimisation...' : 'Générer ma Candidature'}
            </button>
          </div>

          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5 flex items-start gap-4">
             <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 shrink-0">
               <BrainCircuit size={20} />
             </div>
             <div className="text-xs">
               <h4 className="text-white font-bold mb-1">Moteur d'Optimisation ATS</h4>
               <p className="text-slate-400 leading-snug">
                 {appType === 'alternance' 
                   ? "Mode Alternance : Injection du rythme 3 mois / 3 mois (Sept 2026)." 
                   : "Mode Stage : Ciblage 3 mois à partir de fin mai 2026."}
               </p>
             </div>
          </div>
        </div>

        {/* Output Side */}
        <div className="xl:col-span-7">
          {generationStatus === 'idle' && (
            <div className="h-[600px] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-600 gap-6 p-8 text-center">
              <div className="p-8 bg-slate-800/30 rounded-full ring-1 ring-slate-800">
                <LayoutTemplate size={64} className="opacity-20" />
              </div>
              <div>
                <p className="text-xl font-medium text-slate-500">Prêt pour la génération</p>
                <p className="text-sm max-w-xs mt-2">Dès que vous collerez une offre, votre CV Harvard Style et votre lettre apparaîtront ici.</p>
              </div>
            </div>
          )}

          {generationStatus === 'analyzing' && (
             <div className="h-[600px] bg-slate-800/30 border border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
                  <Loader2 size={64} className="text-indigo-500 animate-spin relative" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Chirurgie de Profil ({appType})...</h3>
                <p className="text-slate-400 max-w-sm">
                  Nous adaptons vos expériences, extrayons les mots-clés et incluons vos dates de disponibilité spécifiques.
                </p>
             </div>
          )}

          {generationStatus === 'error' && (
            <div className="bg-red-900/10 border border-red-500/30 rounded-2xl p-8 flex flex-col items-center text-center animate-in slide-in-from-top-4">
              <AlertTriangle size={48} className="text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Erreur Technique</h3>
              <p className="text-red-200 mb-6 text-sm">{errorMessage}</p>
              <button onClick={() => setGenerationStatus('idle')} className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">Réessayer</button>
            </div>
          )}

          {generationStatus === 'ready' && generatedPackage && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-xl ring-1 ring-emerald-500/10">
                 <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-white mb-1">Documents {appType === 'alternance' ? 'Alternance' : 'Stage'} Prêts !</h3>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Matching ATS :</span>
                      <span className="text-emerald-400 font-bold text-lg">{generatedPackage.matchScore}%</span>
                    </div>
                    <p className="text-xs text-indigo-400 mt-1 font-medium">{generatedPackage.extractedJobTitle} @ {generatedPackage.extractedCompany}</p>
                 </div>
                 <div className="flex flex-col gap-2 w-full md:w-auto">
                    <button onClick={handleDownloadCv} className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all shadow-lg active:scale-95">
                      <Download size={18} /> Télécharger CV
                    </button>
                    <button onClick={handleDownloadLetter} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg active:scale-95">
                      <FileText size={18} /> Télécharger Lettre
                    </button>
                 </div>
              </div>

              {/* Preview Controls */}
              <div className="bg-slate-800/80 rounded-xl p-1 flex border border-slate-700 shadow-inner">
                 <button 
                  onClick={() => setPreviewMode(previewMode === 'cv' ? null : 'cv')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${previewMode === 'cv' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                   <UserCheck size={16} /> Aperçu CV Optimisé
                 </button>
                 <button 
                  onClick={() => setPreviewMode(previewMode === 'letter' ? null : 'letter')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${previewMode === 'letter' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                 >
                   <Eye size={16} /> Aperçu Lettre
                 </button>
              </div>

              {previewMode === 'letter' && (
                <div className="bg-white text-slate-900 p-10 rounded-2xl shadow-2xl font-serif text-sm leading-relaxed max-h-[600px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-4 duration-300">
                  <div className="whitespace-pre-wrap">
                    {generatedPackage.coverLetter}
                  </div>
                </div>
              )}

              {previewMode === 'cv' && (
                 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                       <div>
                         <h4 className="text-white font-bold text-2xl uppercase tracking-tighter">{generatedPackage.optimizedProfile.fullName}</h4>
                         <p className="text-indigo-400 font-bold text-sm mt-1">{generatedPackage.extractedJobTitle}</p>
                       </div>
                       <div className="text-right text-[10px] text-slate-500 space-y-0.5 uppercase tracking-wider font-bold">
                          <p>{generatedPackage.optimizedProfile.email}</p>
                          <p>{generatedPackage.optimizedProfile.phone}</p>
                          <p>{generatedPackage.optimizedProfile.location}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                       <h5 className="text-white font-bold text-xs uppercase border-l-4 border-indigo-600 pl-3">Résumé Professionnel</h5>
                       <p className="text-slate-400 italic text-sm leading-relaxed">{generatedPackage.optimizedProfile.bio}</p>
                    </div>

                    <div className="space-y-4">
                       <h5 className="text-white font-bold text-xs uppercase border-l-4 border-indigo-600 pl-3">Expériences (Aperçu)</h5>
                       {generatedPackage.optimizedProfile.experiences.slice(0, 2).map((exp, i) => (
                         <div key={i} className="bg-slate-800/20 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between font-bold text-white text-sm">
                                <span>{exp.role}</span>
                                <span className="text-slate-500 font-normal text-xs">{exp.startDate} - {exp.isCurrent ? 'Présent' : exp.endDate}</span>
                            </div>
                            <div className="text-xs text-indigo-500 mb-3">{exp.company}</div>
                            <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">{exp.description}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              )}

              {!previewMode && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 animate-in fade-in duration-500">
                   <h4 className="text-white font-bold mb-5 flex items-center gap-2">
                     <BrainCircuit size={18} className="text-indigo-400" />
                     Analyse des Gaps & Points Forts
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-900/60 p-5 rounded-xl border border-emerald-500/10">
                        <span className="text-[10px] text-emerald-400 uppercase font-extrabold block mb-3 tracking-widest">Points Forts Détectés</span>
                        <div className="text-slate-300 text-sm leading-snug">✓ Alignement sur les compétences clés : <span className="text-white font-medium">{generatedPackage.optimizedProfile.skills.split(',').slice(0,3).join(', ')}</span>.</div>
                      </div>
                      <div className="bg-slate-900/60 p-5 rounded-xl border border-red-500/10">
                        <span className="text-[10px] text-red-400 uppercase font-extrabold block mb-3 tracking-widest">Mots-clés manquants</span>
                        <div className="flex flex-wrap gap-2">
                          {generatedPackage.missingSkills.length > 0 ? (
                            generatedPackage.missingSkills.map((s, i) => (
                              <span key={i} className="text-[10px] bg-red-900/20 text-red-400 px-2 py-1 rounded border border-red-500/10 font-medium">{s}</span>
                            ))
                          ) : <span className="text-slate-500 text-xs italic">Aucun gap majeur détecté.</span>}
                        </div>
                      </div>
                   </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
