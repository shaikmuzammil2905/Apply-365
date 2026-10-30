import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { ApplicationDocument } from '../types/application';

interface DocumentPreviewModalProps {
  document: ApplicationDocument | null;
  onClose: () => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose }) => {
  if (!document) return null;

  const isPdf = document.fileType === 'application/pdf' || document.fileName?.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#FAFBFD]">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#104A96]" />
              <span>{document.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {document.fileName || 'Attached Document'} {document.fileSize ? `(${document.fileSize})` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {document.fileUrl && (
              <a
                href={document.fileUrl}
                download={document.fileName || `${document.type}.png`}
                className="p-2 rounded-lg text-slate-600 hover:text-[#104A96] hover:bg-slate-100 transition-colors"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto flex items-center justify-center bg-slate-50">
          {document.fileUrl ? (
            isPdf ? (
              <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{document.fileName}</h4>
                  <p className="text-xs text-slate-500 mt-1">PDF Document attached to application</p>
                </div>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  <span>Open in Full Viewer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs max-h-[60vh] flex items-center justify-center bg-white">
                <img
                  src={document.fileUrl}
                  alt={document.name}
                  className="max-h-[60vh] w-auto object-contain rounded-xl"
                />
              </div>
            )
          ) : (
            <div className="p-12 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No document file preview available.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-[#FAFBFD] flex items-center justify-between text-xs text-slate-500">
          <span>Status: <strong className="text-emerald-700 capitalize font-bold">{document.status}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

