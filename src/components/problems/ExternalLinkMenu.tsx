import React, { useState, useRef, useEffect } from 'react';
import { Problem } from '../../types/dataset';
import { ExternalLink, ChevronDown, Code2, Globe, Youtube, BookOpen } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ExternalLinkMenuProps {
  problem: Problem;
  className?: string;
}

export const ExternalLinkMenu: React.FC<ExternalLinkMenuProps> = ({ problem, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasMultipleLinks = problem.alternate_urls && problem.alternate_urls.length > 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getPlatformLabel = (url: string) => {
    if (url.includes('leetcode.com')) return 'LeetCode';
    if (url.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
    if (url.includes('takeuforward.org')) return 'TakeUForward Practice';
    if (url.includes('naukri.com') || url.includes('codingninjas.com')) return 'CodeStudio / 360';
    if (url.includes('interviewbit.com')) return 'InterviewBit';
    return 'Practice Platform';
  };

  const getPlatformIcon = (url: string) => {
    if (url.includes('leetcode.com')) {
      return <Code2 className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (url.includes('geeksforgeeks.org')) {
      return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (url.includes('takeuforward.org')) {
      return <Code2 className="w-3.5 h-3.5 text-red-400" />;
    }
    return <Globe className="w-3.5 h-3.5 text-blue-400" />;
  };

  if (!hasMultipleLinks && !problem.video_url && !problem.source_url) {
    return (
      <a
        href={problem.primary_url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Practice ${problem.title} on ${problem.platform}`}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-colors shrink-0',
          className
        )}
      >
        {getPlatformIcon(problem.primary_url)}
        <span>{problem.platform}</span>
        <ExternalLink className="w-3 h-3 text-slate-400" />
      </a>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div className="inline-flex rounded-md shadow-sm">
        {/* Direct primary link */}
        <a
          href={problem.primary_url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Practice on ${problem.platform}`}
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-l-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-r-0 border-slate-700/80 hover:border-slate-600 transition-colors',
            className
          )}
        >
          {getPlatformIcon(problem.primary_url)}
          <span>{problem.platform}</span>
          <ExternalLink className="w-3 h-3 text-slate-400 ml-0.5" />
        </a>

        {/* Dropdown trigger for alternatives */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          title="More practice links and resources"
          className="inline-flex items-center px-1.5 py-1 text-xs font-medium rounded-r-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 hover:border-slate-600 transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-lg bg-slate-900 border border-slate-700 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Practice Platforms
          </div>

          {/* Primary */}
          <a
            href={problem.primary_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              {getPlatformIcon(problem.primary_url)}
              <span className="font-medium">{getPlatformLabel(problem.primary_url)}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/40">
                Primary
              </span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* Alternate URLs */}
          {problem.alternate_urls.map((altUrl, idx) => (
            <a
              key={idx}
              href={altUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getPlatformIcon(altUrl)}
                <span>{getPlatformLabel(altUrl)}</span>
              </div>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ))}

          {/* Optional Learning Resources (editorial article, video solution) */}
          {(problem.source_url || problem.video_url) && (
            <>
              <div className="px-3 py-1.5 border-t border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Learning Resources
              </div>
              {problem.source_url && (
                <a
                  href={problem.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                    <span>Editorial / Article</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {problem.video_url && (
                <a
                  href={problem.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Youtube className="w-3.5 h-3.5 text-red-500" />
                    <span>Video Explanation</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
