import { useState } from 'react';
import { useLanguage } from '../../context';

export default function DashboardHelp() {
  const { t } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqItems = [
    {
      question: t.dashboard.faq,
      answer: t.dashboard.supportDescription,
    },
  ];

  const guideSteps = [
    {
      title: t.dashboard.createProfile,
      description: t.dashboard.createProfileDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: t.dashboard.publishAd,
      description: t.dashboard.publishAdDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      title: t.dashboard.receiveInquiries,
      description: t.dashboard.receiveInquiriesDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      title: t.dashboard.closeDeal,
      description: t.dashboard.closeDealDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.helpAndGuide}</h1>
        <p className="text-gray-500 dark:text-gray-400">{t.dashboard.learnPlatform}</p>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t.dashboard.howToStart}</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {guideSteps.map((step, index) => (
            <div key={index} className="relative">
              {index < guideSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 z-0"></div>
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#e85d45]/10 text-[#e85d45] flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <span className="text-xs text-[#e85d45] font-medium mb-1">{index + 1}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorial */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t.dashboard.videoTutorial}</h2>
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#e85d45] text-white flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-[#d54d35] transition-colors">
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t.dashboard.watchTutorial}</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t.dashboard.faq}</h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFAQ === index && (
                <div className="px-4 pb-4">
                  <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-[#e85d45] to-[#ff7b5a] rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">{t.dashboard.contactSupport}</h2>
            <p className="text-white/80">{t.dashboard.supportDescription}</p>
          </div>
          <div className="flex gap-3">
            <a
              href="mailto:support@rentandco.rs"
              className="px-4 py-2 bg-white text-[#e85d45] rounded-lg font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t.dashboard.sendEmail}
            </a>
          </div>
        </div>
      </div>

      {/* Useful Links */}
      <div className="grid md:grid-cols-3 gap-6">
        <a
          href="/terms"
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#e85d45] transition-colors group"
        >
          <svg className="w-8 h-8 text-[#e85d45] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">{t.dashboard.termsOfService}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.readTerms}</p>
        </a>
        <a
          href="/privacy"
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#e85d45] transition-colors group"
        >
          <svg className="w-8 h-8 text-[#e85d45] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">{t.dashboard.privacyPolicy}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.dataProtection}</p>
        </a>
        <a
          href="/about"
          className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#e85d45] transition-colors group"
        >
          <svg className="w-8 h-8 text-[#e85d45] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-[#e85d45] transition-colors">{t.dashboard.aboutUs}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.learnMoreAbout}</p>
        </a>
      </div>
    </div>
  );
}
