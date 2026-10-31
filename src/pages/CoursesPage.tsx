import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedCourses } from '../services/dataSyncService';
import { Course } from '../types/admin';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { 
  GraduationCap, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Search,
  BookOpen
} from 'lucide-react';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublishedCourses().then(list => {
      setCourses(list);
      setIsLoading(false);
    });

    const handleSync = () => {
      getPublishedCourses().then(setCourses);
    };
    window.addEventListener('apply365_data_sync', handleSync);
    return () => window.removeEventListener('apply365_data_sync', handleSync);
  }, []);

  const categories = ['all', ...Array.from(new Set(courses.map(c => c.category)))];

  const filtered = courses.filter(c => {
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFBFD] pb-20">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-[#104A96] to-[#07366F] text-white py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Breadcrumbs items={[{ label: 'Vocational & Portal Courses' }]} />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Certified Professional Programs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Government Portal & Compliance Training Courses
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            Gain job-ready practical training in Digital Seva Kendra operations, GST compliance, EPF/ESI payroll laws and MSME business advisory.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#104A96]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#104A96] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-700">No courses found matching your criteria.</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or searching for another term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#104A96] shadow-sm backdrop-blur-xs">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{course.duration}</span>
                      </span>
                      <span className="text-sm font-extrabold text-[#104A96] bg-blue-50 px-2.5 py-0.5 rounded-lg">
                        {course.price}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#104A96] transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      {course.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#104A96] hover:bg-[#07366F] text-white font-bold text-xs shadow-md transition-all active:scale-95 group-hover:bg-[#FF8500]"
                  >
                    <span>View Syllabus & Apply</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

