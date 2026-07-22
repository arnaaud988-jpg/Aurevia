import { useState, useRef } from 'react';
import {
  Upload, Download, Trash2, Share2, Image, FileText,
  Map, Plus, FolderOpen, Link2, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type FileType = 'photo' | 'pdf' | 'plan';

interface DossierFile {
  id: string;
  name: string;
  type: FileType;
  size: string;
  date: string;
}

// ── Mock file data per dossier ────────────────────────────────────────────────

const FILES_BY_DOSSIER: Record<string, DossierFile[]> = {
  '1': [
    { id: 'p1', name: 'facade_principale.jpg',    type: 'photo', size: '4.2 Mo', date: '15 mars 2024' },
    { id: 'p2', name: 'salon_sejour.jpg',          type: 'photo', size: '3.8 Mo', date: '15 mars 2024' },
    { id: 'p3', name: 'cuisine_equipee.jpg',       type: 'photo', size: '3.1 Mo', date: '15 mars 2024' },
    { id: 'p4', name: 'chambre_principale.jpg',    type: 'photo', size: '2.9 Mo', date: '16 mars 2024' },
    { id: 'p5', name: 'terrasse_arriere.jpg',      type: 'photo', size: '3.6 Mo', date: '16 mars 2024' },
    { id: 'r1', name: 'rapport_inspection_2024.pdf', type: 'pdf', size: '2.1 Mo', date: '18 mars 2024' },
    { id: 'r2', name: 'evaluation_immobiliere.pdf',  type: 'pdf', size: '1.8 Mo', date: '20 mars 2024' },
    { id: 'r3', name: 'certificat_localisation.pdf', type: 'pdf', size: '0.9 Mo', date: '12 mars 2024' },
    { id: 'pl1', name: 'plan_cadastral.pdf',       type: 'plan', size: '3.4 Mo', date: '10 mars 2024' },
    { id: 'pl2', name: 'plan_architectural.pdf',   type: 'plan', size: '5.2 Mo', date: '10 mars 2024' },
  ],
  '2': [
    { id: 'p1', name: 'exterieur_boul.jpg',       type: 'photo', size: '3.9 Mo', date: '4 avril 2024' },
    { id: 'p2', name: 'entree_principale.jpg',    type: 'photo', size: '2.7 Mo', date: '4 avril 2024' },
    { id: 'r1', name: 'contrat_notarial.pdf',     type: 'pdf',   size: '1.2 Mo', date: '6 avril 2024' },
    { id: 'pl1', name: 'plan_etage.pdf',          type: 'plan',  size: '2.8 Mo', date: '2 avril 2024' },
  ],
  '3': [
    { id: 'p1', name: 'photo_drone_facade.jpg',   type: 'photo', size: '6.1 Mo', date: '11 jan. 2024' },
    { id: 'p2', name: 'vue_aerienne.jpg',         type: 'photo', size: '5.4 Mo', date: '11 jan. 2024' },
    { id: 'p3', name: 'salon_ouvert.jpg',         type: 'photo', size: '3.2 Mo', date: '12 jan. 2024' },
    { id: 'p4', name: 'suite_principale.jpg',     type: 'photo', size: '3.0 Mo', date: '12 jan. 2024' },
    { id: 'p5', name: 'piscine_terr.jpg',         type: 'photo', size: '4.1 Mo', date: '12 jan. 2024' },
    { id: 'p6', name: 'cuisine_ilot.jpg',         type: 'photo', size: '3.5 Mo', date: '13 jan. 2024' },
    { id: 'r1', name: 'rapport_inspection.pdf',   type: 'pdf',   size: '3.2 Mo', date: '15 jan. 2024' },
    { id: 'r2', name: 'evaluation_gagnon.pdf',    type: 'pdf',   size: '1.9 Mo', date: '17 jan. 2024' },
    { id: 'r3', name: 'acte_vente_signé.pdf',     type: 'pdf',   size: '0.8 Mo', date: '20 jan. 2024' },
    { id: 'pl1', name: 'plan_cadastral.pdf',      type: 'plan',  size: '4.1 Mo', date: '10 jan. 2024' },
    { id: 'pl2', name: 'plan_arpentage.pdf',      type: 'plan',  size: '3.7 Mo', date: '10 jan. 2024' },
    { id: 'pl3', name: 'plan_architectural.pdf',  type: 'plan',  size: '6.3 Mo', date: '10 jan. 2024' },
  ],
  '4': [
    { id: 'p1', name: 'facade_laurentian.jpg', type: 'photo', size: '3.3 Mo', date: '21 mai 2024' },
    { id: 'r1', name: 'pre_inspection.pdf',    type: 'pdf',   size: '1.1 Mo', date: '22 mai 2024' },
  ],
};

const SECTION_META: Record<FileType, { icon: React.ReactNode; fr: string; en: string; color: string }> = {
  photo: { icon: <Image className="size-4" />, fr: 'Photos de la propriété', en: 'Property Photos',    color: '#818CF8' },
  pdf:   { icon: <FileText className="size-4" />, fr: 'Rapports & Documents PDF', en: 'Reports & PDF Docs', color: '#F472B6' },
  plan:  { icon: <Map className="size-4" />,     fr: "Plans & Arpentage",         en: 'Plans & Surveys',   color: '#34D399' },
};

// ── File row ──────────────────────────────────────────────────────────────────

function FileRow({
  file, onDelete, lang,
}: { file: DossierFile; onDelete: (id: string) => void; lang: string }) {
  const meta = SECTION_META[file.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={{ background: 'rgba(255,255,255,0.03)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
    >
      {/* File type icon */}
      <div className="size-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${meta.color}18`, color: meta.color }}>
        {meta.icon}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate leading-tight">{file.name}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {file.size} · {file.date}
        </p>
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => toast.success(lang === 'fr' ? `Téléchargement de ${file.name}` : `Downloading ${file.name}`)}
          className="size-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
        >
          <Download className="size-3.5" />
        </button>
        <button
          onClick={() => onDelete(file.id)}
          className="size-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.5)' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.5)')}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DossierFileManager({
  dossierId, isArchived,
}: {
  dossierId: string;
  isArchived: boolean;
}) {
  const { lang } = useLanguage();
  const [files, setFiles]       = useState<DossierFile[]>(FILES_BY_DOSSIER[dossierId] ?? []);
  const [dragOver, setDragOver] = useState(false);
  const [shared, setShared]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const photoFiles = files.filter(f => f.type === 'photo');
  const pdfFiles   = files.filter(f => f.type === 'pdf');
  const planFiles  = files.filter(f => f.type === 'plan');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    const newFiles: DossierFile[] = dropped.map((f, i) => ({
      id:   `new-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('image/') ? 'photo' : 'pdf',
      size: `${(f.size / 1_048_576).toFixed(1)} Mo`,
      date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(lang === 'fr' ? `${dropped.length} fichier${dropped.length > 1 ? 's' : ''} ajouté${dropped.length > 1 ? 's' : ''}` : `${dropped.length} file${dropped.length > 1 ? 's' : ''} added`);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const newFiles: DossierFile[] = picked.map((f, i) => ({
      id:   `pick-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('image/') ? 'photo' : 'pdf',
      size: `${(f.size / 1_048_576).toFixed(1)} Mo`,
      date: new Date().toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { day: 'numeric', month: 'short', year: 'numeric' }),
    }));
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(lang === 'fr' ? `${picked.length} fichier${picked.length > 1 ? 's' : ''} ajouté${picked.length > 1 ? 's' : ''}` : `${picked.length} file${picked.length > 1 ? 's' : ''} added`);
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success(lang === 'fr' ? 'Fichier supprimé' : 'File deleted');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`https://app.aurevia.ca/dossier/${dossierId}/share`);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
    toast.success(lang === 'fr' ? 'Lien de partage copié' : 'Share link copied');
  };

  const s = lang === 'fr' ? {
    title:     'Documents du dossier',
    addBtn:    '+ Ajouter',
    shareBtn:  'Partager',
    shared:    'Copié !',
    dropTitle: 'Glisser-déposer vos fichiers ici',
    dropSub:   'ou cliquer pour parcourir',
    empty:     'Aucun fichier dans cette section',
    readOnly:  'Dossier archivé — modifications désactivées',
    download:  'Tout télécharger',
  } : {
    title:     'File documents',
    addBtn:    '+ Add',
    shareBtn:  'Share',
    shared:    'Copied!',
    dropTitle: 'Drag and drop files here',
    dropSub:   'or click to browse',
    empty:     'No files in this section',
    readOnly:  'Archived file — editing disabled',
    download:  'Download all',
  };

  const sections: { type: FileType; items: DossierFile[] }[] = [
    { type: 'photo', items: photoFiles },
    { type: 'pdf',   items: pdfFiles   },
    { type: 'plan',  items: planFiles  },
  ];

  return (
    <div className="px-8 pb-10">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <FolderOpen className="size-4" style={{ color: '#D4AF37' }} />
          <p className="text-[11px] font-bold tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            {s.title}
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
            {files.length}
          </span>
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.07), transparent)' }} />

        {!isArchived && (
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileInput} />
            <button
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)')}
            >
              <Plus className="size-3" />
              {s.addBtn}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {shared ? <Check className="size-3" style={{ color: '#34D399' }} /> : <Link2 className="size-3" />}
              {shared ? s.shared : s.shareBtn}
            </button>
          </div>
        )}
      </div>

      {/* Drop zone */}
      {!isArchived && (
        <motion.div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          animate={dragOver ? { scale: 1.01 } : { scale: 1 }}
          className="flex flex-col items-center justify-center gap-2 py-8 mb-6 rounded-2xl cursor-pointer transition-all"
          style={{
            border: `2px dashed ${dragOver ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.1)'}`,
            background: dragOver ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <div className="size-10 rounded-xl flex items-center justify-center"
            style={{ background: dragOver ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.06)' }}>
            <Upload className="size-5" style={{ color: dragOver ? '#D4AF37' : 'rgba(255,255,255,0.35)' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: dragOver ? '#D4AF37' : 'rgba(255,255,255,0.5)' }}>
            {s.dropTitle}
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.dropSub}</p>
        </motion.div>
      )}

      {/* File sections */}
      <div className="space-y-5">
        {sections.map(({ type, items }) => {
          const meta = SECTION_META[type];
          return (
            <div key={type} className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {/* Section header */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <span style={{ color: meta.color }}>{meta.icon}</span>
                  <span className="text-[11px] font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {lang === 'fr' ? meta.fr : meta.en}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: `${meta.color}18`, color: meta.color }}>
                    {items.length}
                  </span>
                </div>
                {items.length > 0 && (
                  <button
                    onClick={() => toast.success(lang === 'fr' ? `${items.length} fichier(s) téléchargé(s)` : `${items.length} file(s) downloaded`)}
                    className="flex items-center gap-1 text-[10px] transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
                  >
                    <Download className="size-3" />
                    {s.download}
                  </button>
                )}
              </div>

              {/* Files */}
              <div className="p-2">
                {items.length === 0 ? (
                  <p className="text-center py-4 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {s.empty}
                  </p>
                ) : (
                  <AnimatePresence>
                    {items.map(file => (
                      <FileRow
                        key={file.id}
                        file={file}
                        onDelete={isArchived ? () => {} : handleDelete}
                        lang={lang}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
