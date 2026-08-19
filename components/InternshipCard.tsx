import React, { useState, useEffect } from 'react';
import { Internship, Student } from '../types';
import { calculateMatchScore } from '../services/matchingService';
import { MapPinIcon, BriefcaseIcon, CheckCircleIcon, XCircleIcon, CalendarDaysIcon, XMarkIcon, WalletIcon, SparklesIcon, InformationCircleIcon } from './common/Icons';
import Button from './common/Button';
import { useNavigate } from 'react-router-dom';

interface InternshipCardProps {
  internship: Internship;
  student: Student;
  onDislike: (internshipId: number) => void;
  onApply: (internshipId: number, internshipTitle: string) => void;
  onWithdraw: (internship: Internship) => void;
  isApplied: boolean;
  score?: number;
}

const InternshipCard: React.FC<InternshipCardProps> = ({ internship, student, onDislike, onApply, onWithdraw, isApplied, score }) => {
  const [matchScore, setMatchScore] = useState<number>(score || 0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const navigate = useNavigate();

  const studentSkills = new Set((student.skills || []).map(s => s.toLowerCase()));
  const requiredSkills = internship.requiredSkills || [];
  
  const matchedSkills = requiredSkills.filter(s => studentSkills.has(s.toLowerCase()));
  const missingSkills = requiredSkills.filter(s => !studentSkills.has(s.toLowerCase()));

  useEffect(() => {
    if (score !== undefined) {
      setMatchScore(score);
    } else {
      const fetchScore = async () => {
        const s = await calculateMatchScore(student, internship);
        setMatchScore(s);
      };
      fetchScore();
    }
  }, [internship, student, score]);

  const getScoreBadgeColor = (val: number) => {
    if (val >= 80) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800';
    if (val >= 60) return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800';
    if (val >= 40) return 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800';
    return 'text-rose-500 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800';
  };

  return (
    <>
      <div className="group relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-premium hover:shadow-premium-hover transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
        {/* Match Glow */}
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-50/50 dark:bg-brand-900/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="relative flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="inline-block px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-2">
              {internship.sector}
            </div>
            <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-brand-600 transition-colors">
              {internship.title}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{internship.company}</p>
          </div>

          {/* AI Match Score Badge */}
          <button
            onClick={() => setShowMatchModal(true)}
            title="Click to view AI Match Breakdown"
            className={`relative flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl shadow-sm border transition-all hover:scale-105 cursor-pointer ${getScoreBadgeColor(matchScore)}`}
          >
            <span className="text-[9px] font-extrabold uppercase tracking-wider leading-none mb-1">AI Match</span>
            <span className="text-lg font-display font-black leading-none">
              {matchScore}%
            </span>
          </button>
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-6">
            {internship.description}
          </p>

          {/* Skills Breakdown */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.slice(0, 4).map(skill => {
                const hasSkill = studentSkills.has(skill.toLowerCase());
                return (
                  <span
                    key={skill}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                      hasSkill
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
                    }`}
                  >
                    <span>{hasSkill ? '✓' : '•'}</span>
                    <span>{skill}</span>
                  </span>
                );
              })}
              {requiredSkills.length > 4 && (
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400">+{requiredSkills.length - 4} more</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <MapPinIcon className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-medium truncate">{internship.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <WalletIcon className="h-4 w-4 text-accent-400" />
              <span className="text-xs font-medium truncate">{internship.stipend || 'Competitive'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 col-span-2">
              <CalendarDaysIcon className="h-4 w-4 text-brand-400" />
              <span className="text-xs font-medium">
                Apply by {new Date(internship.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <div className="flex-1">
            {isApplied ? (
              <Button
                onClick={() => onWithdraw(internship)}
                className="w-full !rounded-2xl border-rose-100 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                variant="light"
              >
                Withdraw
              </Button>
            ) : (
              <Button
                onClick={() => onApply(internship.id, internship.title)}
                className="w-full !rounded-2xl shadow-brand-100 group-hover:scale-[1.02]"
              >
                Apply Now
              </Button>
            )}
          </div>
          <button
            onClick={() => onDislike(internship.id)}
            className="p-3 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
            title="Not interested"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* AI Match Breakdown Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">AI Match Breakdown</h3>
              </div>
              <button
                onClick={() => setShowMatchModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Total Match Score</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{internship.title} • {internship.company}</div>
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {matchScore}%
              </div>
            </div>

            {/* Matched Skills */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircleIcon className="h-4 w-4" />
                <span>Skills You Possess ({matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.length > 0 ? (
                  matchedSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No direct skill matches found yet.</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <InformationCircleIcon className="h-4 w-4" />
                <span>Missing Skills to Bridge ({missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.length > 0 ? (
                  missingSkills.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-semibold">
                      + {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">All required skills met!</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              {missingSkills.length > 0 ? (
                <Button
                  onClick={() => {
                    setShowMatchModal(false);
                    navigate('/student/upskilling');
                  }}
                  variant="primary"
                  size="sm"
                  className="!rounded-xl text-xs bg-indigo-600"
                >
                  🚀 Upskill in Hub
                </Button>
              ) : null}
              <Button
                onClick={() => setShowMatchModal(false)}
                variant="light"
                size="sm"
                className="!rounded-xl text-xs ml-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InternshipCard;