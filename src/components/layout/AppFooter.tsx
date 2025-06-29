import React from 'react';

export const AppFooter: React.FC = () => {
  return (
    <footer className="bg-slate-800 dark:bg-slate-900 text-slate-300 dark:text-slate-400 text-center p-8 mt-16 border-t border-slate-700 dark:border-slate-600">
      <p className="text-sm">&copy; {new Date().getFullYear()} Wizard Tech, LLC.</p>
      <p className="text-xs mt-2 opacity-80">
        This tool is for informational purposes only. Always consult with a healthcare professional before making significant changes to your diet or exercise routine.
      </p>
    </footer>
  );
};