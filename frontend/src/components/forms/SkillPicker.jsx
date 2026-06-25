import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, X, Check, Search, Tag } from 'lucide-react';
import { skillService } from '../../services/skillService';
import toast from 'react-hot-toast';

const CAT_ICONS = {
  'Technology':           '💻',
  'Management':           '📊',
  'Sales & Marketing':    '📢',
  'Trades & Labour':      '🛠️',
  'Hospitality & Food':   '🍳',
  'Health & Care':        '🩺',
  'Education':            '🎓',
  'Transport & Logistics':'🚚',
  'Security & Facility':  '🛡️',
  'Beauty & Fashion':     '💅',
  'Other':                '✨',
};

const SkillPicker = ({ selectedIds = [], selectedCustom = [], onChange, onCustomChange }) => {
  const [grouped, setGrouped] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    skillService.getSkills()
      .then(({ grouped: data }) => {
        setGrouped(data);
        // Default to first category if available
        const categories = Object.keys(data);
        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
      })
      .catch(console.error);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSkill = (skill) => {
    const isSelected = selectedIds.includes(skill.id);
    onChange(
      isSelected
        ? selectedIds.filter(id => id !== skill.id)
        : [...selectedIds, skill.id]
    );
  };

  const removeCustom = (name) => {
    onCustomChange(selectedCustom.filter(s => s !== name));
  };

  const handleAddCustom = async () => {
    const name = customInput.trim();
    if (!name) return;

    if (selectedCustom.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
      toast.error('Already added');
      return;
    }

    setLoading(true);
    try {
      const { skill, isNew } = await skillService.addCustomSkill(name);
      if (!isNew && skill?.id) {
        if (!selectedIds.includes(skill.id)) {
          onChange([...selectedIds, skill.id]);
        }
        toast.success(`"${name}" found in skills list!`);
      } else {
        onCustomChange([...selectedCustom, skill.name]);
        toast.success(`"${skill.name}" added!`);
      }
      setCustomInput('');
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const categories = Object.keys(grouped);
  const activeSkills = grouped[selectedCategory] || [];
  const filteredSkills = activeSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSelectedCountInCat = (cat) => {
    return (grouped[cat] || []).filter(s => selectedIds.includes(s.id)).length;
  };

  const totalSelected = selectedIds.length + selectedCustom.length;

  return (
    <div className="space-y-4">
      
      {/* 1. SELECTED SKILLS CONTAINER */}
      {totalSelected > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Selected Skills ({totalSelected})
            </span>
            <button 
              type="button" 
              onClick={() => { onChange([]); onCustomChange([]); }} 
              className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 max-h-[120px] overflow-y-auto">
            {/* Regular DB Skills */}
            {Object.values(grouped).flat().filter(s => selectedIds.includes(s.id)).map(s => (
              <span 
                key={s.id} 
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm shadow-blue-500/10"
              >
                {s.name}
                <button 
                  type="button" 
                  onClick={() => toggleSkill(s)} 
                  className="hover:bg-blue-700/50 p-0.5 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {/* Custom Skills */}
            {selectedCustom.map(name => (
              <span 
                key={name} 
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-semibold bg-purple-600 text-white shadow-sm shadow-purple-500/10"
              >
                ⭐ {name}
                <button 
                  type="button" 
                  onClick={() => removeCustom(name)} 
                  className="hover:bg-purple-700/50 p-0.5 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. CATEGORY & SEARCH CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Category Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Skill Category
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-left text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <span className="flex items-center gap-2 truncate">
              <span>{CAT_ICONS[selectedCategory] || '✨'}</span>
              <span className="truncate">{selectedCategory || 'Select Category'}</span>
              {getSelectedCountInCat(selectedCategory) > 0 && (
                <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  {getSelectedCountInCat(selectedCategory)}
                </span>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Dropdown Items */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[220px] overflow-y-auto py-1">
              {categories.map(cat => {
                const isSelected = cat === selectedCategory;
                const count = getSelectedCountInCat(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setDropdownOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 text-blue-700 font-bold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span>{CAT_ICONS[cat] || '✨'}</span>
                      <span className="truncate">{cat}</span>
                    </span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Search */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Search Skills
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to filter category skills..."
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

      </div>

      {/* 3. SKILLS GRID (Scrollable Category Panel) */}
      <div className="space-y-1.5">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Select from {selectedCategory} ({filteredSkills.length} available)
        </span>
        <div className="border border-slate-200/80 rounded-xl bg-slate-50/20 p-3 max-h-[160px] overflow-y-auto">
          {filteredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map(skill => {
                const selected = selectedIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 duration-150 ${
                      selected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {skill.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Tag className="w-6 h-6 text-slate-300 mb-1" />
              <p className="text-[11px] text-slate-400 font-semibold">No matching skills found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. COMPACT CUSTOM SKILL BLOCK */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustom())}
            placeholder="Add custom skill if not found..."
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!customInput.trim() || loading}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SkillPicker;