
import { MasterProfile, Experience, Project, Education, Certification } from '../types';
import { Save, User, Briefcase, Code, GraduationCap, Plus, Trash2, AlertCircle, CheckCircle2, Download, Upload, ArrowRight, CalendarClock, Award, Heart, Languages, Github } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const EMPTY_PROFILE: MasterProfile = {
  fullName: 'Claudel Mubenzem',
  email: 'claudelmubenzem90@gmail.com',
  phone: '+33 605961489',
  location: '91100 Corbeil-Essonnes, France',
  linkedin: 'https://www.linkedin.com/in/claudel-mubenzem-47a9ba24b',
  github: 'https://github.com/ClaudelMbz',
  portfolio: '',
  bio: "étudiant ingénieur à l'icam, je recherche une alternance de 24 mois avec un rythme de 3 mois / 3 mois. passionné par l'ia et le développement web, je suis spécialisé en conception de systèmes backend (node.js, python), automatisation de workflows et scraping. expert dans la transformation de données brutes en outils stratégiques.",
  availability: "recherche d'alternance de 24 mois (rythme 3 mois / 3 mois) à partir de septembre 2026",
  skills: 'TypeScript, Node.js, React, MongoDB, Python, Scraping, n8n, ETL, Docker, Git, Méthodologie Agile',
  languages: 'Francais (natif), Anglais (Courant)',
  interests: 'Sports (Foot, Basket), Lecture, Internet, Méditation, Musique',
  certifications: [
    {
      id: 'cert-1',
      name: 'Associate Python Developper',
      issuer: 'Datacamp',
      date: 'Novembre 2025'
    },
    {
      id: 'cert-2',
      name: 'CS50 Artificial Intelligence with Python',
      issuer: 'Harvard Online',
      date: 'Juillet 2025'
    },
    {
      id: 'cert-3',
      name: 'Google Analytics 4',
      issuer: 'Google',
      date: 'Juin 2023'
    }
  ],
  experiences: [
    {
      id: 'dbd-sarl-1',
      company: 'DBD SARL',
      role: 'Data Analyst & Implémentation Industrielle (Stage)',
      startDate: '2025-06',
      endDate: '2025-08',
      isCurrent: false,
      description: "• Optimisé les processus industriels via l’analyse de données et l’automatisation, réduisant les délais opérationnels d’environ 20%.\n• Conçu et déployé des pipelines ETL automatisés avec n8n, permettant un gain de 1–2 heures par jour sur le reporting des ventes.\n• Modélisé et structuré des données complexes (coûts, logistique, ressources machines), améliorant la fiabilité des analyses et la prise de décision stratégique.\n• Collaboration étroite avec les équipes tech pour la mise en place de dashboards de suivi en temps réel."
    }
  ],
  projects: [
    {
      id: 'promptforge-1',
      name: 'PromptForge – Extension IA & RAG',
      technologies: 'Node.js, Qdrant, n8n, Gemini API',
      description: "Création d'une solution d'optimisation de prompts intégrant une architecture RAG. Orchestration de workflows n8n pour connecter les APIs de ChatGPT et Gemini."
    }
  ],
  education: [
    {
      id: 'icam-1',
      school: 'ICAM',
      degree: 'Bachelor en Science de l\'Ingénieur (Polytechnique)',
      startDate: '2025-09',
      endDate: '2028-08'
    }
  ]
};

interface ProfileViewProps {
  onNavigateToSearch?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigateToSearch }) => {
  const [profile, setProfile] = useState<MasterProfile>(EMPTY_PROFILE);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('jobpulse_master_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({ 
          ...EMPTY_PROFILE, 
          ...parsed,
          certifications: Array.isArray(parsed.certifications) ? parsed.certifications : EMPTY_PROFILE.certifications
        });
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  const handleSave = () => {
    setStatus('saving');
    localStorage.setItem('jobpulse_master_profile', JSON.stringify(profile));
    setTimeout(() => setStatus('saved'), 500);
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mon_profil_jobpulse.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedProfile = JSON.parse(content);
        if (parsedProfile && typeof parsedProfile === 'object') {
          const newProfile = { 
            ...EMPTY_PROFILE, 
            ...parsedProfile,
            certifications: Array.isArray(parsedProfile.certifications) ? parsedProfile.certifications : []
          };
          setProfile(newProfile);
          localStorage.setItem('jobpulse_master_profile', JSON.stringify(newProfile));
          setStatus('saved');
          setTimeout(() => setStatus('idle'), 3000);
        } else {
          alert("Le fichier JSON semble invalide.");
        }
      } catch (error) {
        console.error("Error parsing JSON", error);
        alert("Erreur lors de la lecture du fichier.");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const updateField = (field: keyof MasterProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addItem = (key: 'experiences' | 'projects' | 'education' | 'certifications', emptyItem: any) => {
    setProfile(prev => ({
      ...prev,
      [key]: [...(prev[key] as any[]), { ...emptyItem, id: crypto.randomUUID() }]
    }));
  };

  const removeItem = (key: keyof MasterProfile, id: string) => {
    setProfile(prev => {
      const list = prev[key];
      if (Array.isArray(list)) {
        return {
          ...prev,
          [key]: list.filter((item: any) => item.id !== id)
        };
      }
      return prev;
    });
  };

  const updateItem = (key: keyof MasterProfile, id: string, field: string, value: string | boolean) => {
    setProfile(prev => {
      const list = prev[key];
      if (Array.isArray(list)) {
        return {
          ...prev,
          [key]: list.map((item: any) => 
            item.id === id ? { ...item, [field]: value } : item
          )
        };
      }
      return prev;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sticky top-0 bg-slate-900/90 backdrop-blur z-20 py-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <User className="text-indigo-500" />
            Mon Profil
          </h1>
          <p className="text-slate-400 text-sm">Base de données utilisée par l'IA pour générer vos CVs.</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
          <button onClick={handleImportClick} className="btn-secondary hidden sm:flex items-center gap-2 px-3 py-2 rounded border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" title="Importer"><Upload size={18} /></button>
          <button onClick={handleExport} className="btn-secondary hidden sm:flex items-center gap-2 px-3 py-2 rounded border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800" title="Exporter"><Download size={18} /></button>
          <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${status === 'saved' ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
            {status === 'saved' ? <CheckCircle2 size={20} /> : <Save size={20} />}
            {status === 'saved' ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
          {onNavigateToSearch && (
             <button onClick={onNavigateToSearch} className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 ml-2">
               Chercher un Job <ArrowRight size={18} />
             </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><User size={20} className="text-indigo-400" /> Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Nom Complet" value={profile.fullName} onChange={v => updateField('fullName', v)} />
            <Input label="Email" value={profile.email} onChange={v => updateField('email', v)} />
            <Input label="Téléphone" value={profile.phone} onChange={v => updateField('phone', v)} />
            <Input label="Localisation" value={profile.location} onChange={v => updateField('location', v)} />
            <Input label="LinkedIn URL" value={profile.linkedin} onChange={v => updateField('linkedin', v)} />
            <Input label="GitHub URL" value={profile.github} onChange={v => updateField('github', v)} />
            <Input label="Portfolio" value={profile.portfolio} onChange={v => updateField('portfolio', v)} />
          </div>
          <div className="mb-4">
             <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-2"><CalendarClock size={14} className="text-indigo-400" /> Disponibilité</label>
             <input className="w-full bg-slate-900 border border-indigo-900/50 rounded-lg px-3 py-2 text-indigo-100 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-bold" value={profile.availability} onChange={(e) => updateField('availability', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-2"><Languages size={14} className="text-indigo-400" /> Langues</label>
              <input className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none" value={profile.languages} onChange={(e) => updateField('languages', e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-2"><Heart size={14} className="text-indigo-400" /> Intérêts</label>
              <input className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none" value={profile.interests} onChange={(e) => updateField('interests', e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Bio / Résumé Professionnel</label>
            <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.bio} onChange={(e) => updateField('bio', e.target.value)} />
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase size={20} className="text-indigo-400" /> Expériences</h2>
            <button onClick={() => addItem('experiences', { company: '', role: '', location: '', startDate: '', endDate: '', isCurrent: false, description: '' })} className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"><Plus size={16} /> Ajouter</button>
          </div>
          <div className="space-y-4">
            {profile.experiences.map((exp) => (
              <div key={exp.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative group">
                <button onClick={() => removeItem('experiences', exp.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8"><Input label="Entreprise" value={exp.company} onChange={v => updateItem('experiences', exp.id, 'company', v)} /><Input label="Rôle" value={exp.role} onChange={v => updateItem('experiences', exp.id, 'role', v)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3"><Input type="text" label="Début (YYYY-MM)" value={exp.startDate} onChange={v => updateItem('experiences', exp.id, 'startDate', v)} />{!exp.isCurrent && <Input type="text" label="Fin (YYYY-MM)" value={exp.endDate} onChange={v => updateItem('experiences', exp.id, 'endDate', v)} />}<div className="flex items-end pb-3"><label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer"><input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateItem('experiences', exp.id, 'isCurrent', e.target.checked)} className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500" />En poste</label></div></div>
                <label className="block text-slate-500 text-[10px] uppercase font-bold mb-1">Missions & Résultats (KPIs)</label>
                <textarea className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white h-32 focus:ring-2 focus:ring-indigo-500 outline-none" value={exp.description} onChange={(e) => updateItem('experiences', exp.id, 'description', e.target.value)} />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
           <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Code size={20} className="text-indigo-400" /> Compétences</h2>
           <div className="mb-4">
            <label className="block text-slate-400 text-sm font-semibold mb-2">Skills (séparés par des virgules)</label>
            <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={profile.skills} onChange={(e) => updateField('skills', e.target.value)} />
          </div>
        </section>

        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Award size={20} className="text-indigo-400" /> Certifications</h2>
            <button onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })} className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"><Plus size={16} /> Ajouter</button>
          </div>
          <div className="space-y-4">
            {profile.certifications.map((cert) => (
              <div key={cert.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative group">
                <button onClick={() => removeItem('certifications', cert.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                  <Input label="Certification" value={cert.name} onChange={v => updateItem('certifications', cert.id, 'name', v)} />
                  <Input label="Organisme" value={cert.issuer} onChange={v => updateItem('certifications', cert.id, 'issuer', v)} />
                  <Input label="Date" value={cert.date} onChange={v => updateItem('certifications', cert.id, 'date', v)} />
                </div>
              </div>
            ))}
          </div>
        </section>

         <section className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><GraduationCap size={20} className="text-indigo-400" /> Formation</h2>
            <button onClick={() => addItem('education', { school: '', degree: '', startDate: '', endDate: '' })} className="flex items-center gap-1 text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors"><Plus size={16} /> Ajouter</button>
          </div>
          <div className="space-y-4">
            {profile.education.map((edu) => (
              <div key={edu.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative group">
                <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8 mb-3"><Input label="École" value={edu.school} onChange={v => updateItem('education', edu.id, 'school', v)} /><Input label="Diplôme" value={edu.degree} onChange={v => updateItem('education', edu.id, 'degree', v)} /></div>
                <div className="grid grid-cols-2 gap-4"><Input type="text" label="Début" value={edu.startDate} onChange={v => updateItem('education', edu.id, 'startDate', v)} /><Input type="text" label="Fin" value={edu.endDate} onChange={v => updateItem('education', edu.id, 'endDate', v)} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label className="block text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">{label}</label>
    <input type={type} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);
