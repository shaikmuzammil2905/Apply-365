import React, { useState, useEffect } from 'react';
import { getMediaAssets, saveMediaAsset, deleteMediaAsset } from '../../services/dataSyncService';
import { uploadToCloudinary, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '../../services/cloudinaryService';
import { MediaAsset } from '../../types/admin';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  Eye, 
  X,
  Sparkles,
  CloudLightning
} from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);

  const loadMedia = async () => {
    const list = await getMediaAssets();
    setMedia(list);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading asset to Cloudinary (vtaxbisr)...');

    try {
      const res = await uploadToCloudinary(file, 'media_library');
      if (res.success && res.url) {
        const newAsset: MediaAsset = {
          id: `med-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ""),
          category: 'general',
          url: res.url,
          publicId: res.publicId,
          format: res.format || file.type.split('/')[1] || 'png',
          sizeBytes: res.bytes || file.size,
          createdAt: new Date().toISOString()
        };

        await saveMediaAsset(newAsset);
        await loadMedia();
        setUploadStatus(res.isFallback ? 'Uploaded and secured in media storage' : 'Uploaded successfully to Cloudinary!');
      } else {
        setUploadStatus('Failed to upload file.');
      }
    } catch (err: any) {
      setUploadStatus('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
      await deleteMediaAsset(id);
      await loadMedia();
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = media.filter(m => categoryFilter === 'all' || m.category === categoryFilter);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#104A96]" />
            <span>Cloudinary Media Library</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Connected to Cloudinary account <span className="font-mono font-bold text-slate-700">{CLOUDINARY_CLOUD_NAME}</span> (Preset: {CLOUDINARY_UPLOAD_PRESET}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload New Media</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadStatus && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#104A96] font-semibold flex items-center gap-2">
          <CloudLightning className="w-4 h-4 text-[#FF8500]" />
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'banners', 'courses', 'services', 'documents', 'general'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
              categoryFilter === cat 
                ? 'bg-[#104A96] text-white shadow-xs' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                type="button"
                onClick={() => setPreviewMedia(item)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Preview"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3 space-y-1">
              <p className="text-xs font-bold text-slate-900 truncate" title={item.title}>
                {item.title}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="uppercase font-mono">{item.format || 'IMG'}</span>
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={() => copyUrl(item.url, item.id)}
                className="flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-bold py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#104A96] transition-colors"
                title="Copy Image URL"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(item.id, item.title)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Asset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 truncate">{previewMedia.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
              <img src={previewMedia.url} alt={previewMedia.title} className="max-h-full object-contain" />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <input
                type="text"
                readOnly
                value={previewMedia.url}
                className="flex-1 mr-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={() => copyUrl(previewMedia.url, previewMedia.id)}
                className="px-4 py-1.5 rounded-lg bg-[#104A96] text-white font-bold"
              >
                {copiedId === previewMedia.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

