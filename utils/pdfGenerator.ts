
import { jsPDF } from "jspdf";
import { MasterProfile } from "../types";

const MARGIN = 12; 
const FONT_BODY = "helvetica";
const COLOR_PRIMARY = [30, 58, 138]; 
const COLOR_ACCENT = [79, 70, 229];  
const COLOR_TEXT = [30, 41, 59];    
const COLOR_SUBTLE = [100, 116, 139]; 
const COLOR_BLACK = [15, 23, 42];    

const cleanText = (text: any): string => {
  if (!text) return "";
  return String(text)
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^#+\s/gm, '')
    .trim();
};

const formatPhone = (phone: string): string => {
  if (!phone) return "";
  const p = phone.replace(/\s/g, '');
  return p.startsWith('0') ? '+33 ' + p.substring(1) : p;
};

export const downloadCvPdf = (profile: MasterProfile, targetJobTitle: string) => {
  const doc = new jsPDF();
  let y = MARGIN;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (MARGIN * 2);

  const checkPageOverflow = (needed: number) => {
    if (y + needed > pageHeight - MARGIN) {
      doc.addPage();
      y = MARGIN;
      return true;
    }
    return false;
  };

  const drawSectionHeader = (title: string) => {
    checkPageOverflow(12);
    y += 3;
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(title.toUpperCase(), MARGIN, y);
    
    y += 1;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, MARGIN + contentWidth, y);
    y += 4;
  };

  // --- HEADER CV ---
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(22); 
  doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
  doc.text(cleanText(profile.fullName).toUpperCase(), MARGIN, y + 5);
  
  doc.setFontSize(11);
  doc.setTextColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
  doc.text(cleanText(targetJobTitle), MARGIN, y + 10);

  const contactX = pageWidth - MARGIN;
  let contactY = y + 1.5;
  
  const drawContactLine = (label: string, value: string, url?: string) => {
    if (!value) return;
    doc.setFont(FONT_BODY, "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLOR_SUBTLE[0], COLOR_SUBTLE[1], COLOR_SUBTLE[2]);
    const labelText = `${label.toLowerCase()} : `;
    doc.setFont(FONT_BODY, "normal");
    const isLink = !!url;
    doc.setTextColor(isLink ? COLOR_ACCENT[0] : COLOR_TEXT[0], isLink ? COLOR_ACCENT[1] : COLOR_TEXT[1], isLink ? COLOR_ACCENT[2] : COLOR_TEXT[2]);
    const combinedText = labelText + value.toLowerCase();
    doc.text(combinedText, contactX, contactY, { align: "right" });
    if (url) {
      const textWidth = doc.getTextWidth(combinedText);
      doc.link(contactX - textWidth, contactY - 3, textWidth, 4, { url });
    }
    contactY += 3.5;
  };

  drawContactLine("email", profile.email);
  drawContactLine("tél", formatPhone(profile.phone));
  drawContactLine("adresse", profile.location);
  drawContactLine("linkedin", profile.fullName, profile.linkedin);
  const githubUser = profile.github.split('/').pop() || "claudelmbz";
  drawContactLine("github", githubUser, profile.github);

  y = 40; 

  if (profile.bio) {
    drawSectionHeader("Profil Professionnel");
    doc.setFont(FONT_BODY, "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
    
    const bioText = cleanText(profile.bio);
    const bioLines = doc.splitTextToSize(bioText, contentWidth);
    doc.text(bioText, MARGIN, y, { 
      maxWidth: contentWidth, 
      align: 'justify', 
      lineHeightFactor: 1.1 
    });
    y += (bioLines.length * 4 * 1.1) + 1;
  }

  if (profile.education.length > 0) {
    drawSectionHeader("Formation");
    profile.education.forEach(edu => {
      checkPageOverflow(10);
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
      doc.text(cleanText(edu.school), MARGIN, y);
      const eduDates = `${edu.startDate} - ${edu.endDate}`;
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(8);
      doc.text(eduDates, pageWidth - MARGIN - doc.getTextWidth(eduDates), y);
      y += 3.8;
      doc.setFontSize(9);
      doc.setTextColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
      doc.text(cleanText(edu.degree), MARGIN, y);
      y += 5;
    });
  }

  if (profile.experiences.length > 0) {
    drawSectionHeader("Expérience Professionnelle");
    profile.experiences.forEach(exp => {
      checkPageOverflow(18);
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
      doc.text(cleanText(exp.company).toUpperCase(), MARGIN, y);
      const dateText = `${exp.startDate} - ${exp.isCurrent ? "Présent" : exp.endDate}`;
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(8);
      doc.text(dateText, pageWidth - MARGIN - doc.getTextWidth(dateText), y);
      y += 3.8;
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(9);
      doc.setTextColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
      doc.text(cleanText(exp.role), MARGIN, y);
      y += 4.5;
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(9);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      const descLines = cleanText(exp.description).split('\n');
      descLines.forEach(line => {
        if (!line.trim()) return;
        const wrapped = doc.splitTextToSize(`• ${line.trim().replace(/^[•\-\*]\s*/, '')}`, contentWidth - 4);
        checkPageOverflow(wrapped.length * 3.8);
        doc.text(wrapped, MARGIN + 3, y, { lineHeightFactor: 1.1 });
        y += (wrapped.length * 3.8);
      });
      y += 1;
    });
  }

  drawSectionHeader("Compétences Techniques");
  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  const skillsList = profile.skills.split(',').map(s => s.trim()).filter(s => s !== "");
  
  const colCount = 3; 
  const colWidth = contentWidth / colCount; 
  let skillY = y;
  skillsList.forEach((skill, index) => {
    const col = index % colCount;
    const row = Math.floor(index / colCount);
    checkPageOverflow(row * 4);
    doc.text(`• ${skill}`, MARGIN + (col * colWidth), skillY + (row * 4));
  });
  y += (Math.ceil(skillsList.length / colCount) * 4) + 3;

  if (profile.projects.length > 0) {
    drawSectionHeader("Projets Réalisés");
    profile.projects.slice(0, 3).forEach(proj => {
      checkPageOverflow(12);
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
      doc.text(cleanText(proj.name), MARGIN, y);
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(7.5);
      const techText = `[ ${proj.technologies} ]`;
      doc.text(techText, pageWidth - MARGIN - doc.getTextWidth(techText), y);
      y += 3.8;
      doc.setFontSize(8.5);
      doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
      const projLines = doc.splitTextToSize(cleanText(proj.description), contentWidth - 3);
      checkPageOverflow(projLines.length * 3.8);
      doc.text(projLines, MARGIN, y, { lineHeightFactor: 1.1 });
      y += (projLines.length * 3.8) + 1.5;
    });
  }

  if (profile.certifications && profile.certifications.length > 0) {
    drawSectionHeader("Certifications");
    profile.certifications.forEach(cert => {
      checkPageOverflow(8);
      doc.setFont(FONT_BODY, "bold");
      doc.setFontSize(9);
      doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
      doc.text(cleanText(cert.name), MARGIN, y);
      doc.setFont(FONT_BODY, "normal");
      doc.setFontSize(8);
      doc.text(cert.date, pageWidth - MARGIN - doc.getTextWidth(cert.date), y);
      y += 3.5;
      doc.setFontSize(8.5);
      doc.setTextColor(COLOR_ACCENT[0], COLOR_ACCENT[1], COLOR_ACCENT[2]);
      doc.text(cleanText(cert.issuer), MARGIN, y);
      y += 4;
    });
  }

  drawSectionHeader("Langues & Intérêts");
  checkPageOverflow(12);
  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(9);
  doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
  doc.text("Langues : ", MARGIN, y);
  doc.setFont(FONT_BODY, "normal");
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  doc.text(profile.languages, MARGIN + doc.getTextWidth("Langues : "), y);
  y += 4.5;
  doc.setFont(FONT_BODY, "bold");
  doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
  doc.text("Intérêts : ", MARGIN, y);
  doc.setFont(FONT_BODY, "normal");
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  doc.text(profile.interests, MARGIN + doc.getTextWidth("Intérêts : "), y);

  const safeName = profile.fullName.replace(/[^a-z0-9]/gi, '_');
  doc.save(`CV_${safeName}_Elite.pdf`);
};

export const downloadLetterPdf = (profile: MasterProfile, company: string, jobTitle: string, content: string) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (margin * 2);
  let y = 15; 

  doc.setFont(FONT_BODY, "bold");
  doc.setFontSize(10);
  doc.setTextColor(COLOR_BLACK[0], COLOR_BLACK[1], COLOR_BLACK[2]);
  doc.text(cleanText(profile.fullName), margin, y); y += 4.5;
  doc.setFont(FONT_BODY, "normal");
  doc.text(cleanText(profile.location), margin, y); y += 4.5;
  doc.text(formatPhone(profile.phone), margin, y); y += 4.5;
  doc.text(profile.email.toLowerCase(), margin, y);

  y = 40; 
  const destX = 110;
  doc.setFont(FONT_BODY, "bold");
  doc.text("À l'attention du Responsable Recrutement", destX, y); y += 5;
  doc.text(cleanText(company).toUpperCase(), destX, y); y += 15;

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const city = profile.location.split(',')[0].trim() || "Paris";
  doc.setFont(FONT_BODY, "normal");
  doc.text(`À ${city}, le ${today}`, destX, y); y += 20;

  doc.setFont(FONT_BODY, "bold");
  doc.text(`Objet : Candidature au poste de ${cleanText(jobTitle)}`, margin, y); y += 12;

  doc.setFont(FONT_BODY, "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(COLOR_TEXT[0], COLOR_TEXT[1], COLOR_TEXT[2]);
  
  let cleanContent = cleanText(content);
  cleanContent = cleanContent.replace(/^Objet\s*:.*/im, '')
    .replace(/^À l'attention.*/im, '')
    .trim();

  const signatureKeywords = ["Cordialement", "Sincèrement", "Bien à vous", "Je vous prie d'agréer", "Salutations"];
  signatureKeywords.forEach(keyword => {
    const regex = new RegExp(`\\n\\s*${keyword}.*$`, 'is');
    cleanContent = cleanContent.replace(regex, '');
  });
  
  const nameParts = profile.fullName.split(' ');
  nameParts.forEach(part => {
    if (part.length > 2) {
       const nameRegex = new RegExp(`\\n\\s*${part}\\s*$`, 'i');
       cleanContent = cleanContent.replace(nameRegex, '');
    }
  });

  const paragraphs = cleanContent.trim().split('\n');
  paragraphs.forEach(p => {
    const text = p.trim();
    if (!text) { 
        y += 6; 
        return; 
    }
    
    const wrapped = doc.splitTextToSize(text, contentWidth);
    doc.text(text, margin, y, { 
      maxWidth: contentWidth, 
      align: 'justify',
      lineHeightFactor: 1.35 
    });
    
    y += (wrapped.length * 6) + 2;
    
    if (y > 270) {
        doc.addPage();
        y = 20;
    }
  });

  y += 10;
  if (y > 275) {
      doc.addPage();
      y = 30;
  }
  doc.setFont(FONT_BODY, "bold");
  doc.text("Cordialement,", destX, y); y += 7;
  doc.text(cleanText(profile.fullName), destX, y);

  const safeName = profile.fullName.replace(/[^a-z0-9]/gi, '_');
  doc.save(`Lettre_Motivation_${safeName}.pdf`);
};
