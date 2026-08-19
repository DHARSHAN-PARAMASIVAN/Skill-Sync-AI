import React, { useState, useEffect } from 'react';
import { Student, SkillGapResult, LearningRoadmap, LearningRoadmapPhase } from '../types';
import { api } from '../services/api';
import Button from './common/Button';
import {
  ArrowTopRightOnSquareIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CheckBadgeIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowPathIcon
} from './common/Icons';

interface UpskillingProps {
  student: Student;
}

const Upskilling: React.FC<UpskillingProps> = ({ student }) => {
  const [skillGapData, setSkillGapData] = useState<SkillGapResult | null>(null);
  const [roadmapData, setRoadmapData] = useState<LearningRoadmap | null>(null);
  const [loadingGap, setLoadingGap] = useState(true);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState(student.careerGoals || '');

  // Fetch initial Skill Gap analysis
  useEffect(() => {
    fetchSkillGapAndRoadmap();
  }, [student]);

  const fetchSkillGapAndRoadmap = async () => {
    setLoadingGap(true);
    try {
      // 1. Fetch AI Skill Gap
      const gapRes: SkillGapResult = await api.getSkillGap({
        studentSkills: student.skills || [],
        careerGoal: student.careerGoals
      });
      setSkillGapData(gapRes);

      // 2. Fetch Personalized Roadmap based on identified missing skills
      const missingSkillsList = gapRes.missingSkills.map(m => m.skill);
      fetchPersonalizedRoadmap(missingSkillsList);
    } catch (err) {
      console.error("Failed to load skill gap", err);
    } finally {
      setLoadingGap(false);
    }
  };

  const fetchPersonalizedRoadmap = async (missingSkills?: string[]) => {
    setLoadingRoadmap(true);
    try {
      const skillsToUse = missingSkills || (skillGapData?.missingSkills.map(m => m.skill) || []);
      const roadmapRes: LearningRoadmap = await api.getLearningRoadmap({
        studentId: student.id,
        missingSkills: skillsToUse,
        careerGoal: customGoal || student.careerGoals,
        currentSkills: student.skills
      });
      setRoadmapData(roadmapRes);
    } catch (err) {
      console.error("Failed to load roadmap", err);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const toggleStepCompleted = (stepKey: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepKey) ? prev.filter(k => k !== stepKey) : [...prev, stepKey]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-brand-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-indigo-100 font-bold uppercase tracking-wider text-[11px]">
              <SparklesIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>AI Feature 3 & 4 • Skill Gap & Roadmap Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight">
              Personalized Upskilling & Growth Hub
            </h1>
            <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
              AI compares your current skills against high-match internship requirements, identifies your exact skill gaps, and constructs a step-by-step career mastery roadmap.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
              <div className="text-indigo-200 text-[11px] font-bold uppercase tracking-wider mb-1">
                Current Skill Match
              </div>
              <div className="text-3xl font-black text-white">
                {skillGapData ? `${skillGapData.matchPercentage}%` : '...'}
              </div>
            </div>
          </div>
        </div>

        {/* Abstract Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
      </div>

      {/* Feature 3: AI Skill Gap Analysis Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
              <LightBulbIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                <span>AI Skill Gap Analysis</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Identified Missing Skills</h2>
            </div>
          </div>

          <Button
            onClick={() => fetchSkillGapAndRoadmap()}
            variant="light"
            size="sm"
            disabled={loadingGap}
            className="!rounded-xl text-xs self-start md:self-auto"
          >
            <ArrowPathIcon className={`h-3.5 w-3.5 mr-1.5 ${loadingGap ? 'animate-spin' : ''}`} />
            Re-analyze Profile
          </Button>
        </div>

        {loadingGap ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Running AI skill gap analysis against top internships...</p>
          </div>
        ) : skillGapData && skillGapData.missingSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillGapData.missingSkills.map((m, idx) => (
              <div
                key={m.skill}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-bold text-gray-900 dark:text-white text-base">{m.skill}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                    m.priority === 'High'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                      : m.priority === 'Medium'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                    {m.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {m.reason}
                </p>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                  <span>⏱️ Est. Time: {m.estimatedTimeToLearn}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+15% Match Boost</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-8 rounded-3xl text-center">
            <CheckBadgeIcon className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">Excellent Skill Coverage!</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">You already possess the core skills required for your top matched internships.</p>
          </div>
        )}
      </section>

      {/* Feature 4: Personalized Step-by-Step Learning Roadmap Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                <span>Personalized Learning Roadmap</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Step-by-Step Mastery Path</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Target Career Goal..."
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <Button
              onClick={() => fetchPersonalizedRoadmap()}
              variant="primary"
              size="sm"
              disabled={loadingRoadmap}
              className="!rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700"
            >
              {loadingRoadmap ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : 'Regenerate'}
            </Button>
          </div>
        </div>

        {loadingRoadmap ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Generating personalized multi-phase roadmap with Groq AI...</p>
          </div>
        ) : roadmapData ? (
          <div className="space-y-6">
            {/* Phase Selector Tabs */}
            <div className="flex flex-wrap gap-3 border-b border-gray-200 dark:border-gray-700 pb-4">
              {roadmapData.phases.map((phase, idx) => (
                <button
                  key={phase.phaseNumber}
                  onClick={() => setActivePhaseIndex(idx)}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
                    activePhaseIndex === idx
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-400'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    activePhaseIndex === idx ? 'bg-white text-indigo-600 font-black' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {phase.phaseNumber}
                  </span>
                  <span>{phase.phaseTitle}</span>
                  <span className="text-[10px] opacity-75 font-normal">({phase.duration})</span>
                </button>
              ))}
            </div>

            {/* Active Phase Details */}
            {(() => {
              const phase = roadmapData.phases[activePhaseIndex] || roadmapData.phases[0];
              if (!phase) return null;

              return (
                <div className="space-y-6 animate-in fade-in">
                  {/* Phase Goals */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
                      Phase {phase.phaseNumber} Milestones & Goals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.goals.map((goal, gIdx) => {
                        const stepId = `goal-${phase.phaseNumber}-${gIdx}`;
                        const isDone = completedSteps.includes(stepId);
                        return (
                          <div
                            key={gIdx}
                            onClick={() => toggleStepCompleted(stepId)}
                            className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                              isDone
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800'
                                : 'bg-gray-50 dark:bg-gray-900/40 border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              readOnly
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                            />
                            <span className={`text-xs ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200 font-medium'}`}>
                              {goal}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Courses */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        <AcademicCapIcon className="h-5 w-5" />
                        <span>Recommended Courses</span>
                      </div>
                      <div className="space-y-3">
                        {phase.courses.map((course, cIdx) => (
                          <div key={cIdx} className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300">
                                {course.provider}
                              </span>
                              <span className="text-[10px] text-gray-400">{course.duration}</span>
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                              {course.title}
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {course.skillsCovered.map(s => (
                                <span key={s} className="text-[9px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-gray-500">
                                  #{s}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Practical Projects */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                        <BriefcaseIcon className="h-5 w-5" />
                        <span>Hands-on Project Ideas</span>
                      </div>
                      <div className="space-y-3">
                        {phase.projects.map((proj, pIdx) => (
                          <div key={pIdx} className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">{proj.title}</h4>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{proj.description}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {proj.techStack.map(t => (
                                <span key={t} className="text-[9px] bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-medium px-1.5 py-0.5 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                              ⭐ {proj.portfolioValue}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        <CheckBadgeIcon className="h-5 w-5" />
                        <span>Target Certifications</span>
                      </div>
                      <div className="space-y-3">
                        {phase.certifications.map((cert, certIdx) => (
                          <div key={certIdx} className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 space-y-2">
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              {cert.issuingOrg}
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">{cert.name}</h4>
                            <span className="inline-block text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                              🎖️ {cert.recognition}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default Upskilling;
