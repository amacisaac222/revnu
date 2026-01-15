'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, ListTodo, Sparkles, Edit2, ChevronDown, ChevronRight } from 'lucide-react';
import SequencePreviewCard from './sequence-preview-card';
import VisualSequenceBuilder from '../sequence-builder/visual-sequence-builder';
import AIGenerator from '../sequence-builder/ai-generator';

interface SequenceTemplate {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isDefault: boolean;
  triggerDaysPastDue: number;
  steps: any[];
  _count?: {
    invoices: number;
  };
}

interface WizardStep2Props {
  sequences: SequenceTemplate[];
  organizationName: string;
  organizationId: string;
  selectedSequence: SequenceTemplate | null;
  onSequenceSelect: (sequence: SequenceTemplate | null) => void;
  onContinue: () => void;
  onBack: () => void;
  onRefresh: () => void;
}

type OptionType = 'select' | 'create' | 'edit';

export default function WizardStep2ChooseSequence({
  sequences,
  organizationName,
  organizationId,
  selectedSequence,
  onSequenceSelect,
  onContinue,
  onBack,
  onRefresh,
}: WizardStep2Props) {
  const [selectedOption, setSelectedOption] = useState<OptionType>('select');
  const [sequenceToEdit, setSequenceToEdit] = useState<SequenceTemplate | null>(null);
  const [aiGeneratedSteps, setAiGeneratedSteps] = useState<any[] | null>(null);
  const [newSequenceData, setNewSequenceData] = useState({
    name: '',
    description: '',
    triggerDaysPastDue: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSelectExisting = (sequence: SequenceTemplate) => {
    onSequenceSelect(sequence);
    setSelectedOption('select');
  };

  const handleCreateNew = async (steps: any[]) => {
    if (!newSequenceData.name.trim()) {
      alert('Please enter a sequence name');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSequenceData,
          organizationId,
          steps: steps.map(({ id, ...step }) => step),
        }),
      });

      if (!response.ok) throw new Error('Failed to save sequence');

      const created = await response.json();
      onSequenceSelect(created);
      onRefresh();
    } catch (error) {
      alert('Failed to save sequence. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSequence = async (steps: any[]) => {
    if (!sequenceToEdit) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sequences/${sequenceToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: steps.map(({ id, ...step }) => step),
        }),
      });

      if (!response.ok) throw new Error('Failed to update sequence');

      const updated = await response.json();
      onSequenceSelect(updated);
      onRefresh();
    } catch (error) {
      alert('Failed to update sequence. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-revnu-slate/40 border-2 border-revnu-green/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Message Sequence</h2>
        <p className="text-revnu-gray">Select an existing sequence, create a new one, or edit an existing one</p>
      </div>

      {/* Options */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Option 1: Select Existing */}
        <button
          onClick={() => setSelectedOption('select')}
          className={`p-6 rounded-xl border-2 transition text-left ${
            selectedOption === 'select'
              ? 'bg-revnu-green/10 border-revnu-green'
              : 'bg-revnu-slate/40 border-revnu-green/20 hover:border-revnu-green/40'
          }`}
        >
          <ListTodo
            className={`w-8 h-8 mb-3 ${selectedOption === 'select' ? 'text-revnu-green' : 'text-revnu-gray'}`}
          />
          <h3 className={`text-lg font-bold mb-1 ${selectedOption === 'select' ? 'text-white' : 'text-revnu-gray'}`}>
            Use Existing
          </h3>
          <p className="text-sm text-revnu-gray">Choose from your saved sequences</p>
        </button>

        {/* Option 2: Create New */}
        <button
          onClick={() => setSelectedOption('create')}
          className={`p-6 rounded-xl border-2 transition text-left ${
            selectedOption === 'create'
              ? 'bg-revnu-green/10 border-revnu-green'
              : 'bg-revnu-slate/40 border-revnu-green/20 hover:border-revnu-green/40'
          }`}
        >
          <Sparkles
            className={`w-8 h-8 mb-3 ${selectedOption === 'create' ? 'text-revnu-green' : 'text-revnu-gray'}`}
          />
          <h3 className={`text-lg font-bold mb-1 ${selectedOption === 'create' ? 'text-white' : 'text-revnu-gray'}`}>
            Build New
          </h3>
          <p className="text-sm text-revnu-gray">Create with AI or manually</p>
        </button>

        {/* Option 3: Edit Existing */}
        <button
          onClick={() => setSelectedOption('edit')}
          className={`p-6 rounded-xl border-2 transition text-left ${
            selectedOption === 'edit'
              ? 'bg-revnu-green/10 border-revnu-green'
              : 'bg-revnu-slate/40 border-revnu-green/20 hover:border-revnu-green/40'
          }`}
        >
          <Edit2
            className={`w-8 h-8 mb-3 ${selectedOption === 'edit' ? 'text-revnu-green' : 'text-revnu-gray'}`}
          />
          <h3 className={`text-lg font-bold mb-1 ${selectedOption === 'edit' ? 'text-white' : 'text-revnu-gray'}`}>
            Edit Existing
          </h3>
          <p className="text-sm text-revnu-gray">Modify a saved sequence</p>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-revnu-slate/40 border border-revnu-green/20 rounded-xl p-6">
        {/* OPTION 1: SELECT EXISTING */}
        {selectedOption === 'select' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Available Sequences</h3>
            {sequences.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-revnu-gray">No sequences available. Create one first!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sequences.map((seq) => (
                  <div key={seq.id} className="relative">
                    <SequencePreviewCard
                      sequence={seq}
                      organizationName={organizationName}
                      onAssign={() => handleSelectExisting(seq)}
                    />
                    {selectedSequence?.id === seq.id && (
                      <div className="absolute top-4 right-4 bg-revnu-green text-revnu-dark px-3 py-1 rounded-full font-bold text-sm">
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OPTION 2: CREATE NEW */}
        {selectedOption === 'create' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Build New Sequence</h3>

              {/* AI Generator */}
              <AIGenerator onGenerate={(steps) => setAiGeneratedSteps(steps)} />
            </div>

            {/* Sequence Settings */}
            <div className="bg-revnu-dark/50 border border-revnu-green/20 rounded-xl p-6 space-y-4">
              <h4 className="font-bold text-white">Sequence Details</h4>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Sequence Name *</label>
                <input
                  type="text"
                  value={newSequenceData.name}
                  onChange={(e) => setNewSequenceData({ ...newSequenceData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                  placeholder="e.g., Standard 30-Day Reminder"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <input
                  type="text"
                  value={newSequenceData.description}
                  onChange={(e) => setNewSequenceData({ ...newSequenceData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Start Reminders When</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-revnu-gray">Invoice is</span>
                  <input
                    type="number"
                    min="0"
                    value={newSequenceData.triggerDaysPastDue}
                    onChange={(e) =>
                      setNewSequenceData({ ...newSequenceData, triggerDaysPastDue: parseInt(e.target.value) || 0 })
                    }
                    className="w-20 px-3 py-2 bg-revnu-dark border border-revnu-green/30 rounded-lg text-white focus:border-revnu-green focus:outline-none"
                  />
                  <span className="text-sm text-revnu-gray">days past due</span>
                </div>
              </div>
            </div>

            {/* Visual Builder */}
            <VisualSequenceBuilder
              businessName={organizationName}
              onSave={handleCreateNew}
              initialSteps={aiGeneratedSteps}
              loading={saving}
            />
          </div>
        )}

        {/* OPTION 3: EDIT EXISTING */}
        {selectedOption === 'edit' && (
          <div className="space-y-4">
            {!sequenceToEdit ? (
              <>
                <h3 className="text-lg font-bold text-white">Select Sequence to Edit</h3>
                <div className="space-y-3">
                  {sequences.map((seq) => (
                    <button
                      key={seq.id}
                      onClick={() => setSequenceToEdit(seq)}
                      className="w-full p-4 bg-revnu-dark border border-revnu-green/20 rounded-lg hover:border-revnu-green/40 transition text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{seq.name}</p>
                          <p className="text-sm text-revnu-gray">{seq.steps.length} steps</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-revnu-gray" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Editing: {sequenceToEdit.name}</h3>
                  <button
                    onClick={() => setSequenceToEdit(null)}
                    className="text-sm text-revnu-green hover:text-white"
                  >
                    Choose Different
                  </button>
                </div>
                <VisualSequenceBuilder
                  businessName={organizationName}
                  onSave={handleEditSequence}
                  initialSteps={sequenceToEdit.steps}
                  loading={saving}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-revnu-dark border border-revnu-green/30 text-white font-bold rounded-lg hover:bg-revnu-dark/50 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={onContinue}
          disabled={!selectedSequence}
          className="px-8 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg text-lg hover:bg-revnu-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          Continue to Preview
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
