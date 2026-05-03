import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Upload, X, ExternalLink, Image, Video } from 'lucide-react';
import { advertisementService } from '../../services/advertisementService';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const PLACEMENTS = [
  { value: 'top_banner',     label: 'Top Banner',      desc: 'Fixed bar at top of screen' },
  { value: 'middle_section', label: 'Middle Section',  desc: 'Card between content (job listings)' },
  { value: 'bottom_banner',  label: 'Bottom Banner',   desc: 'Sticky bar below bottom nav' },
  { value: 'interstitial',   label: 'Interstitial',    desc: 'Full screen ad on app resume/switch' },
];

const EMPTY_FORM = {
  title: '', subtitle: '', redirect_url: '', cta_text: 'Learn More',
  placement: 'bottom_banner', media_type: 'image', auto_play: false,
  start_date: '', end_date: '', is_active: true,
};

const AdCard = ({ ad, onToggle, onEdit, onDelete }) => {
  const placementLabel = PLACEMENTS.find(p => p.value === ad.placement)?.label || ad.placement;

  return (
    <div className="card-elevated p-4">
      {/* Preview */}
      <div className="w-full rounded-xl overflow-hidden mb-3 relative"
        style={{ height: '100px', background: '#f1f5f9' }}>
        {ad.media_type === 'video'
          ? <video src={ad.media_url} muted loop className="w-full h-full object-cover" />
          : <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
        }
        <span className="absolute top-1.5 left-2 text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: ad.media_type === 'video' ? '#7c3aed' : '#2563eb', color: 'white' }}>
          {ad.media_type === 'video' ? '▶ Video' : '🖼 Image'}
        </span>
      </div>

      {/* Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-slate-900 text-sm truncate">{ad.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{placementLabel}</p>
          {ad.redirect_url && (
            <a href={ad.redirect_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 flex items-center gap-1 mt-0.5 truncate">
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{ad.redirect_url}</span>
            </a>
          )}
        </div>
        <span className="ml-2 flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: ad.is_active ? '#f0fdf4' : '#f1f5f9',
            color:      ad.is_active ? '#15803d' : '#64748b',
          }}>
          {ad.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {ad.start_date && (
        <p className="text-xs text-slate-400 mb-3">
          {ad.start_date} → {ad.end_date || 'No end date'}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onToggle(ad)}
          className="flex-1 py-2 text-xs font-display font-bold rounded-lg transition-all flex items-center justify-center gap-1"
          style={{
            background: ad.is_active ? '#fff1f2' : '#f0fdf4',
            color:      ad.is_active ? '#be123c' : '#15803d',
          }}>
          {ad.is_active ? <><EyeOff className="w-3.5 h-3.5" /> Disable</> : <><Eye className="w-3.5 h-3.5" /> Enable</>}
        </button>
        <button onClick={() => onEdit(ad)}
          className="flex-1 py-2 text-xs btn-secondary rounded-lg flex items-center justify-center gap-1">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(ad)}
          className="py-2 px-3 text-xs rounded-lg flex items-center justify-center"
          style={{ background: '#fff1f2', color: '#be123c' }}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const AdminAds = () => {
  const [ads, setAds]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [saving, setSaving]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const fileRef = useRef();

  useEffect(() => { loadAds(); }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await advertisementService.getAllAds();
      setAds(data);
    } catch { toast.error('Failed to load ads'); }
    finally { setLoading(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setForm(p => ({ ...p, media_type: file.type.startsWith('video') ? 'video' : 'image' }));
  };

  const openCreate = () => {
    setEditingAd(null);
    setForm(EMPTY_FORM);
    setMediaFile(null);
    setMediaPreview('');
    setShowForm(true);
  };

  const openEdit = (ad) => {
    setEditingAd(ad);
    setForm({
      title:        ad.title,
      subtitle:     ad.subtitle || '',
      redirect_url: ad.redirect_url || '',
      cta_text:     ad.cta_text || 'Learn More',
      placement:    ad.placement,
      media_type:   ad.media_type,
      auto_play:    ad.auto_play || false,
      start_date:   ad.start_date || '',
      end_date:     ad.end_date   || '',
      is_active:    ad.is_active,
    });
    setMediaFile(null);
    setMediaPreview(ad.media_url);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    if (!editingAd && !mediaFile) { toast.error('Please upload an image or video'); return; }

    setSaving(true);
    try {
      let mediaUrl = editingAd?.media_url || '';
      if (mediaFile) {
        mediaUrl = await advertisementService.uploadMedia(mediaFile);
      }

      const payload = {
        title:        form.title.trim(),
        subtitle:     form.subtitle || null,
        redirect_url: form.redirect_url || null,
        cta_text:     form.cta_text || 'Learn More',
        placement:    form.placement,
        media_url:    mediaUrl,
        media_type:   form.media_type,
        auto_play:    form.auto_play,
        start_date:   form.start_date || null,
        end_date:     form.end_date   || null,
        is_active:    form.is_active,
      };

      if (editingAd) {
        await advertisementService.updateAd(editingAd.id, payload);
        toast.success('Ad updated!');
      } else {
        await advertisementService.createAd(payload);
        toast.success('Ad created!');
      }
      setShowForm(false);
      loadAds();
    } catch (err) {
      toast.error(err.message || 'Failed to save ad');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ad) => {
    try {
      await advertisementService.toggleAd(ad.id, !ad.is_active);
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !ad.is_active } : a));
      toast.success(`Ad ${!ad.is_active ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await advertisementService.deleteAd(deleteTarget.id, deleteTarget.media_url);
      setAds(prev => prev.filter(a => a.id !== deleteTarget.id));
      toast.success('Ad deleted');
      setDeleteTarget(null);
    } catch { toast.error('Failed to delete'); }
  };

  // Group by placement
  const grouped = PLACEMENTS.reduce((acc, p) => {
    acc[p.value] = ads.filter(a => a.placement === p.value);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 flex justify-between items-center">
        <p className="font-display font-bold text-slate-800 text-sm">{ads.length} Advertisements</p>
        <button onClick={openCreate}
          className="btn-primary px-4 py-2 text-sm gap-1.5" style={{ borderRadius: '10px' }}>
          <Plus className="w-4 h-4" /> New Ad
        </button>
      </div>

      <div className="px-4 py-4 space-y-6">
        {PLACEMENTS.map(({ value, label, desc }) => (
          <div key={value}>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-display font-bold text-slate-800 text-sm">{label}</h3>
              <span className="text-xs text-slate-400">{desc}</span>
              <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {grouped[value].length} ads
              </span>
            </div>
            {grouped[value].length === 0
              ? <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
                  <p className="text-slate-400 text-xs">No ads for this placement</p>
                  <button onClick={openCreate}
                    className="mt-2 text-xs text-blue-600 font-semibold">+ Add Ad</button>
                </div>
              : <div className="space-y-3">
                  {grouped[value].map(ad => (
                    <AdCard key={ad.id} ad={ad}
                      onToggle={handleToggle}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget} />
                  ))}
                </div>
            }
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}
        title={editingAd ? 'Edit Advertisement' : 'New Advertisement'}>
        <div className="space-y-4">

          {/* Media Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Ad Media (Image or Video) *
            </label>
            {mediaPreview ? (
              <div className="relative rounded-xl overflow-hidden" style={{ height: '140px', background: '#f1f5f9' }}>
                {form.media_type === 'video'
                  ? <video src={mediaPreview} muted loop className="w-full h-full object-cover" />
                  : <img src={mediaPreview} alt="preview" className="w-full h-full object-cover" />
                }
                <button onClick={() => { setMediaPreview(''); setMediaFile(null); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
                <span className="absolute bottom-2 left-2 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: form.media_type === 'video' ? '#7c3aed' : '#2563eb' }}>
                  {form.media_type === 'video' ? '▶ Video' : '🖼 Image'}
                </span>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 active:bg-slate-50">
                <Upload className="w-6 h-6 text-slate-400" />
                <p className="text-sm text-slate-500 font-semibold">Tap to upload image or video</p>
                <p className="text-xs text-slate-400">JPG, PNG, MP4, WebM supported</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*"
              onChange={handleFileChange} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Ad Title *</label>
            <input value={form.title} onChange={set('title')}
              placeholder="e.g. Get Personal Loan – Apply Now"
              className="input w-full py-3" style={{ borderRadius: '10px' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Subtitle (optional)</label>
            <input value={form.subtitle} onChange={set('subtitle')}
              placeholder="Short description under title"
              className="input w-full py-3" style={{ borderRadius: '10px' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>CTA Button Text</label>
            <input value={form.cta_text} onChange={set('cta_text')}
              placeholder="e.g. Install, Learn More, Apply Now"
              className="input w-full py-3" style={{ borderRadius: '10px' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Redirect URL</label>
            <input value={form.redirect_url} onChange={set('redirect_url')}
              placeholder="https://example.com"
              className="input w-full py-3" style={{ borderRadius: '10px' }} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Placement *</label>
            <select value={form.placement} onChange={set('placement')}
              className="input w-full py-3" style={{ borderRadius: '10px' }}>
              {PLACEMENTS.map(p => (
                <option key={p.value} value={p.value}>{p.label} — {p.desc}</option>
              ))}
            </select>
          </div>

          {form.media_type === 'video' && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <input type="checkbox" id="autoplay" checked={form.auto_play}
                onChange={e => setForm(p => ({ ...p, auto_play: e.target.checked }))}
                className="w-4 h-4 accent-blue-600" />
              <div>
                <label htmlFor="autoplay" className="text-sm font-semibold text-slate-700">Auto-play video</label>
                <p className="text-xs text-slate-400">Video will always be muted regardless</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Start Date</label>
              <input type="date" value={form.start_date} onChange={set('start_date')}
                className="input w-full py-3" style={{ borderRadius: '10px' }} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>End Date</label>
              <input type="date" value={form.end_date} onChange={set('end_date')}
                className="input w-full py-3" style={{ borderRadius: '10px' }} />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <input type="checkbox" id="isActive" checked={form.is_active}
              onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-blue-600" />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">
              Active — show this ad immediately
            </label>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {saving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mediaFile ? 'Uploading...' : 'Saving...'}
                </span>
              : editingAd ? 'Update Ad' : 'Create Ad'
            }
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Ad">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Delete <strong className="text-slate-900">{deleteTarget?.title}</strong>?
            This will also remove the uploaded media.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)}
              className="btn-secondary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>Cancel</button>
            <button onClick={handleDelete}
              className="flex-1 py-3 text-sm font-display font-bold rounded-[10px] text-white"
              style={{ background: '#e11d48' }}>Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminAds;