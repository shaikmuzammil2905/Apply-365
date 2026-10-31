import React, { useState, useEffect } from 'react';
import { getCourses, saveCourse, deleteCourse } from '../../services/dataSyncService';
import { uploadToCloudinary } from '../../services/cloudinaryService';
import { Course } from '../../types/admin';
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Check, 
  X, 
  Search, 
  Sparkles,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    slug: '',
    category: 'Government Services',
    shortDescription: '',
    fullDescription: '',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    duration: '4 Weeks',
    price: '₹3,999',
    features: ['Live Portal Training', 'Certificate of Completion', 'Document Checklists'],
    eligibility: '10th / 12th Pass or Basic Computer Knowledge',
    isPublished: true,
    displayOrder: 1,
  });

  const [featuresText, setFeaturesText] = useState('');

  const loadCourses = async () => {
    const list = await getCourses();
    setCourses(list);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      slug: '',
      category: 'Government Services',
      shortDescription: '',
      fullDescription: '',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      duration: '4 Weeks',
      price: '₹3,999',
      features: ['Practical Portal Training', 'Official Certificate', 'Step-by-Step SOPs'],
      eligibility: '10th / 12th Pass or Graduate',
      isPublished: true,
      displayOrder: courses.length + 1,
    });
    setFeaturesText('Practical Portal Training\nOfficial Certificate\nStep-by-Step SOPs');
    setUploadStatus('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Course) => {
    setEditingCourse(c);
    setFormData(c);
    setFeaturesText(c.features.join('\n'));
    setUploadStatus('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading image to Cloudinary...');
    try {
      const res = await uploadToCloudinary(file, 'courses');
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, imageUrl: res.url }));
        setUploadStatus(res.isFallback ? 'Image attached via local storage backup' : 'Uploaded successfully to Cloudinary!');
      } else {
        setUploadStatus('Failed to upload image. Please try another file.');
      }
    } catch (err: any) {
      setUploadStatus('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const features = featuresText.split('\n').map(f => f.trim()).filter(Boolean);

    const payload: Course = {
      id: editingCourse ? editingCourse.id : `course-${Date.now()}`,
      slug,
      title: formData.title!,
      category: formData.category || 'Professional',
      shortDescription: formData.shortDescription || '',
      fullDescription: formData.fullDescription || formData.shortDescription || '',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      thumbnailUrl: formData.imageUrl,
      duration: formData.duration || 'Flexible',
      price: formData.price || 'Contact for Fee',
      features,
      eligibility: formData.eligibility || 'Open to all',
      isPublished: formData.isPublished ?? true,
      displayOrder: Number(formData.displayOrder) || 1,
      createdAt: editingCourse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCourse(payload);
    await loadCourses();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove the course "${title}"? It will be removed from the public website.`)) {
      await deleteCourse(id);
      await loadCourses();
    }
  };

  const togglePublish = async (course: Course) => {
    const updated = { ...course, isPublished: !course.isPublished };
    await saveCourse(updated);
    await loadCourses();
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#104A96]" />
            <span>Courses & Certification Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, upload media and publish vocational certification courses. Live synced with the public website.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
          Showing <span className="font-bold text-slate-900">{filteredCourses.length}</span> of {courses.length} courses
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => (
          <div 
            key={course.id}
            className={`bg-white rounded-2xl border ${course.isPublished ? 'border-slate-200/90' : 'border-amber-200 bg-amber-50/20'} overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div>
              {/* Thumbnail Image */}
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
                    {course.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={() => togglePublish(course)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm transition-colors ${
                      course.isPublished 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}
                    title={course.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                  >
                    {course.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{course.isPublished ? 'Live on Site' : 'Draft'}</span>
                  </button>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Duration: {course.duration}</span>
                  <span className="font-bold text-[#104A96]">{course.price}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {course.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {course.shortDescription}
                </p>

                {/* Features Snippet */}
                <div className="pt-2">
                  <div className="flex flex-wrap gap-1">
                    {course.features.slice(0, 2).map((f, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        ✓ {f}
                      </span>
                    ))}
                    {course.features.length > 2 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{course.features.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`/courses/${course.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-500 hover:text-[#104A96] inline-flex items-center gap-1"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(course)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-[#104A96] hover:bg-blue-50 transition-colors"
                  title="Edit Course"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(course.id, course.title)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Course Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingCourse ? 'Edit Course' : 'Create New Vocational Course'}
                </h3>
                <p className="text-xs text-slate-500">
                  Changes save directly to Supabase and reflect on the public website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    placeholder="e.g. Digital Seva Kendra Operator"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  >
                    <option value="Government Services">Government Services</option>
                    <option value="Taxation & Accounting">Taxation & Accounting</option>
                    <option value="Human Resources & Labour Law">Human Resources & Labour Law</option>
                    <option value="Business Advisory">Business Advisory</option>
                    <option value="Skill Development">Skill Development</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    placeholder="e.g. 6 Weeks"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course Price / Fee</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    placeholder="e.g. ₹4,999"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: Number(e.target.value) }))}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Course Image (Cloudinary Integration)</span>
                  <span className="text-[10px] text-slate-500 font-normal">Preset: ml_default</span>
                </label>
                
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#104A96] file:text-white hover:file:bg-[#07366F] cursor-pointer"
                  />
                  {isUploading && (
                    <span className="text-xs text-amber-600 font-semibold animate-pulse">
                      Uploading to Cloudinary...
                    </span>
                  )}
                </div>

                {uploadStatus && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {uploadStatus}
                  </p>
                )}

                <div className="pt-1">
                  <label className="text-[11px] text-slate-500">Or Image URL:</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Short Summary</label>
                <textarea
                  rows={2}
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  placeholder="A concise 1-2 sentence overview for course cards..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Syllabus / Description</label>
                <textarea
                  rows={3}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullDescription: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  placeholder="Detailed breakdown of modules, portal practicals and guidance..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Course Highlights (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                  placeholder="Live Portal Filing&#10;Certificate of Completion&#10;Doubt Assistance"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishToggle"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="w-4 h-4 text-[#104A96] rounded border-slate-300"
                />
                <label htmlFor="publishToggle" className="text-xs font-bold text-slate-800">
                  Publish to Main Website immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white text-xs font-bold shadow-md transition-all active:scale-95"
                >
                  {editingCourse ? 'Save & Synchronize' : 'Create Course'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
