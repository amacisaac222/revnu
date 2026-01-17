"use client";

import { useState } from "react";
import { Shield, Calendar, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { calculateLienDeadlines, getStateInfo } from "@/lib/lien-deadlines";
import Link from "next/link";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export default function PublicLienCalculator() {
  const [state, setState] = useState("");
  const [firstWorkDate, setFirstWorkDate] = useState("");
  const [lastWorkDate, setLastWorkDate] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    if (state && lastWorkDate) {
      setShowResults(true);
    }
  };

  const deadlines = state && lastWorkDate
    ? calculateLienDeadlines(
        state,
        firstWorkDate ? new Date(firstWorkDate) : null,
        new Date(lastWorkDate)
      )
    : null;

  const stateInfo = state ? getStateInfo(state) : null;

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Input Form */}
        <div className="bg-revnu-slate/60 backdrop-blur-lg border border-revnu-green/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-revnu-green rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-revnu-dark" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Calculate Deadlines</h3>
              <p className="text-sm text-revnu-gray">Enter your project details</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* State Selector */}
            <div>
              <label htmlFor="state" className="block text-sm font-bold text-white mb-2">
                State <span className="text-revnu-green">*</span>
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setShowResults(false);
                }}
                className="w-full px-4 py-3 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white focus:outline-none focus:border-revnu-green transition"
              >
                <option value="">Select a state...</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* First Work Date */}
            <div>
              <label htmlFor="firstWorkDate" className="block text-sm font-bold text-white mb-2">
                First Work Date
                <span className="text-revnu-gray font-normal ml-2">(Optional)</span>
              </label>
              <input
                id="firstWorkDate"
                type="date"
                value={firstWorkDate}
                onChange={(e) => {
                  setFirstWorkDate(e.target.value);
                  setShowResults(false);
                }}
                className="w-full px-4 py-3 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white focus:outline-none focus:border-revnu-green transition"
              />
              <p className="text-xs text-revnu-gray mt-1">
                For preliminary notice deadline
              </p>
            </div>

            {/* Last Work Date */}
            <div>
              <label htmlFor="lastWorkDate" className="block text-sm font-bold text-white mb-2">
                Work Completion Date <span className="text-revnu-green">*</span>
              </label>
              <input
                id="lastWorkDate"
                type="date"
                value={lastWorkDate}
                onChange={(e) => {
                  setLastWorkDate(e.target.value);
                  setShowResults(false);
                }}
                className="w-full px-4 py-3 bg-revnu-dark border border-revnu-grayLight/20 rounded-lg text-white focus:outline-none focus:border-revnu-green transition"
              />
              <p className="text-xs text-revnu-gray mt-1">
                When work was substantially completed
              </p>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              disabled={!state || !lastWorkDate}
              className="w-full px-6 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-revnu-green/20"
            >
              Calculate Deadlines
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="bg-revnu-slate/60 backdrop-blur-lg border border-revnu-green/20 rounded-2xl p-8">
          {!showResults ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <Calendar className="w-16 h-16 text-revnu-gray mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Your Deadlines Will Appear Here
              </h3>
              <p className="text-revnu-gray">
                Select your state and work completion date to calculate lien deadlines
              </p>
            </div>
          ) : deadlines ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {US_STATES.find((s) => s.code === state)?.name} Deadlines
                </h3>
                <p className="text-sm text-revnu-gray">
                  Calculated based on completion: {formatDate(new Date(lastWorkDate))}
                </p>
              </div>

              <div className="space-y-4">
                {/* Preliminary Notice */}
                {deadlines.preliminaryNoticeRequired && deadlines.preliminaryNoticeDeadline && (
                  <div className="bg-revnu-dark/60 border border-revnu-grayLight/10 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white mb-1">
                          Preliminary Notice Deadline
                        </div>
                        <div className="text-lg font-black text-blue-400">
                          {formatDate(deadlines.preliminaryNoticeDeadline)}
                        </div>
                        <div className="text-xs text-revnu-gray mt-1">
                          Must be sent within {deadlines.preliminaryNoticeDays} days of first work
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!deadlines.preliminaryNoticeRequired && (
                  <div className="bg-revnu-dark/60 border border-revnu-grayLight/10 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-revnu-green mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm font-bold text-white mb-1">
                          Preliminary Notice
                        </div>
                        <div className="text-sm text-revnu-gray">
                          Not required in {US_STATES.find((s) => s.code === state)?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lien Filing Deadline */}
                <div
                  className={`border rounded-lg p-4 ${
                    deadlines.warningLevel === "red"
                      ? "bg-red-500/10 border-red-500/30"
                      : deadlines.warningLevel === "yellow"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-revnu-green/10 border-revnu-green/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {deadlines.warningLevel === "red" ? (
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    ) : deadlines.warningLevel === "yellow" ? (
                      <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-revnu-green mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white mb-1">
                        Lien Filing Deadline
                      </div>
                      <div
                        className={`text-2xl font-black mb-2 ${
                          deadlines.warningLevel === "red"
                            ? "text-red-400"
                            : deadlines.warningLevel === "yellow"
                            ? "text-yellow-400"
                            : "text-revnu-green"
                        }`}
                      >
                        {deadlines.lienFilingDeadline
                          ? formatDate(deadlines.lienFilingDeadline)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-white font-semibold mb-2">
                        {deadlines.daysUntilFilingDeadline < 0
                          ? "⚠️ DEADLINE PASSED"
                          : deadlines.daysUntilFilingDeadline === 0
                          ? "🚨 DUE TODAY"
                          : `${deadlines.daysUntilFilingDeadline} days remaining`}
                      </div>
                      <div className="text-xs text-revnu-gray">
                        Must be filed within {deadlines.lienFilingDays} days of work completion
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enforcement Deadline */}
                <div className="bg-revnu-dark/60 border border-revnu-grayLight/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white mb-1">
                        Enforcement Deadline
                      </div>
                      <div className="text-lg font-black text-purple-400">
                        {deadlines.enforcementDeadline
                          ? formatDate(deadlines.enforcementDeadline)
                          : "N/A"}
                      </div>
                      <div className="text-xs text-revnu-gray mt-1">
                        {deadlines.enforcementDays} days after filing to enforce lien
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* State-Specific Notes */}
              {stateInfo?.notes && (
                <div className="bg-revnu-green/10 border border-revnu-green/30 rounded-lg p-4">
                  <div className="text-xs font-bold text-revnu-green uppercase tracking-wide mb-2">
                    {US_STATES.find((s) => s.code === state)?.name} Requirements
                  </div>
                  <div className="text-sm text-white">{stateInfo.notes}</div>
                </div>
              )}

              {/* CTA */}
              <Link
                href="/sign-up"
                className="block w-full px-6 py-4 bg-revnu-green text-revnu-dark font-bold rounded-lg hover:bg-revnu-greenLight transition-all text-center hover:shadow-lg hover:shadow-revnu-green/20"
              >
                Track Deadlines Automatically with REVNU
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 bg-revnu-dark/40 border border-revnu-grayLight/10 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-revnu-gray">
            <strong className="text-white">Legal Disclaimer:</strong> This calculator provides
            general guidance based on typical state requirements. Mechanics lien laws are complex
            and vary by project type, relationship to property owner, and local jurisdiction.
            Deadlines may differ for public vs private projects, subcontractors vs general
            contractors, and other factors. Always consult a local construction attorney for
            specific legal advice before taking action.
          </div>
        </div>
      </div>
    </div>
  );
}
