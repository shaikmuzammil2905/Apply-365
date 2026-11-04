import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  AlertCircle,
  FileCheck2,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { ApplicationDocument } from '../types/application';
import { downloadDocumentFile } from '../utils/fileDownloadHelper';

export interface DocumentItemForPreview {
  id?: string;
  name?: string;
  fileName?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: string;
  uploadedAt?: string;
  customerName?: string;
  applicationId?: string;
  type?: string;
}

interface DocumentPreviewModalProps {
  document: ApplicationDocument | DocumentItemForPreview | null;
  documents?: (ApplicationDocument | DocumentItemForPreview)[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  onClose: () => void;
  customerName?: string;
  applicationId?: string;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: currentDoc,
  documents = [],
  currentIndex = 0,
  onNavigate,
  onClose,
  customerName: propCustomerName,
  applicationId: propApplicationId,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Active document resolution
  const activeDoc = (documents && documents.length > 0 && currentIndex >= 0 && currentIndex < documents.length)
    ? documents[currentIndex]
    : currentDoc;

  // Reset zoom & rotation when active document changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setIsLoading(true);
    setHasError(false);
  }, [currentIndex, activeDoc?.fileUrl]);

  // Keydown listener for ESC (close) and Left/Right arrows (navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && onNavigate && documents && currentIndex < documents.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, documents, onNavigate, onClose]);

  if (!activeDoc) return null;

  const fileName = activeDoc.fileName || activeDoc.name || 'document';
  const fileUrl = activeDoc.fileUrl;
  const fileType = activeDoc.fileType || '';
  const fileSize = activeDoc.fileSize || 'N/A';
  const uploadedAt = activeDoc.uploadedAt || 'Recently';
  const customerName = (activeDoc as any).customerName || propCustomerName || 'Citizen Applicant';
  const applicationId = (activeDoc as any).applicationId || propApplicationId || 'N/A';

  const isPdf = Boolean(
    fileType.toLowerCase().includes('pdf') || 
    fileName.toLowerCase().endsWith('.pdf') ||
    fileUrl?.startsWith('data:application/pdf')
  );

  const isImage = Boolean(
    fileType.toLowerCase().includes('image') ||
    fileName.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ||
    fileUrl?.startsWith('data:image/')
  );

  const handleDownload = () => {
    if (!fileUrl) {
      alert('Document file link is missing or invalid.');
      return;
    }
    const safeName = fileName.includes('.') ? fileName : `${fileName}.${isPdf ? 'pdf' : 'png'}`;
    downloadDocumentFile(fileUrl, safeName);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-[#FAFBFD] shrink-0">
          <div className="min-w-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#104A96] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate" title={fileName}>
                {fileName}
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                <span className="font-medium">{fileSize}</span>
                <span>•</span>
                <span className="font-mono text-[#104A96] font-bold">{applicationId}</span>
                {documents.length > 1 && (
                  <>
                    <span>•</span>
                    <span className="bg-slate-200/80 px-2 py-0.5 rounded-full font-bold text-slate-700">
                      {currentIndex + 1} of {documents.length}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isImage && (
              <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-bold px-1 text-slate-600 font-mono">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  title="Reset Zoom"
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                showDetails ? 'bg-blue-50 text-[#104A96]' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Show Document Details"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              title="Download Original File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Details Dropdown Drawer */}
        {showDetails && (
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-2 duration-150">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Original Filename</span>
              <span className="font-semibold text-slate-800 truncate block">{fileName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Document Type</span>
              <span className="font-semibold text-slate-800 truncate block">{activeDoc.name || activeDoc.type || 'Supporting Document'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Name</span>
              <span className="font-semibold text-slate-800 truncate block">{customerName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Uploaded At</span>
              <span className="font-semibold text-slate-800 truncate block">{uploadedAt}</span>
            </div>
          </div>
        )}

        {/* Content Body Viewer */}
        <div className="relative flex-1 bg-slate-900/90 overflow-auto flex items-center justify-center p-3 sm:p-6 min-h-[350px] max-h-[72vh]">
          
          {/* Navigation Prev Button */}
          {documents.length > 1 && onNavigate && currentIndex > 0 && (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Previous Document"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Navigation Next Button */}
          {documents.length > 1 && onNavigate && currentIndex < documents.length - 1 && (
            <button
              type="button"
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Next Document"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* File Rendering Logic */}
          {!fileUrl ? (
            <div className="p-8 text-center text-slate-300 space-y-2 bg-slate-800/80 rounded-2xl border border-slate-700">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Document File Available</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                This document entry does not contain an uploaded file attachment.
              </p>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full min-h-[480px] bg-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-700 shadow-inner">
              <object
                data={fileUrl}
                type="application/pdf"
                className="w-full h-[65vh] rounded-2xl"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              >
                {/* Fallback for browsers without inline PDF plugin */}
                <div className="p-8 text-center text-slate-200 space-y-4">
                  <FileText className="w-16 h-16 text-red-400 mx-auto" />
                  <div>
                    <h4 className="text-base font-bold">{fileName}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF Document attached to application. Your browser doesn't support direct inline rendering.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-5 py-2.5 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF to View</span>
                  </button>
                </div>
              </object>
            </div>
          ) : isImage ? (
            <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-2">
              <img
                src={fileUrl}
                alt={fileName}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl select-none"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            </div>
          ) : (
            /* Generic non-image / non-pdf file viewer */
            <div className="p-8 text-center text-slate-200 space-y-4 bg-slate-800/90 rounded-2xl border border-slate-700 max-w-md">
              <FileText className="w-14 h-14 text-blue-400 mx-auto" />
              <div>
                <h4 className="text-base font-bold">{fileName}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  File format: <span className="font-mono">{fileType || 'Binary Document'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download & Inspect File</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-slate-100 bg-[#FAFBFD] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>Customer: <strong className="text-slate-800">{customerName}</strong></span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Protected Document Access</span>
          </div>

          <div className="flex items-center gap-3">
            {documents.length > 1 && onNavigate && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Use Left / Right arrow keys to navigate documents
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
