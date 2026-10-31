import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourseBySlug, submitLead } from '../services/dataSyncService';
import { uploadToCloudinary } from '../services/cloudinaryService';
import { Course } from '../types/admin';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Upload, 
  Send, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Check, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (slug) {
      getCourseBySlug(slug).then(c => {
        setCourse(c);
        setIsLoading(false);
      });
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !course) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      let attachments: any[] = [];
      if (attachedFile) {
        const uploadRes = await uploadToCloudinary(attachedFile, 'course_enquiries');
        if (uploadRes.success && uploadRes.url) {
          attachments.push({
            name: attachedFile.name,
            url: uploadRes.url,
            type: attachedFile.type,
            sizeBytes: attachedFile.size
          });
        }
      }

      const lead = await submitLead({
        customerName: name,
        mobile,
        email,
        leadType: 'course_enquiry',
        targetId: course.id,
        targetTitle: course.title,
        message: message || `Enquiry for ${course.title}`,
        attachments
      });

      setSubmittedLeadId(lead.id);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#104A96] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
          <p className="text-xs text-slate-500">The requested course could not be located or has been archived.</p>
          <Link to="/courses" className="inline-block px-5 py-2.5 rounded-xl bg-[#104A96] text-white font-bold text-xs">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] pb-20">
      
      {/* Top Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-[#104A96] to-[#07366F] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Breadcrumbs items={[
            { label: 'Courses', href: '/courses' },
            { label: course.title }
          ]} />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{course.category}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200 pt-2">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Duration: {course.duration}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#FF8500] text-white px-3 py-1 rounded-lg font-bold">
              <span>Course Fee: {course.price}</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Course Details (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Banner Image */}
            <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-72 sm:h-96 object-cover"
              />
            </div>

            {/* Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Course Syllabus & Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {course.fullDescription || course.shortDescription}
              </p>
            </div>

            {/* Features & Key Takeaways */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                What You Will Learn & Practical Modules
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {course.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Eligibility & Prerequisites
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                {course.eligibility || 'Open to all interested candidates with basic computer literacy.'}
              </p>
            </div>

          </div>

          {/* Application & Enquiry Form (1 col) */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md sticky top-24 space-y-5">
              
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] uppercase font-bold text-[#FF8500] tracking-wider block">
                  Enrollment Inquiry
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  Register for this Course
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your details to reserve a batch seat or request curriculum counseling.
                </p>
              </div>

              {submittedLeadId ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">
                    Inquiry Received Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Thank you, <span className="font-bold">{name}</span>. Your enquiry reference ID is <span className="font-mono font-bold">{submittedLeadId}</span>.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Our course advisor will connect with you via phone / WhatsApp shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedLeadId(null)}
                    className="text-xs font-bold text-[#104A96] hover:underline block mx-auto pt-2"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Mobile Number (with WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Special Note or Questions</label>
                    <textarea
                      rows={2}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask about batch timings, fee installments or curriculum..."
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-[#104A96] focus:outline-none"
                    />
                  </div>

                  {/* Supporting Document / ID Photo Upload */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Attach Profile Photo or Qualification Doc (Optional):
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-[#104A96] file:text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#FF8500] hover:bg-[#e67700] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting Application...' : 'Submit Course Inquiry'}</span>
                  </button>

                  <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>100% Privacy Protected & No Spam</span>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

