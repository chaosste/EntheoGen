/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  ArrowDown, 
  ArrowUp, 
  Circle, 
  Heart, 
  XCircle, 
  Info, 
  RefreshCw, 
  ExternalLink,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  Search,
  Star,
  Trash2,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { DRUGS, LEGEND, getInteractionEvidence } from './data/drugData';
import { getInteractionExplanation, getDrugSummary } from './services/geminiService';

// --- Components ---

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function SearchableSelect({ label, value, onChange, disabled, placeholder }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredDrugs = useMemo(() => {
    return DRUGS.filter(drug => 
      drug.name.toLowerCase().includes(search.toLowerCase()) ||
      drug.class.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const selectedDrug = useMemo(() => DRUGS.find(d => d.id === value), [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-xs font-semibold uppercase tracking-wider text-black/50 ml-1">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full bg-white border border-black/10 rounded-2xl px-4 py-4 text-left flex justify-between items-center focus:ring-2 focus:ring-[#1C8AD1] transition-all disabled:opacity-50"
      >
        <span className={selectedDrug ? 'text-[#1a1a1a]' : 'text-black/30'}>
          {selectedDrug ? selectedDrug.name : placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-40 top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-black/5 flex items-center gap-2 bg-black/[0.02]">
              <Search className="w-4 h-4 text-black/30" />
              <input
                autoFocus
                type="text"
                placeholder="Search drugs or classes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm py-1"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredDrugs.length > 0 ? (
                filteredDrugs.map((drug) => (
                  <button
                    key={drug.id}
                    onClick={() => {
                      onChange(drug.id);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-black/[0.03] transition-colors flex flex-col ${value === drug.id ? 'bg-indigo-50' : ''}`}
                  >
                    <span className="font-semibold text-sm">{drug.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-black/40">{drug.class}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-black/40 text-sm italic">
                  No drugs found matching "{search}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [drug1, setDrug1] = useState<string>('');
  const [drug2, setDrug2] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [explanation, setExplanation] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<{id: string, d1: string, d2: string, code: string}[]>([]);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem('seshguard_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites");
      }
    }
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('seshguard_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const interactionEvidence = useMemo(() => {
    if (!drug1 || !drug2) return null;
    return getInteractionEvidence(drug1, drug2);
  }, [drug1, drug2]);

  const interactionCode = interactionEvidence?.code || null;

  const interaction = useMemo(() => {
    if (!interactionCode) return null;
    return LEGEND[interactionCode];
  }, [interactionCode]);

  const isFavorited = useMemo(() => {
    if (!drug1 || !drug2) return false;
    const id = [drug1, drug2].sort().join('-');
    return favorites.some(f => f.id === id);
  }, [drug1, drug2, favorites]);

  const toggleFavorite = () => {
    if (!drug1 || !drug2 || !interactionCode || interactionCode === 'SELF') return;
    const id = [drug1, drug2].sort().join('-');
    
    if (isFavorited) {
      setFavorites(favorites.filter(f => f.id !== id));
    } else {
      setFavorites([...favorites, { 
        id, 
        d1: drug1, 
        d2: drug2, 
        code: interactionCode 
      }]);
    }
  };

  const handleFindOut = async () => {
    if (!drug1 && !drug2) return;
    setShowResult(true);
    setIsLoadingExplanation(true);
    setIsLoadingSummary(true);
    setError(null);
    setExplanation('');
    setSummary('');
    
    const d1Obj = DRUGS.find(d => d.id === drug1);
    const d2Obj = DRUGS.find(d => d.id === drug2);
    const d1Name = d1Obj?.name || drug1;
    const d2Name = d2Obj?.name || drug2;
    
    try {
      // Evidence-grounded interaction explanation for paired selections.
      if (drug1 && drug2 && interaction && interactionEvidence) {
        const interactionReadout = await getInteractionExplanation(
          d1Name,
          d2Name,
          interaction.label,
          interactionEvidence.summary,
          {
            confidence: interactionEvidence.confidence,
            sources: interactionEvidence.sources,
            riskScale: interaction.riskScale
          }
        );
        setExplanation(interactionReadout);
      }
      setIsLoadingExplanation(false);

      // Rule-based summary (single or combined).
      const targetDrug1 = drug1 ? d1Name : d2Name;
      const targetDrug2 = (drug1 && drug2) ? d2Name : undefined;
      const profile = await getDrugSummary(targetDrug1, targetDrug2, {
        confidence: interactionEvidence?.confidence,
        sources: interactionEvidence?.sources,
        riskScale: interaction?.riskScale
      });
      setSummary(profile);
    } catch (err) {
      console.error("Readout error:", err);
      setError("We couldn't render the interaction readout. Please retry.");
    }
    setIsLoadingSummary(false);
  };

  const handleReset = () => {
    setDrug1('');
    setDrug2('');
    setShowResult(false);
    setExplanation('');
    setSummary('');
    setError(null);
  };

  const getIcon = (symbol: string) => {
    switch (symbol) {
      case 'UP': return <ArrowUp className="w-8 h-8" />;
      case 'CIRCLE': return <Circle className="w-8 h-8" />;
      case 'DOWN': return <ArrowDown className="w-8 h-8" />;
      case 'WARN': return <AlertTriangle className="w-8 h-8" />;
      case 'HEART': return <Heart className="w-8 h-8" />;
      case 'X': return <XCircle className="w-8 h-8" />;
      case 'INFO': return <Info className="w-8 h-8" />;
      default: return <Sparkles className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#274F13] rounded-lg flex items-center justify-center text-white font-bold">N</div>
          <span className="text-xl font-bold tracking-tight">NTT</span>
        </div>
        <div className="flex items-center gap-2">
          {favorites.length > 0 && (
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="relative p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {favorites.length}
              </span>
            </button>
          )}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 hover:bg-black/5 rounded-full transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        <header className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            NTT: eNtheogenic Trepidation Tutor
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground italic text-lg"
          >
            Local browser storage is used for favorites only. Third-party hosting/providers may still process network logs.
          </motion.p>
        </header>

        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <SearchableSelect 
              label="Choose first substance/class"
              value={drug1}
              onChange={setDrug1}
              disabled={showResult}
              placeholder="Select ceremonial substance or medication class..."
            />
            <SearchableSelect 
              label="Choose second substance/class"
              value={drug2}
              onChange={setDrug2}
              disabled={showResult}
              placeholder="Select ceremonial substance or medication class..."
            />
          </div>

          <div className="flex flex-col gap-4">
            {!showResult ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFindOut}
                disabled={!drug1 && !drug2}
                className="w-full bg-[#1a1a1a] text-white rounded-2xl py-5 text-xl font-bold shadow-xl shadow-black/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                FIND OUT
              </motion.button>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="w-full border-2 border-[#1a1a1a] text-[#1a1a1a] rounded-2xl py-5 text-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RefreshCw className="w-6 h-6" />
                CHOOSE ANOTHER
              </motion.button>
            )}
          </div>
        </section>

        {/* Results Area */}
        <AnimatePresence>
          {showResult && (drug1 || drug2) && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 space-y-8"
            >
              {interaction && (
                <div 
                  className="rounded-[32px] p-8 md:p-12 text-white shadow-2xl overflow-hidden relative"
                  style={{ backgroundColor: interaction.color }}
                >
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    {getIcon(interaction.symbol)}
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mb-6 p-4 bg-white/20 rounded-full backdrop-blur-sm">
                      {getIcon(interaction.symbol)}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
                      {interaction.label}
                    </h2>
                    <p className="text-lg md:text-xl opacity-90 max-w-md leading-relaxed mb-8">
                      {interaction.description}
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleFavorite}
                      className={`flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-md transition-all ${isFavorited ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                      <Star className={`w-5 h-5 ${isFavorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      <span className="text-sm font-bold uppercase tracking-wider">
                        {isFavorited ? 'Saved to Favorites' : 'Add to Favorites'}
                      </span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* AI Interaction Insight (Only if 2 drugs) */}
              {drug1 && drug2 && interaction && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-[32px] p-8 md:p-10 border border-black/5 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Sparkles className={`w-5 h-5 ${isLoadingExplanation ? 'animate-pulse' : ''}`} />
                      <span className="text-sm font-bold uppercase tracking-widest">Evidence Snapshot</span>
                    </div>
                    {isLoadingExplanation && (
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  {isLoadingExplanation ? (
                    <div className="space-y-4">
                      <div className="h-4 bg-black/5 rounded w-3/4"></div>
                      <div className="h-4 bg-black/5 rounded w-full"></div>
                    </div>
                  ) : (
                    <div className="markdown-body">
                      <Markdown>{explanation}</Markdown>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Detailed Summary */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[32px] p-8 md:p-10 border border-black/5 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Info className={`w-5 h-5 ${isLoadingSummary ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-bold uppercase tracking-widest">Rule-Based Context</span>
                  </div>
                  {isLoadingSummary && (
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                    </div>
                  )}
                </div>
                
                {isLoadingSummary ? (
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="absolute top-0 left-0 h-1 bg-emerald-600/20 w-full"
                    />
                    <div className="h-4 bg-black/5 rounded w-3/4"></div>
                    <div className="h-4 bg-black/5 rounded w-full"></div>
                    <div className="h-4 bg-black/5 rounded w-5/6"></div>
                    <div className="h-4 bg-black/5 rounded w-2/3"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-start gap-4 p-6 bg-red-50 rounded-2xl border border-red-100">
                    <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-800 font-medium leading-relaxed">
                      {error}
                    </p>
                  </div>
                ) : (
                  <div className="markdown-body">
                    <Markdown>{summary}</Markdown>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-20 pt-12 border-t border-black/5 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <a 
              href="https://www.newpsychonaut.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
            >
              NewPsychonaut (NeuroPhenom + research projects)
              <ExternalLink className="w-4 h-4" />
            </a>
            <a 
              href="https://www.newpsychonaut.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
            >
              Citizen science pathway (self-report + future wearable data)
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </footer>
      </main>

      {/* Sidebar/Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-12">
                {/* Favorites Section */}
                {favorites.length > 0 && (
                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <h3 className="text-sm font-bold uppercase tracking-widest">Favorite Interactions</h3>
                    </div>
                    <div className="grid gap-3">
                      {favorites.map(fav => {
                        const d1Name = DRUGS.find(d => d.id === fav.d1)?.name || fav.d1;
                        const d2Name = DRUGS.find(d => d.id === fav.d2)?.name || fav.d2;
                        const inter = LEGEND[fav.code];
                        return (
                          <div 
                            key={fav.id}
                            className="group flex items-center justify-between p-4 rounded-2xl bg-black/[0.03] border border-black/5 hover:border-black/10 transition-all"
                          >
                            <button 
                              onClick={() => {
                                setDrug1(fav.d1);
                                setDrug2(fav.d2);
                                setShowResult(true);
                                setIsMenuOpen(false);
                                handleFindOut(); // Trigger AI insight for the favorite
                              }}
                              className="flex-1 text-left"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-sm">{d1Name} + {d2Name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: inter?.color }} />
                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-40">{inter?.label}</span>
                              </div>
                            </button>
                            <button 
                              onClick={() => setFavorites(favorites.filter(f => f.id !== fav.id))}
                              className="p-2 text-black/20 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <ShieldAlert className="w-6 h-6" />
                    <h3 className="text-xl font-bold uppercase tracking-tight">Important!</h3>
                  </div>
                  <div className="space-y-4 text-black/70 leading-relaxed">
                    <p className="font-bold text-black">This app is educational harm-reduction guidance, not medical advice.</p>
                    <p>Interaction ratings are sourced from the curated ceremonial dataset and can include unknown gaps.</p>
                    <p>Favorites are saved in your browser. Hosting, CDN, and AI providers may process technical metadata and logs.</p>
                    <p>If you suspect toxicity, serotonin syndrome, or hypertensive crisis, seek urgent medical help.</p>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">Useful Links</h3>
                  <div className="grid gap-4">
                    {[
                      { name: 'Crisis Help UK', url: 'https://thatsmental.co.uk/crisis' },
                      { name: 'Drug Science', url: 'https://www.drugscience.org.uk/' },
                      { name: 'PsyCare', url: 'https://www.psycareuk.org/psychedelic-support' },
                      { name: 'Zendo Project', url: 'https://zendoproject.org/' }
                    ].map(link => (
                      <a 
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-between items-center p-4 rounded-2xl bg-black/5 hover:bg-black/10 transition-colors group"
                      >
                        <span className="font-semibold">{link.name}</span>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </section>

                <section className="pt-8 border-t border-black/5">
                  <p className="text-xs text-black/40 text-center">
                    NTT v0.1 • Ceremonial Interaction Guidance
                  </p>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
