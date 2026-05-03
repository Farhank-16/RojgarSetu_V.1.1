import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, X, Check } from 'lucide-react';
import { skillService } from '../../services/skillService';
import toast from 'react-hot-toast';

// Category emoji map
const CAT_ICONS = {
  'Technology':           '',
  'Management':           '',
  'Sales & Marketing':    '',
  'Trades & Labour':      '',
  'Hospitality & Food':   '',
  'Health & Care':        '',
  'Education':            '',
  'Transport & Logistics':'',
  'Security & Facility':  '',
  'Beauty & Fashion':     '',
  'Other':                '',
};

const SkillPicker = ({ selectedIds = [], selectedCustom = [], onChange, onCustomChange }) => {
  const [grouped, setGrouped]       = useState({});
  const [openCats, setOpenCats]     = useState({});
  const [customInput, setCustomInput] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    skillService.getSkills()
      .then(({ grouped }) => setGrouped(grouped))
      .catch(console.error);
  }, []);

  const toggleCat = (cat) => setOpenCats(p => ({ ...p, [cat]: !p[cat] }));

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

    // Check duplicate
    if (selectedCustom.map(s => s.toLowerCase()).includes(name.toLowerCase())) {
      toast.error('Already added');
      return;
    }

    setLoading(true);
    try {
      const { skill, isNew } = await skillService.addCustomSkill(name);
      // If skill exists in DB — toggle it as regular skill
      if (!isNew && skill?.id) {
        if (!selectedIds.includes(skill.id)) {
          onChange([...selectedIds, skill.id]);
        }
        toast.success(`"${name}" found in skills list!`);
      } else {
        // Brand new — add to custom list
        onCustomChange([...selectedCustom, skill.name]);
        toast.success(`"${skill.name}" added!`);
      }
      setCustomInput('');
      setAddingCustom(false);
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    } finally {
      setLoading(false);
    }
  };

  const totalSelected = selectedIds.length + selectedCustom.length;

  return (
    <div className="space-y-2">

      {/* Selected count */}
      {totalSelected > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-blue-50">
          {/* Regular skills */}
          {Object.values(grouped).flat().filter(s => selectedIds.includes(s.id)).map(s => (
            <span key={s.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: '#2563eb', color: 'white' }}>
              {s.name}
              <button onClick={() => toggleSkill(s)}><X className="w-3 h-3" /></button>
            </span>
          ))}
          {/* Custom skills */}
          {selectedCustom.map(name => (
            <span key={name}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: '#7c3aed', color: 'white' }}>
              ⭐ {name}
              <button onClick={() => removeCustom(name)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Categories */}
      {Object.entries(grouped).map(([cat, skills]) => {
        const isOpen       = openCats[cat];
        const selectedInCat = skills.filter(s => selectedIds.includes(s.id)).length;
        const icon         = CAT_ICONS[cat] || '';

        return (
          <div key={cat} className="rounded-xl border border-slate-200 overflow-hidden">
            {/* Category header */}
            <button type="button"
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-base">{icon}</span>
                <span className="font-display font-bold text-slate-800 text-sm">{cat}</span>
                {selectedInCat > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: '#2563eb', color: 'white' }}>
                    {selectedInCat}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">{skills.length} skills</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {/* Skills grid */}
            {isOpen && (
              <div className="px-3 pb-3 pt-1 bg-slate-50 flex flex-wrap gap-2">
                {skills.map(skill => {
                  const selected = selectedIds.includes(skill.id);
                  return (
                    <button key={skill.id} type="button"
                      onClick={() => toggleSkill(skill)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                      style={{
                        background: selected ? '#2563eb' : 'white',
                        color:      selected ? 'white'   : '#475569',
                        border:     `1.5px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                        boxShadow:  selected ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                      }}>
                      {selected && <Check className="w-3 h-3" />}
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Custom skill — Others */}
      <div className="rounded-xl border border-dashed border-purple-200 overflow-hidden">
        <button type="button"
          onClick={() => setAddingCustom(p => !p)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white active:bg-purple-50 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-base">⭐</span>
            <span className="font-display font-bold text-slate-800 text-sm">Other / Custom Skill</span>
            {selectedCustom.length > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: '#7c3aed', color: 'white' }}>
                {selectedCustom.length}
              </span>
            )}
          </div>
          <span className="text-xs text-purple-500 font-semibold">+ Add your skill</span>
        </button>

        {addingCustom && (
          <div className="px-3 pb-3 pt-1 bg-purple-50 space-y-2">
            <p className="text-xs text-slate-500">
              Can't find your skill above? Add it here.
            </p>
            <div className="flex gap-2">
              <input
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCustom()}
                placeholder="e.g. Mehndi, Fish Farming, Pottery..."
                className="input flex-1 py-2.5 text-sm"
                style={{ borderRadius: '10px' }}
                autoFocus
              />
              <button type="button"
                onClick={handleAddCustom}
                disabled={!customInput.trim() || loading}
                className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50"
                style={{ borderRadius: '10px' }}>
                {loading
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Plus className="w-4 h-4" />
                }
              </button>
            </div>
            {/* Existing custom skills */}
            {selectedCustom.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedCustom.map(name => (
                  <span key={name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: '#7c3aed', color: 'white' }}>
                    {name}
                    <button type="button" onClick={() => removeCustom(name)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {totalSelected > 0 && (
        <p className="text-xs text-blue-600 font-semibold text-center">
          {totalSelected} skill{totalSelected > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
};

export default SkillPicker;