import React from 'react';
import Sidebar from '../components/Sidebar';
import { Mail, Instagram, Linkedin, Github, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export default function ContactUs() {
  const contactOptions = [
    {
      name: 'Email Support',
      icon: Mail,
      description: 'Send us an email for general inquiries or technical support.',
      link: 'mailto:suyalpriyanshu2@gmail.com?subject=TaskPilot Support',
      label: 'Reach Out',
      color: 'bg-[#EA4335]'
      
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      description: 'Connect professionally and reach out via LinkedIn.',
      link: 'https://www.linkedin.com/in/priyanshu-suyal-5732b224a?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      label: 'Reach Out',
      color: 'bg-[#0077B5]'
     
    },
    {
      name: 'Instagram',
      icon: Instagram,
      description: 'Follow us for updates and DM for quick questions.',
      link: 'https://www.instagram.com/priyanshu_suyal_?igsh=MW54MmNqYzhyeTlpOA==',
      label: 'Reach Out',
      color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
      
    }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white overflow-hidden relative">
      
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto h-full no-scrollbar pt-40 sm:pt-8 p-5 sm:p-14 relative">
        <header className="mb-16 relative z-10">
          <h1 className="text-2xl font-bold text-slate-100 mb-1 tracking-tight">Contact Us</h1>
          <p className="text-slate-400 text-sm font-medium ">
            Reach out to our team directly through any of these platforms.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
          {contactOptions.map((option, idx) => (
            <div 
              key={idx}
              className="group bg-slate-900 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 hover:slate-600 transition-all duration-300 hover:translate-y-[-4px] shadow-xl flex flex-col"
            >
              <div className={clsx(
                "w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg",
                option.color, option.shadow
              )}>
                <option.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{option.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">
                {option.description}
              </p>

              <a 
                href={option.link}
                target={option.link.startsWith('mailto') ? '_self' : '_blank'}
                rel="noopener noreferrer"
                className={clsx(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all w-full justify-center shadow-lg",
                  option.color, "hover:brightness-110 active:scale-[0.98]", option.shadow
                )}
              >
                {option.label} <ArrowRight className="w-4 h-4 opacity-80" />
              </a>
            </div>
          ))}
        </div>

        <footer className="mt-16 pt-8 border-t border-slate-800/50 text-center relative z-10">
          <p className="text-slate-500 text-sm font-medium">
            Connect with us professionally &bull; Response time: Typically within 24 hours
          </p>
        </footer>
      </main>
    </div>
  );
}
