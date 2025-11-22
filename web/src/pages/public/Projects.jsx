import React from 'react';
import { Folder, ArrowRight } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: 'Gender Sensitivity Training Program',
      description: 'Comprehensive training modules designed to enhance awareness and understanding of gender issues among faculty, staff, and students.',
      link: '/projects/gender-sensitivity-training',
      image: '/assets/projects/gender-training.jpg'
    },
    {
      title: 'Women in STEM Initiative',
      description: 'Programs and activities aimed at encouraging and supporting women in Science, Technology, Engineering, and Mathematics fields.',
      link: '/projects/women-in-stem',
      image: '/assets/projects/women-stem.jpg'
    },
    {
      title: 'Safe Campus Campaign',
      description: 'Multi-faceted initiative to create and maintain safe, respectful spaces throughout the university campus.',
      link: '/projects/safe-campus',
      image: '/assets/projects/safe-campus.jpg'
    },
    {
      title: 'Gender-Responsive Budget Allocation',
      description: 'Framework for integrating gender perspectives into institutional budgeting and resource allocation processes.',
      link: '/projects/gender-responsive-budget',
      image: '/assets/projects/budget.jpg'
    },
    {
      title: 'Leadership Development for Women',
      description: 'Capacity-building programs designed to develop leadership skills and competencies among female students and employees.',
      link: '/projects/leadership-development',
      image: '/assets/projects/leadership.jpg'
    },
    {
      title: 'Gender and Development Research',
      description: 'Institutional research initiatives examining gender issues, gaps, and opportunities within the university context.',
      link: '/projects/gad-research',
      image: '/assets/projects/research.jpg'
    },
    {
      title: 'Community Outreach and Extension',
      description: 'Programs extending GAD advocacy and services to partner communities and external stakeholders.',
      link: '/projects/community-outreach',
      image: '/assets/projects/outreach.jpg'
    },
    {
      title: 'Gender Audit and Assessment',
      description: 'Systematic evaluation of institutional policies, programs, and practices from a gender perspective.',
      link: '/projects/gender-audit',
      image: '/assets/projects/audit.jpg'
    }
  ];

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoLTh2LThoOHptLTE2IDB2OGgtOHYtOGg4em0xNi0xNnY4aC04di04aDh6bS0xNiAwdjhoLTh2LThoOHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-5xl mx-auto px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            GAD Programs and Projects
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-violet-400 to-purple-400 mx-auto mb-8"></div>
          <p className="text-lg text-violet-200 max-w-3xl mx-auto leading-relaxed">
            Strategic initiatives advancing gender equality and inclusive development at Technological University of the Philippines - Taguig
          </p>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Program Overview</h2>
          <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed space-y-4">
            <p>
              The GAD Office implements a diverse portfolio of programs and projects designed to promote gender equality, empower marginalized sectors, and create an inclusive institutional environment. These initiatives align with the university's strategic goals and national GAD mandates.
            </p>
            <p>
              Our programs are evidence-based, regularly evaluated, and designed to create sustainable impact. They address various dimensions of gender and development including capacity building, policy advocacy, research, and community engagement.
            </p>
            <p>
              Each project is implemented in collaboration with relevant departments, committees, and stakeholders to ensure comprehensive reach and effective outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Active Programs and Projects</h2>
          
          <div className="space-y-6">
            {projects.map((project, idx) => (
              <a
                key={idx}
                href={project.link}
                className="block bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-violet-400 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-72 h-56 md:h-auto bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0 overflow-hidden relative">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full items-center justify-center absolute inset-0">
                      <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Folder className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 flex-1 flex items-center">
                    <div className="flex items-start justify-between gap-6 w-full">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-violet-700 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="inline-flex items-center gap-2 text-violet-600 font-medium text-sm flex-shrink-0 group-hover:gap-3 transition-all">
                        View Details
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <p className="text-slate-600 leading-relaxed">
            For more information about our programs or partnership opportunities, please contact the GAD Office at <a href="mailto:gad@tup.edu.ph" className="text-violet-600 hover:underline font-medium">gad@tup.edu.ph</a>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Projects;