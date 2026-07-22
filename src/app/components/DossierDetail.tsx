import { useState } from 'react';
import {
  ArrowLeft, FileSpreadsheet, Lock, Unlock, Trash2,
  Star, Phone, Globe, X, CheckCircle2, AlertTriangle,
  MapPin, Calendar, Copy, Shield, ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { DossierFileManager } from './DossierFileManager';
import logoImage from '../../imports/2f8e629f-4ee0-4e11-8d04-458f66b26676.png';

type DossierStatus = 'new' | 'active' | 'in_progress' | 'completed' | 'archived';

interface DossierExpert {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  phone: string;
  address: string;
  website?: string;
  addedDate: string;
}

interface DossierData {
  id: string;
  address: string;
  city: string;
  status: DossierStatus;
  createdDate: string;
  experts: DossierExpert[];
}

const DOSSIERS_DATA: Record<string, DossierData> = {
  '1': {
    id: '1', address: '700, rue des Éclaircies', city: 'Montréal, QC',
    status: 'active', createdDate: '12 mars 2024',
    experts: [
      { id: 'e1', name: 'Évaluation Immobilière Gagnon', category: 'evaluation', rating: 4.8, reviewCount: 124, phone: '(514) 288-4455', address: '850 Rue Sherbrooke O, Montréal', website: 'evaluationgagnon.ca', addedDate: '12 mars 2024' },
      { id: 'e2', name: 'Inspection Bâtiment Pro Québec', category: 'inspection', rating: 4.9, reviewCount: 87, phone: '(514) 979-5522', address: '1420 Rue Saint-Denis, Montréal', website: 'inspectionpro.ca', addedDate: '12 mars 2024' },
      { id: 'e3', name: 'Lumière & Propriété Photographie', category: 'photo', rating: 4.7, reviewCount: 203, phone: '(514) 902-3344', address: '256 Rue Beaubien, Montréal', website: 'lumiereimmo.ca', addedDate: '14 mars 2024' },
      { id: 'e4', name: 'Staging Prestige Montréal', category: 'home-staging', rating: 4.8, reviewCount: 156, phone: '(514) 836-4521', address: '3890 Ave des Pins, Montréal', website: 'stagingprestige.ca', addedDate: '15 mars 2024' },
    ],
  },
  '2': {
    id: '2', address: '1240, boul. des Écluses', city: 'Laval, QC',
    status: 'in_progress', createdDate: '2 avril 2024',
    experts: [
      { id: 'e5', name: 'Étude Notariale Bergeron & Ass.', category: 'notaire', rating: 4.9, reviewCount: 211, phone: '(514) 844-7200', address: '460 Rue Sainte-Catherine, Laval', website: 'notairesbergeron.ca', addedDate: '2 avril 2024' },
      { id: 'e6', name: 'Déménagement Express Montréal', category: 'demenagement', rating: 4.6, reviewCount: 88, phone: '(514) 488-5500', address: '720 Boul. des Écluses, Laval', website: 'demexpress.ca', addedDate: '5 avril 2024' },
    ],
  },
  '3': {
    id: '3', address: '3815, av. des Pins', city: 'Montréal, QC',
    status: 'completed', createdDate: '10 janvier 2024',
    experts: [
      { id: 'e7', name: 'Évaluation Immobilière Gagnon', category: 'evaluation', rating: 4.8, reviewCount: 124, phone: '(514) 288-4455', address: '3815 Ave des Pins, Montréal', addedDate: '10 jan. 2024' },
      { id: 'e8', name: 'Inspection Bâtiment Pro Québec', category: 'inspection', rating: 4.9, reviewCount: 87, phone: '(514) 979-5522', address: '3815 Ave des Pins, Montréal', addedDate: '10 jan. 2024' },
      { id: 'e9', name: 'Photos HD Prestige', category: 'photo', rating: 4.7, reviewCount: 178, phone: '(514) 781-5567', address: '3815 Ave des Pins, Montréal', addedDate: '12 jan. 2024' },
      { id: 'e10', name: 'Élite Home Staging', category: 'home-staging', rating: 4.9, reviewCount: 145, phone: '(438) 495-2210', address: '3815 Ave des Pins, Montréal', addedDate: '14 jan. 2024' },
      { id: 'e11', name: 'Atelier Intérieur Prestige', category: 'design', rating: 4.8, reviewCount: 92, phone: '(514) 935-8821', address: '3815 Ave des Pins, Montréal', addedDate: '15 jan. 2024' },
      { id: 'e12', name: 'Me Sophie Tremblay, Notaire', category: 'notaire', rating: 5.0, reviewCount: 67, phone: '(514) 527-3390', address: '3815 Ave des Pins, Montréal', addedDate: '16 jan. 2024' },
    ],
  },
  '4': {
    id: '4', address: '550, rue Saint-Laurent', city: 'Brossard, QC',
    status: 'new', createdDate: '20 mai 2024',
    experts: [
      { id: 'e13', name: 'Inspecta-Maison', category: 'inspection', rating: 4.7, reviewCount: 43, phone: '(514) 233-8877', address: '560 Rue Saint-Laurent, Brossard', website: 'inspectamaison.ca', addedDate: '20 mai 2024' },
    ],
  },
};

const STATUS_CONFIG: Record<DossierStatus, { color: string; bg: string; border: string }> = {
  new:         { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)'  },
  active:      { color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  in_progress: { color: '#D4AF37', bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.3)'  },
  completed:   { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
  archived:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' },
};

type ModalState = 'none' | 'export' | 'delete';

export interface DossierDetailProps {
  dossierId: string;
  onBack: () => void;
  onCheckout?: () => void;
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className="size-3"
          style={{
            fill: i <= Math.floor(rating) ? '#D4AF37' : i - rating < 1 ? 'rgba(212,175,55,0.35)' : 'transparent',
            color: i <= Math.ceil(rating) ? '#D4AF37' : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  );
}

// ── ExpertCard ─────────────────────────────────────────────────────────────────
interface ExpertCardStrings {
  addedOn: string;
  copyContact: string;
  verifiedBy: string;
  contactCopied: string;
  readOnly: string;
}

function ExpertCard({
  expert, index, isArchived, categoryLabel, strings,
}: {
  expert: DossierExpert;
  index: number;
  isArchived: boolean;
  categoryLabel: string;
  strings: ExpertCardStrings;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${expert.name}\n${expert.phone}${expert.website ? '\n' + expert.website : ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accentColor = isArchived ? '#64748B' : '#D4AF37';
  const badgeBg     = isArchived ? 'rgba(100,116,139,0.1)'   : 'rgba(212,175,55,0.1)';
  const badgeBorder = isArchived ? 'rgba(100,116,139,0.2)'   : 'rgba(212,175,55,0.2)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${isArchived ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'}`,
        opacity: isArchived ? 0.65 : 1,
        transition: 'opacity 0.4s',
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, ${accentColor}, ${accentColor}30)` }}
      />

      <div className="p-5 pl-7">
        {/* Row 1: category badge + rating */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span
            className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shrink-0"
            style={{ background: badgeBg, color: accentColor, border: `1px solid ${badgeBorder}` }}
          >
            {categoryLabel}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Stars rating={expert.rating} />
            <span className="text-white/50 text-xs font-medium">{expert.rating.toFixed(1)}</span>
            <span className="text-white/25 text-xs">({expert.reviewCount})</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold text-[15px] leading-snug mb-1.5">{expert.name}</h3>

        {/* Verified badge */}
        <div className="flex items-center gap-1.5 mb-4">
          <Shield className="size-3" style={{ color: accentColor }} />
          <span className="text-[11px]" style={{ color: `${accentColor}80` }}>{strings.verifiedBy}</span>
        </div>

        {/* Contact details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2">
            <Phone className="size-3 shrink-0 text-white/30" />
            <span className="text-white/55 text-xs">{expert.phone}</span>
          </div>
          {expert.website && (
            <div className="flex items-center gap-2">
              <Globe className="size-3 shrink-0 text-white/30" />
              <span className="text-white/55 text-xs">{expert.website}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="size-3 shrink-0 text-white/20" />
            <span className="text-white/30 text-xs truncate">{expert.address}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-1.5 text-white/25 text-[11px]">
            <Calendar className="size-3" />
            <span>{strings.addedOn} {expert.addedDate}</span>
          </div>

          {!isArchived ? (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg transition-all"
              style={{
                color: copied ? '#D4AF37' : 'rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${copied ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {copied ? <CheckCircle2 className="size-3" /> : <Copy className="size-3" />}
              {copied ? strings.contactCopied : strings.copyContact}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.18)', color: '#64748B' }}>
              <Lock className="size-2.5" />
              {strings.readOnly}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── ExportModal ───────────────────────────────────────────────────────────────
function ExportModal({
  title, desc, downloadBtn, closeBtn, onDownload, onClose,
}: {
  title: string; desc: string; downloadBtn: string; closeBtn: string;
  onDownload: () => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl p-8 w-full max-w-sm"
      style={{
        background: 'rgba(10,22,40,0.99)',
        border: '1px solid rgba(212,175,55,0.25)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.06)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose}
        className="absolute top-5 right-5 text-white/25 hover:text-white/60 transition-colors">
        <X className="size-4" />
      </button>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="size-20 rounded-2xl flex items-center justify-center relative"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
          <FileSpreadsheet className="size-9" style={{ color: '#D4AF37' }} />
          <div className="absolute -top-1 -right-1 size-5 rounded-full flex items-center justify-center"
            style={{ background: '#D4AF37' }}>
            <CheckCircle2 className="size-3 text-[#07111f]" strokeWidth={3} />
          </div>
        </div>
      </div>

      <h2 className="text-white text-xl font-semibold text-center mb-2">{title}</h2>
      <p className="text-white/40 text-sm text-center leading-relaxed mb-8">{desc}</p>

      <div className="flex flex-col gap-2.5">
        <button onClick={onDownload}
          className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8962F 100%)', color: '#07111f' }}>
          <FileSpreadsheet className="size-4" />
          {downloadBtn}
        </button>
        <button onClick={onClose}
          className="w-full py-3 rounded-xl text-sm text-white/35 hover:text-white/60 transition-colors">
          {closeBtn}
        </button>
      </div>
    </motion.div>
  );
}

// ── DeleteModal ───────────────────────────────────────────────────────────────
function DeleteModal({
  title, desc, deleteBtn, cancelBtn, onDelete, onClose,
}: {
  title: string; desc: string; deleteBtn: string; cancelBtn: string;
  onDelete: () => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 16 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl p-8 w-full max-w-sm"
      style={{
        background: 'rgba(10,22,40,0.99)',
        border: '1px solid rgba(239,68,68,0.25)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.06)',
      }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose}
        className="absolute top-5 right-5 text-white/25 hover:text-white/60 transition-colors">
        <X className="size-4" />
      </button>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="size-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle className="size-9" style={{ color: '#ef4444' }} />
        </div>
      </div>

      <h2 className="text-white text-xl font-semibold text-center mb-2">{title}</h2>
      <p className="text-white/40 text-sm text-center leading-relaxed mb-8">{desc}</p>

      <div className="flex flex-col gap-2.5">
        <button onClick={onDelete}
          className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all hover:opacity-90 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <Trash2 className="size-4" />
          {deleteBtn}
        </button>
        <button onClick={onClose}
          className="w-full py-3 rounded-xl text-sm text-white/35 hover:text-white/60 transition-colors">
          {cancelBtn}
        </button>
      </div>
    </motion.div>
  );
}

// ── DossierDetail (main) ──────────────────────────────────────────────────────
export function DossierDetail({ dossierId, onBack, onCheckout }: DossierDetailProps) {
  const { t, lang } = useLanguage();
  const data = DOSSIERS_DATA[dossierId] ?? DOSSIERS_DATA['1'];
  const [status, setStatus] = useState<DossierStatus>(
    data.status === 'completed' ? 'archived' : data.status
  );
  const [modal, setModal] = useState<ModalState>('none');

  const isArchived = status === 'archived' || status === 'completed';
  const cfg = STATUS_CONFIG[status];

  const s = lang === 'fr' ? {
    back: 'Mes Dossiers',
    created: 'Créé le',
    expertCount: (n: number) => `${n} expert${n > 1 ? 's' : ''} dans ce dossier`,
    exportExcel: 'Exporter Excel',
    closeDossier: 'Clôturer',
    reopen: 'Réouvrir',
    deleteDossier: 'Supprimer',
    sectionTitle: 'Experts du dossier',
    addedOn: 'Ajouté le',
    copyContact: 'Copier',
    verifiedBy: 'Vérifié par Aurevia',
    readOnly: 'Lecture seule',
    exportModalTitle: "Dossier prêt à l'export",
    exportModalDesc: "Le fichier Excel contient les fiches complètes de tous les experts associés à ce dossier.",
    downloadBtn: 'Télécharger le fichier',
    closeBtn: 'Fermer',
    deleteModalTitle: 'Supprimer définitivement ce dossier ?',
    deleteModalDesc: "Cette action est irréversible. Le dossier et toutes les fiches experts associées seront définitivement effacés.",
    deleteBtn: 'Supprimer définitivement',
    cancelBtn: 'Annuler',
    statusLabels: { new: 'NOUVEAU', active: 'ACTIF', in_progress: 'EN COURS', completed: 'COMPLÉTÉ', archived: 'ARCHIVÉ' } as Record<DossierStatus, string>,
    closedToast: 'Dossier archivé avec succès',
    reopenedToast: 'Dossier réactivé avec succès',
    deletedToast: 'Dossier supprimé définitivement',
    exportToast: 'Fichier Excel téléchargé',
    contactCopied: 'Copié !',
  } : {
    back: 'My Files',
    created: 'Created on',
    expertCount: (n: number) => `${n} expert${n > 1 ? 's' : ''} in this file`,
    exportExcel: 'Export Excel',
    closeDossier: 'Close File',
    reopen: 'Reopen',
    deleteDossier: 'Delete',
    sectionTitle: 'File Experts',
    addedOn: 'Added on',
    copyContact: 'Copy',
    verifiedBy: 'Verified by Aurevia',
    readOnly: 'Read only',
    exportModalTitle: 'File ready for export',
    exportModalDesc: 'The Excel file contains the complete profiles of all experts associated with this file.',
    downloadBtn: 'Download file',
    closeBtn: 'Close',
    deleteModalTitle: 'Permanently delete this file?',
    deleteModalDesc: 'This action is irreversible. The file and all associated expert profiles will be permanently deleted.',
    deleteBtn: 'Delete permanently',
    cancelBtn: 'Cancel',
    statusLabels: { new: 'NEW', active: 'ACTIVE', in_progress: 'IN PROGRESS', completed: 'COMPLETED', archived: 'ARCHIVED' } as Record<DossierStatus, string>,
    closedToast: 'File archived successfully',
    reopenedToast: 'File reactivated',
    deletedToast: 'File permanently deleted',
    exportToast: 'Excel file downloaded',
    contactCopied: 'Copied!',
  };

  const handleToggleClose = () => {
    if (isArchived) {
      setStatus('active');
      toast.success(s.reopenedToast);
    } else {
      setStatus('archived');
      toast.success(s.closedToast);
    }
  };

  const handleDeleteConfirm = () => {
    setModal('none');
    toast.success(s.deletedToast);
    setTimeout(onBack, 500);
  };

  const handleExportDownload = () => {
    setModal('none');
    toast.success(s.exportToast);
  };

  return (
    <div className="size-full flex flex-col overflow-hidden" style={{ background: '#07111f' }}>

      {/* ── Sticky header ── */}
      <div
        className="shrink-0"
        style={{
          background: 'rgba(8,18,36,0.96)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Nav row */}
        <div className="flex items-center justify-between px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 transition-colors text-sm"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
          >
            <ArrowLeft className="size-4" />
            {s.back}
          </button>
          <div className="flex items-center gap-4">
            <LanguageToggle variant="dark" />
            <img src={logoImage} alt="Aurevia" className="h-12 w-auto object-contain" />
          </div>
        </div>

        {/* Property + actions row */}
        <div className="flex items-end justify-between gap-6 px-8 pb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <h1 className="text-white font-light text-2xl leading-tight">{data.address}</h1>
              <motion.span
                key={status}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="shrink-0 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                ● {s.statusLabels[status]}
              </motion.span>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {data.city} · {s.created} {data.createdDate} · {s.expertCount(data.experts.length)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 shrink-0">

            <ActionBtn
              icon={<FileSpreadsheet className="size-4" />}
              label={s.exportExcel}
              variant="gold"
              onClick={() => setModal('export')}
            />

            <ActionBtn
              icon={isArchived ? <Unlock className="size-4" /> : <Lock className="size-4" />}
              label={isArchived ? s.reopen : s.closeDossier}
              variant="neutral"
              onClick={handleToggleClose}
            />

            <ActionBtn
              icon={<Trash2 className="size-4" />}
              label={s.deleteDossier}
              variant="danger"
              onClick={() => setModal('delete')}
            />
          </div>
        </div>
      </div>

      {/* ── Expert grid ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">

          {/* Section header */}
          <div className="flex items-center gap-4 mb-6">
            <p className="text-xs font-bold tracking-widest uppercase shrink-0"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              {s.sectionTitle}
            </p>
            <div className="flex-1 h-px"
              style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.07), transparent)' }} />
            <AnimatePresence>
              {isArchived && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full shrink-0"
                  style={{ border: '1px solid rgba(100,116,139,0.2)', color: '#64748B', background: 'rgba(100,116,139,0.08)' }}
                >
                  <Lock className="size-2.5" />
                  {s.readOnly}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-2 gap-4">
            {data.experts.map((expert, idx) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                index={idx}
                isArchived={isArchived}
                categoryLabel={t.services[expert.category] ?? expert.category}
                strings={{
                  addedOn: s.addedOn,
                  copyContact: s.copyContact,
                  verifiedBy: s.verifiedBy,
                  contactCopied: s.contactCopied,
                  readOnly: s.readOnly,
                }}
              />
            ))}
          </div>

          {/* Checkout CTA */}
          {!isArchived && onCheckout && (
            <div className="mt-6">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37, #B8962F)',
                  color: '#07111f',
                  boxShadow: '0 6px 24px rgba(212,175,55,0.3)',
                }}
              >
                <ShoppingCart className="size-4" />
                {data.experts.length > 0
                  ? (lang === 'fr'
                      ? `Procéder au paiement — ${data.experts.length} expert${data.experts.length > 1 ? 's' : ''}`
                      : `Proceed to payment — ${data.experts.length} expert${data.experts.length > 1 ? 's' : ''}`)
                  : (lang === 'fr' ? 'Facturation' : 'Billing')}
              </motion.button>
            </div>
          )}
        </div>

        {/* ── File Manager — inside the scroll container ── */}
        <DossierFileManager dossierId={dossierId} isArchived={isArchived} />
      </div>

      {/* ── Modal layer ── */}
      <AnimatePresence>
        {modal !== 'none' && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 px-6"
            style={{ background: 'rgba(3,8,18,0.8)', backdropFilter: 'blur(10px)' }}
            onClick={() => setModal('none')}
          >
            <AnimatePresence mode="wait">
              {modal === 'export' && (
                <ExportModal
                  key="export"
                  title={s.exportModalTitle}
                  desc={s.exportModalDesc}
                  downloadBtn={s.downloadBtn}
                  closeBtn={s.closeBtn}
                  onDownload={handleExportDownload}
                  onClose={() => setModal('none')}
                />
              )}
              {modal === 'delete' && (
                <DeleteModal
                  key="delete"
                  title={s.deleteModalTitle}
                  desc={s.deleteModalDesc}
                  deleteBtn={s.deleteBtn}
                  cancelBtn={s.cancelBtn}
                  onDelete={handleDeleteConfirm}
                  onClose={() => setModal('none')}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── ActionBtn helper ──────────────────────────────────────────────────────────
function ActionBtn({
  icon, label, variant, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant: 'gold' | 'neutral' | 'danger';
  onClick: () => void;
}) {
  const base = {
    gold:    { color: '#D4AF37',          border: 'rgba(212,175,55,0.35)',  hoverBorder: 'rgba(212,175,55,0.65)',  hoverBg: 'rgba(212,175,55,0.06)' },
    neutral: { color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.14)', hoverBorder: 'rgba(255,255,255,0.3)',  hoverBg: 'rgba(255,255,255,0.05)' },
    danger:  { color: 'rgba(239,68,68,0.65)',  border: 'rgba(239,68,68,0.25)',  hoverBorder: 'rgba(239,68,68,0.55)',  hoverBg: 'rgba(239,68,68,0.07)'  },
  }[variant];

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
      style={{ color: base.color, border: `1px solid ${base.border}` }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = base.hoverBorder;
        (e.currentTarget as HTMLElement).style.background  = base.hoverBg;
        if (variant === 'neutral') (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.85)';
        if (variant === 'danger')  (e.currentTarget as HTMLElement).style.color = 'rgb(239,68,68)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = base.border;
        (e.currentTarget as HTMLElement).style.background  = 'transparent';
        (e.currentTarget as HTMLElement).style.color = base.color;
      }}
    >
      {icon}
      {label}
    </button>
  );
}
