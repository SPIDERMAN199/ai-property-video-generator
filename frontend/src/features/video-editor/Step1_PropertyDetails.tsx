import React, { useState } from 'react';
import { Building2, MapPin, IndianRupee, Tag, User, Phone, Globe, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Project } from '../../types';

interface Step1Props {
  initialData?: Partial<Project>;
  onNext: (data: Partial<Project>) => void;
  onLoadSample: () => void;
}

const PROPERTY_TYPES = [
  'Apartment',
  'Independent House',
  'Villa',
  'Plot',
  'Commercial Property',
  'Office Space',
  'Other'
];

const SUGGESTED_FEATURES = [
  'Spacious Living Room',
  'Modern Kitchen',
  'Comfortable Bedrooms',
  'Natural Lighting',
  'Scenic Balcony',
  'Gated Community',
  'Infinity Pool',
  'Private Garden'
];

export const Step1_PropertyDetails: React.FC<Step1Props> = ({ initialData, onNext, onLoadSample }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [priceFormatted, setPriceFormatted] = useState(initialData?.price_formatted || '');
  const [propertyType, setPropertyType] = useState(initialData?.property_type || 'Apartment');
  const [bedrooms, setBedrooms] = useState<number | ''>(initialData?.bedrooms ?? 2);
  const [bathrooms, setBathrooms] = useState<number | ''>(initialData?.bathrooms ?? 2);
  const [area, setArea] = useState<number | ''>(initialData?.area ?? 1250);
  const [areaUnit, setAreaUnit] = useState(initialData?.area_unit || 'sq ft');
  const [features, setFeatures] = useState<string[]>(initialData?.key_features || ['Spacious Living Room', 'Modern Kitchen', 'Comfortable Bedrooms']);
  const [featureInput, setFeatureInput] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');
  const [agentName, setAgentName] = useState(initialData?.agent_name || '');
  const [agentPhone, setAgentPhone] = useState(initialData?.agent_phone || '');
  const [websiteUrl, setWebsiteUrl] = useState(initialData?.website_url || '');
  const [ctaText, setCtaText] = useState(initialData?.cta_text || 'Contact us today to schedule an exclusive tour.');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-format Indian Price helper
  const handlePriceChange = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) {
      setPrice('');
      setPriceFormatted('');
      return;
    }
    setPrice(num);
    if (num >= 10000000) {
      setPriceFormatted(`₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`);
    } else if (num >= 100000) {
      setPriceFormatted(`₹${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`);
    } else {
      setPriceFormatted(`₹${num.toLocaleString('en-IN')}`);
    }
  };

  const handleAddFeature = (feat: string) => {
    const clean = feat.trim();
    if (clean && !features.includes(clean)) {
      setFeatures([...features, clean]);
    }
    setFeatureInput('');
  };

  const handleRemoveFeature = (feat: string) => {
    setFeatures(features.filter((f) => f !== feat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Property name is required.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Location is required.');
      return;
    }
    if (price === '' || price <= 0) {
      setErrorMsg('Please specify a valid property price.');
      return;
    }
    if (features.length === 0) {
      setErrorMsg('Please specify at least one key feature.');
      return;
    }

    setErrorMsg('');
    onNext({
      name: name.trim(),
      location: location.trim(),
      price: Number(price),
      price_formatted: priceFormatted || `₹${Number(price).toLocaleString('en-IN')}`,
      property_type: propertyType,
      bedrooms: bedrooms === '' ? null : Number(bedrooms),
      bathrooms: bathrooms === '' ? null : Number(bathrooms),
      area: area === '' ? null : Number(area),
      area_unit: areaUnit,
      key_features: features,
      description: description.trim(),
      agent_name: agentName.trim(),
      agent_phone: agentPhone.trim(),
      website_url: websiteUrl.trim(),
      cta_text: ctaText.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Demo loader shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5EAF2]">
        <div>
          <h2 className="text-xl font-bold text-[#14233B]">Step 1: Property Details</h2>
          <p className="text-sm text-[#68758A]">
            Enter the essential property specifications to power AI marketing copy and scene captions.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-[#3157D5] bg-[#3157D5]/10 hover:bg-[#3157D5]/20 rounded-lg transition-colors border border-[#3157D5]/20 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fill with Skyline Residency Demo</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
            Property Name <span className="text-[#C2413B]">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-[#68758A] absolute left-3 top-3" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Skyline Residency"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5] focus:ring-1 focus:ring-[#3157D5]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
            Location <span className="text-[#C2413B]">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#68758A] absolute left-3 top-3" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Sector 62, Chandigarh, Punjab"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5] focus:ring-1 focus:ring-[#3157D5]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
            Price (INR) <span className="text-[#C2413B]">*</span>
          </label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-[#68758A] absolute left-3 top-3" />
            <input
              type="number"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="e.g. 8500000"
              className="w-full pl-9 pr-24 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5] focus:ring-1 focus:ring-[#3157D5]"
              required
            />
            {priceFormatted && (
              <span className="absolute right-2.5 top-2 bg-[#14233B]/10 text-[#14233B] text-xs font-bold px-2 py-0.5 rounded">
                {priceFormatted}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
            Property Type
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5] focus:ring-1 focus:ring-[#3157D5]"
          >
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Bedrooms</label>
          <input
            type="number"
            min="0"
            max="20"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value === '' ? '' : parseInt(e.target.value))}
            placeholder="e.g. 2"
            className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Bathrooms</label>
          <input
            type="number"
            min="0"
            max="20"
            value={bathrooms}
            onChange={(e) => setBathrooms(e.target.value === '' ? '' : parseInt(e.target.value))}
            placeholder="e.g. 2"
            className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Area</label>
          <input
            type="number"
            min="0"
            value={area}
            onChange={(e) => setArea(e.target.value === '' ? '' : parseFloat(e.target.value))}
            placeholder="e.g. 1250"
            className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Area Unit</label>
          <select
            value={areaUnit}
            onChange={(e) => setAreaUnit(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
          >
            <option value="sq ft">sq ft</option>
            <option value="sq yards">sq yards</option>
            <option value="acres">acres</option>
          </select>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-[#172033] uppercase tracking-wider mb-1.5">
          Key Features & Highlights <span className="text-[#C2413B]">*</span>
        </label>
        
        {/* Active Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {features.map((feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#14233B]/10 text-[#14233B] text-xs font-semibold rounded-full border border-[#14233B]/10"
            >
              <span>{feat}</span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(feat)}
                className="hover:text-[#C2413B] ml-0.5 text-xs font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFeature(featureInput);
              }
            }}
            placeholder="Type a feature and press Enter (e.g. Modular Kitchen)"
            className="flex-1 px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
          />
          <button
            type="button"
            onClick={() => handleAddFeature(featureInput)}
            className="px-4 py-2 bg-[#F6F8FC] hover:bg-[#E5EAF2] text-[#14233B] font-semibold text-xs rounded-lg border border-[#E5EAF2] transition-colors"
          >
            Add
          </button>
        </div>

        {/* Suggested Quick Features */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[#68758A]">Suggestions:</span>
          {SUGGESTED_FEATURES.filter((f) => !features.includes(f)).slice(0, 5).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleAddFeature(f)}
              className="text-[11px] text-[#3157D5] bg-[#3157D5]/5 hover:bg-[#3157D5]/10 px-2 py-0.5 rounded transition-colors"
            >
              + {f}
            </button>
          ))}
        </div>
      </div>

      {/* Agent & CTA Details */}
      <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#E5EAF2]">
        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Agent / Agency Name</label>
          <div className="relative">
            <User className="w-4 h-4 text-[#68758A] absolute left-3 top-3" />
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. Realty Assistant"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Agent Phone / WhatsApp</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#68758A] absolute left-3 top-3" />
            <input
              type="text"
              value={agentPhone}
              onChange={(e) => setAgentPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#68758A] mb-1">Call to Action (CTA)</label>
          <input
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="e.g. Contact us today to schedule a visit"
            className="w-full px-3 py-2 text-sm bg-white border border-[#E5EAF2] rounded-lg focus:outline-none focus:border-[#3157D5]"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-6 border-t border-[#E5EAF2] flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-[#3157D5] hover:bg-[#2846b0] text-white font-semibold text-sm rounded-lg transition-all shadow-sm active:scale-[0.98]"
        >
          <span>Continue to Image Uploads</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
