import React, { useState, useEffect } from 'react';
import { 
  getServices, 
  getServiceDocuments, 
  saveServiceDocuments, 
  copyServiceDocuments 
} from '../../services/dataSyncService';
import { ServiceDetail, ServiceDocument } from '../../types/services';
import { 
  FileCheck2, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Eye, 
  Check, 
  X, 
  AlertCircle, 
  Search, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  UploadCloud, 
  FileText, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FolderSync
} from 'lucide-react';

export const AdminDocumentsPage: React.FC = () => {
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('aadhaar');
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Selection for Bulk Actions
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<ServiceDocument | null>(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState<boolean>(false);
  const [copySourceServiceId, setCopySourceServiceId] = useState<string>('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Form State
  const [docForm, setDocForm] = useState<Partial<ServiceDocument>>({
    name: '',
    shortLabel: '',
    category: 'Identity Proof',
    description: '',
    instructions: '',
    isMandatory: true,
    isActive: true,
    allowMultipleFiles: false,
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    maxFileSizeMB: 10,
    displayOrder: 1,
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load all services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const list = await getServices();
      setServices(list);
      if (list.length > 0 && !selectedServiceId) {
        setSelectedServiceId(list[0].id);
      }
    } catch (e: any) {
      showNotify('error', 'Failed to load services: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load documents when selectedServiceId changes
  useEffect(() => {
    if (selectedServiceId) {
      loadDocsForService(selectedServiceId);
      setSelectedDocIds([]);
    }
  }, [selectedServiceId]);

  const loadDocsForService = async (serviceId: string) => {
    try {
      const docs = await getServiceDocuments(serviceId);
      setDocuments(docs);
    } catch (e: any) {
      showNotify('error', 'Error loading documents for service: ' + e.message);
    }
  };

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const currentService = services.find(s => s.id === selectedServiceId || s.slug === selectedServiceId) || services[0];

  // Open Add Document Modal
  const handleOpenAddModal = () => {
    setEditingDoc(null);
    setDocForm({
      name: '',
      shortLabel: '',
      category: 'Identity Proof',
      description: 'Upload a clear, readable copy showing applicant details.',
      instructions: 'Ensure full name, photo, and address are clearly legible without glare.',
      isMandatory: true,
      isActive: true,
      allowMultipleFiles: false,
      allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      maxFileSizeMB: 10,
      displayOrder: documents.length + 1,
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit Document Modal
  const handleOpenEditModal = (doc: ServiceDocument) => {
    setEditingDoc(doc);
    setDocForm({
      name: doc.name,
      shortLabel: doc.shortLabel || '',
      category: doc.category || 'Identity Proof',
      description: doc.description || '',
      instructions: doc.instructions || '',
      isMandatory: doc.isMandatory !== false,
      isActive: doc.isActive !== false,
      allowMultipleFiles: doc.allowMultipleFiles || false,
      allowedFileTypes: doc.allowedFileTypes || ['pdf', 'jpg', 'jpeg', 'png'],
      maxFileSizeMB: doc.maxFileSizeMB || 10,
      displayOrder: doc.displayOrder || 1,
    });
    setIsAddEditModalOpen(true);
  };

  // Save Document (Add or Edit)
  const handleSaveDocForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name?.trim()) {
      showNotify('error', 'Please provide a document name');
      return;
    }

    setIsSaving(true);
    try {
      let updatedList: ServiceDocument[] = [...documents];

      if (editingDoc) {
        // Edit existing
        updatedList = updatedList.map(d => {
          if (d.id === editingDoc.id) {
            return {
              ...d,
              name: docForm.name!.trim(),
              shortLabel: docForm.shortLabel?.trim() || docForm.name!.trim(),
              category: docForm.category || 'Identity Proof',
              description: docForm.description?.trim() || 'Valid supporting documentation.',
              instructions: docForm.instructions?.trim() || '',
              isMandatory: docForm.isMandatory !== false,
              isOptional: docForm.isMandatory === false,
              isActive: docForm.isActive !== false,
              allowMultipleFiles: docForm.allowMultipleFiles || false,
              allowedFileTypes: docForm.allowedFileTypes || ['pdf', 'jpg', 'jpeg', 'png'],
              maxFileSizeMB: Number(docForm.maxFileSizeMB) || 10,
              displayOrder: Number(docForm.displayOrder) || d.displayOrder || 1,
            };
          }
          return d;
        });
      } else {
        // Add new
        const newDoc: ServiceDocument = {
          id: `doc-${selectedServiceId}-${Date.now()}`,
          serviceId: selectedServiceId,
          name: docForm.name!.trim(),
          shortLabel: docForm.shortLabel?.trim() || docForm.name!.trim(),
          category: docForm.category || 'Identity Proof',
          description: docForm.description?.trim() || 'Valid supporting documentation.',
          instructions: docForm.instructions?.trim() || '',
          isMandatory: docForm.isMandatory !== false,
          isOptional: docForm.isMandatory === false,
          isActive: docForm.isActive !== false,
          allowMultipleFiles: docForm.allowMultipleFiles || false,
          allowedFileTypes: docForm.allowedFileTypes || ['pdf', 'jpg', 'jpeg', 'png'],
          maxFileSizeMB: Number(docForm.maxFileSizeMB) || 10,
          displayOrder: documents.length + 1,
        };
        updatedList.push(newDoc);
      }

      const saved = await saveServiceDocuments(selectedServiceId, updatedList);
      setDocuments(saved);
      setIsAddEditModalOpen(false);
      showNotify('success', editingDoc ? 'Document updated and synchronized!' : 'New document added and synchronized!');
    } catch (err: any) {
      showNotify('error', 'Failed to save document: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder Item Up
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...documents];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    
    setDocuments(reordered);
    await saveServiceDocuments(selectedServiceId, reordered);
    showNotify('success', 'Document order updated and synchronized!');
  };

  // Reorder Item Down
  const handleMoveDown = async (index: number) => {
    if (index === documents.length - 1) return;
    const reordered = [...documents];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;

    setDocuments(reordered);
    await saveServiceDocuments(selectedServiceId, reordered);
    showNotify('success', 'Document order updated and synchronized!');
  };

  // Quick Toggle Required / Optional
  const handleToggleRequired = async (docId: string) => {
    const updated = documents.map(d => {
      if (d.id === docId) {
        const nextMandatory = !d.isMandatory;
        return {
          ...d,
          isMandatory: nextMandatory,
          isOptional: !nextMandatory
        };
      }
      return d;
    });

    setDocuments(updated);
    await saveServiceDocuments(selectedServiceId, updated);
    showNotify('success', 'Requirement status updated live on website!');
  };

  // Quick Toggle Active / Inactive
  const handleToggleActive = async (docId: string) => {
    const updated = documents.map(d => {
      if (d.id === docId) {
        return {
          ...d,
          isActive: !d.isActive
        };
      }
      return d;
    });

    setDocuments(updated);
    await saveServiceDocuments(selectedServiceId, updated);
    showNotify('success', 'Document visibility updated live on website!');
  };

  // Delete Document
  const handleDeleteDoc = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}" from this service? Existing customer applications will keep historical records.`)) {
      return;
    }

    const filtered = documents.filter(d => d.id !== docId);
    setDocuments(filtered);
    await saveServiceDocuments(selectedServiceId, filtered);
    showNotify('success', `"${docName}" removed from service.`);
  };

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocuments.map(d => d.id!));
    }
  };

  const handleToggleSelectDoc = (id: string) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter(i => i !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const handleBulkSetRequired = async (isReq: boolean) => {
    if (selectedDocIds.length === 0) return;
    const updated = documents.map(d => {
      if (selectedDocIds.includes(d.id!)) {
        return { ...d, isMandatory: isReq, isOptional: !isReq };
      }
      return d;
    });

    setDocuments(updated);
    await saveServiceDocuments(selectedServiceId, updated);
    setSelectedDocIds([]);
    showNotify('success', `Updated ${selectedDocIds.length} document(s) to ${isReq ? 'Required' : 'Optional'}.`);
  };

  const handleBulkSetActive = async (active: boolean) => {
    if (selectedDocIds.length === 0) return;
    const updated = documents.map(d => {
      if (selectedDocIds.includes(d.id!)) {
        return { ...d, isActive: active };
      }
      return d;
    });

    setDocuments(updated);
    await saveServiceDocuments(selectedServiceId, updated);
    setSelectedDocIds([]);
    showNotify('success', `${active ? 'Activated' : 'Deactivated'} ${selectedDocIds.length} document(s).`);
  };

  const handleBulkDelete = async () => {
    if (selectedDocIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedDocIds.length} selected document(s) from this service?`)) return;

    const filtered = documents.filter(d => !selectedDocIds.includes(d.id!));
    setDocuments(filtered);
    await saveServiceDocuments(selectedServiceId, filtered);
    setSelectedDocIds([]);
    showNotify('success', `Deleted ${selectedDocIds.length} document(s).`);
  };

  // Copy Configuration From Another Service
  const handleCopyDocuments = async () => {
    if (!copySourceServiceId) {
      showNotify('error', 'Please select a source service');
      return;
    }
    if (copySourceServiceId === selectedServiceId) {
      showNotify('error', 'Source and destination service cannot be the same');
      return;
    }

    setIsSaving(true);
    try {
      const cloned = await copyServiceDocuments(copySourceServiceId, selectedServiceId);
      setDocuments(cloned);
      setIsCopyModalOpen(false);
      showNotify('success', `Successfully copied ${cloned.length} documents from ${copySourceServiceId} to ${currentService?.title}!`);
    } catch (err: any) {
      showNotify('error', 'Copy failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter(d => {
    const term = searchQuery.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(term) || (d.description && d.description.toLowerCase().includes(term)) || (d.category && d.category.toLowerCase().includes(term));
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalRequired = documents.filter(d => d.isMandatory !== false).length;
  const totalOptional = documents.filter(d => d.isMandatory === false).length;
  const totalActive = documents.filter(d => d.isActive !== false).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold transition-all ${
          notification.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#104A96] text-xs font-bold uppercase tracking-wider mb-2">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Master Service Document Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Document Checklist & Upload Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure required/optional proofs, acceptable formats, descriptions and display order for all services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview Customer Checklist</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Service Selection Tabs / Dropdown */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#104A96]" />
            <span>Select Service to Configure Documents:</span>
          </label>
          <span className="text-[11px] text-slate-400 font-semibold">
            {services.length} Total Services Active
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {services.map((svc) => {
            const isSelected = svc.id === selectedServiceId || svc.slug === selectedServiceId;
            return (
              <button
                key={svc.id}
                type="button"
                onClick={() => setSelectedServiceId(svc.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-[#104A96] text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: svc.accentColor || '#104A96' }}
                />
                <span>{svc.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {svc.documents?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Statistics Banner for Selected Service */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 text-xs font-semibold block">Total Documents</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{documents.length}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-amber-600 text-xs font-semibold block">Required (Mandatory)</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{totalRequired}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-blue-600 text-xs font-semibold block">Optional Proofs</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">{totalOptional}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-emerald-600 text-xs font-semibold block">Active on Website</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{totalActive}</span>
        </div>
      </div>

      {/* Filter and Bulk Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by name/desc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Identity Proof">Identity Proof</option>
            <option value="Address Proof">Address Proof</option>
            <option value="Date of Birth Proof">Date of Birth Proof</option>
            <option value="Financial Proof">Financial Proof</option>
            <option value="Business Proof">Business Proof</option>
            <option value="Photograph / Signature">Photograph / Signature</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Configuration */}
          <button
            type="button"
            onClick={() => setIsCopyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>Copy from Another Service</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when items selected) */}
      {selectedDocIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
          <span className="font-bold text-blue-900">
            {selectedDocIds.length} of {filteredDocuments.length} document(s) selected
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkSetRequired(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold shadow-2xs"
            >
              Set as Required
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetRequired(false)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-2xs"
            >
              Set as Optional
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetActive(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs"
            >
              Activate
            </button>
            <button
              type="button"
              onClick={() => handleBulkSetActive(false)}
              className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-bold shadow-2xs"
            >
              Deactivate
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xs"
            >
              Delete Selected
            </button>
            <button
              type="button"
              onClick={() => setSelectedDocIds([])}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedDocIds.length > 0 && selectedDocIds.length === filteredDocuments.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-[#104A96] rounded border-slate-300 cursor-pointer"
            />
            <span>Order & Document Name</span>
          </div>
          <span>Status & Actions</span>
        </div>

        {/* Rows */}
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">No documents configured for this service.</p>
            <p className="text-xs">Click "Add Document" above to create requirements or copy from another service.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocuments.map((doc, idx) => {
              const isSelected = selectedDocIds.includes(doc.id!);
              const isRequired = doc.isMandatory !== false && !doc.isOptional;

              return (
                <div
                  key={doc.id || idx}
                  className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected ? 'bg-blue-50/50' : !doc.isActive ? 'bg-slate-50/40 opacity-70' : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Left Column: Reorder + Checkbox + Details */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectDoc(doc.id!)}
                      className="w-4 h-4 text-[#104A96] rounded border-slate-300 mt-1 cursor-pointer shrink-0"
                    />

                    {/* Reorder Buttons (Up & Down for Mobile & Desktop) */}
                    <div className="flex flex-col gap-1 shrink-0 mt-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveUp(idx)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-20 text-slate-600"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === filteredDocuments.length - 1}
                        onClick={() => handleMoveDown(idx)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-20 text-slate-600"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Document Info */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug break-words">
                          {doc.name}
                        </h4>

                        {/* Category Badge */}
                        {doc.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {doc.category}
                          </span>
                        )}

                        {/* Requirement Badge (Explicit Required / Optional Fix) */}
                        <button
                          type="button"
                          onClick={() => handleToggleRequired(doc.id!)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                            isRequired
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-blue-100 text-[#104A96] hover:bg-blue-200'
                          }`}
                          title="Click to toggle Required / Optional"
                        >
                          {isRequired ? 'REQUIRED' : 'OPTIONAL'}
                        </button>

                        {/* Visibility Badge */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(doc.id!)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                            doc.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                          title="Click to toggle Active on Website"
                        >
                          {doc.isActive !== false ? 'Active' : 'Disabled'}
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed">
                        {doc.description}
                      </p>

                      {doc.instructions && (
                        <p className="text-[11px] text-[#104A96] font-medium flex items-center gap-1">
                          <span>Guidance:</span>
                          <span className="text-slate-600">{doc.instructions}</span>
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-medium">
                        <span>Formats: {doc.allowedFileTypes?.join(', ').toUpperCase() || 'PDF, JPG, PNG'}</span>
                        <span>Max Size: {doc.maxFileSizeMB || 10} MB</span>
                        {doc.allowMultipleFiles && <span className="text-emerald-700 font-bold">Multiple Files Allowed</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(doc)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#104A96] hover:bg-blue-50 transition-colors"
                      title="Edit Document"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDoc(doc.id!, doc.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 1. ADD / EDIT DOCUMENT MODAL (Requirement 3 & 4)                         */}
      {/* ========================================================================= */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92dvh] overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="shrink-0 p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {editingDoc ? 'Edit Document Specification' : `Add Document to ${currentService?.title}`}
                </h3>
                <p className="text-xs text-slate-500">
                  Changes save directly to Supabase and update the customer-facing upload checklist.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSaveDocForm} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Document Name *</label>
                    <input
                      type="text"
                      required
                      value={docForm.name || ''}
                      onChange={(e) => setDocForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                      placeholder="e.g. Bank Statement or Electricity Bill"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Short Label (For Mobile Cards)</label>
                    <input
                      type="text"
                      value={docForm.shortLabel || ''}
                      onChange={(e) => setDocForm(prev => ({ ...prev, shortLabel: e.target.value }))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                      placeholder="e.g. Bank Proof"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <select
                      value={docForm.category || 'Identity Proof'}
                      onChange={(e) => setDocForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none bg-white"
                    >
                      <option value="Identity Proof">Identity Proof</option>
                      <option value="Address Proof">Address Proof</option>
                      <option value="Date of Birth Proof">Date of Birth Proof</option>
                      <option value="Financial Proof">Financial Proof</option>
                      <option value="Business Proof">Business Proof</option>
                      <option value="Photograph / Signature">Photograph / Signature</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Requirement Status *</label>
                    <select
                      value={docForm.isMandatory ? 'required' : 'optional'}
                      onChange={(e) => setDocForm(prev => ({ ...prev, isMandatory: e.target.value === 'required' }))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none bg-white font-bold"
                    >
                      <option value="required">REQUIRED (Mandatory — blocks submission)</option>
                      <option value="optional">OPTIONAL (Supplementary — does not block submission)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Document Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={docForm.description || ''}
                    onChange={(e) => setDocForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    placeholder="Short description of what the customer must upload..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Special Upload Guidance / Instructions</label>
                  <textarea
                    rows={2}
                    value={docForm.instructions || ''}
                    onChange={(e) => setDocForm(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    placeholder="e.g. Ensure all 4 corners are visible. Scans with glare will be rejected."
                  />
                </div>

                {/* Upload Constraints */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Upload Configurations</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">Max File Size (MB)</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={docForm.maxFileSizeMB || 10}
                        onChange={(e) => setDocForm(prev => ({ ...prev, maxFileSizeMB: Number(e.target.value) }))}
                        className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <input
                        type="checkbox"
                        id="multiFiles"
                        checked={docForm.allowMultipleFiles || false}
                        onChange={(e) => setDocForm(prev => ({ ...prev, allowMultipleFiles: e.target.checked }))}
                        className="w-4 h-4 text-[#104A96] rounded border-slate-300 cursor-pointer"
                      />
                      <label htmlFor="multiFiles" className="text-xs font-bold text-slate-700 cursor-pointer">
                        Allow customer to upload multiple files
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="activeToggle"
                      checked={docForm.isActive !== false}
                      onChange={(e) => setDocForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-[#104A96] rounded border-slate-300 cursor-pointer"
                    />
                    <label htmlFor="activeToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Active on public customer checklist
                    </label>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="shrink-0 p-4 sm:p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSaving ? 'Saving to Database...' : editingDoc ? 'Save & Synchronize' : 'Add Document'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. COPY CONFIGURATION MODAL (Requirement 7)                              */}
      {/* ========================================================================= */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Copy className="w-4 h-4 text-[#104A96]" />
                <span>Copy Document Checklist</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Copy all document requirements from an existing service into <strong>{currentService?.title}</strong>. This creates independent copies that you can customize separately.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Source Service:</label>
              <select
                value={copySourceServiceId}
                onChange={(e) => setCopySourceServiceId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none bg-white"
              >
                <option value="">-- Choose Source Service --</option>
                {services.filter(s => s.id !== selectedServiceId).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.documents?.length || 0} documents)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving || !copySourceServiceId}
                onClick={handleCopyDocuments}
                className="px-5 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] disabled:opacity-50 text-white text-xs font-bold shadow-md"
              >
                {isSaving ? 'Copying...' : 'Copy Checklist'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CUSTOMER-FACING PREVIEW MODAL (Requirement 13 & matches image copy 23) */}
      {/* ========================================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-hidden">
          <div className="bg-[#FAFBFD] rounded-2xl sm:rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92dvh] overflow-hidden my-auto">
            
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Live Customer Preview
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  Document Checklist for {currentService?.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 overscroll-contain">
              {documents.filter(d => d.isActive !== false).map((doc, idx) => {
                const isRequired = doc.isMandatory !== false && !doc.isOptional;
                return (
                  <div
                    key={doc.id || idx}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-600">
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            {doc.name}
                          </h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isRequired ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isRequired ? 'REQUIRED' : 'OPTIONAL'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {doc.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-700 flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>Ready</span>
                      </button>

                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#104A96] text-white flex items-center gap-1.5 shadow-xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 p-4 border-t border-slate-200 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-500">
                This exact appearance is displayed on <code>/services/{currentService?.slug}</code>
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
