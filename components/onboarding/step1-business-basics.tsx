// Step 1: Business Basics Component
// To use: Import this and replace the Step 1 section in onboarding-wizard.tsx

import { US_STATES } from "./state-dropdown";

interface Step1Props {
  formData: {
    businessName: string;
    industry: string;
    phone: string;
    timezone: string;
    primaryState: string;
  };
  setFormData: (data: any) => void;
}

export default function Step1BusinessBasics({ formData, setFormData }: Step1Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-white mb-2">
          Tell us about your business
        </h3>
        <p className="text-revnu-gray">We'll use this to personalize everything for you</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Business Name *
        </label>
        <input
          type="text"
          required
          value={formData.businessName}
          onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
          placeholder="Smith Electrical Services"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Industry *
        </label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
        >
          <option value="electrical">Electrical</option>
          <option value="hvac">HVAC</option>
          <option value="plumbing">Plumbing</option>
          <option value="general_contractor">General Contractor</option>
          <option value="roofing">Roofing</option>
          <option value="landscaping">Landscaping</option>
          <option value="carpentry">Carpentry</option>
          <option value="painting">Painting</option>
          <option value="other">Other Trades</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Primary State *
        </label>
        <select
          value={formData.primaryState}
          onChange={(e) => setFormData({ ...formData, primaryState: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
          required
        >
          <option value="">Select your state...</option>
          {US_STATES.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-revnu-gray">
          Used for state-specific mechanic's lien laws and requirements
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Business Phone
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-2">
          Timezone *
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          className="w-full px-4 py-3 bg-revnu-dark border-2 border-revnu-green/20 rounded-lg text-white focus:outline-none focus:border-revnu-green"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="America/Phoenix">Arizona</option>
          <option value="America/Anchorage">Alaska</option>
          <option value="Pacific/Honolulu">Hawaii</option>
        </select>
        <p className="mt-2 text-xs text-revnu-gray">
          Used to send messages during appropriate hours (8 AM - 9 PM)
        </p>
      </div>
    </div>
  );
}
