import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Bell,
  Database,
  Globe,
  SlidersHorizontal,
  Moon,
  Info,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const [blurStrength, setBlurStrength] = useState('16px');
  const [glowEffects, setGlowEffects] = useState(true);
  const [notifyOnGrowth, setNotifyOnGrowth] = useState(true);
  const [notifyOnFunding, setNotifyOnFunding] = useState(true);
  const [notifyOnHiring, setNotifyOnHiring] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://discord.com/api/webhooks/948573.../intelliscope');

  const handleSaveSettings = () => {
    toast.success('System preferences saved successfully');
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-[26px] md:text-[32px] font-black tracking-tight leading-none text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-accent animate-spin-slow" />
          <span>System Settings</span>
        </h1>
        <p className="text-[13.5px] text-text-secondary mt-2">
          Adjust visual interfaces, webhook endpoints, notifications filters, and view database integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Side: Category Menu */}
        <div className="md:col-span-1 glass-panel rounded-2xl p-4.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider text-text-secondary border-b border-white/6 pb-2.5 mb-2">
            Settings Menu
          </div>
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-[13px] font-semibold text-white w-full text-left">
            <Sliders className="w-4 h-4 text-accent" />
            <span>UI Customizations</span>
          </button>
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/4 hover:text-white text-[13px] font-semibold w-full text-left">
            <Bell className="w-4 h-4 text-text-secondary" />
            <span>Notification Filters</span>
          </button>
          <button className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-text-secondary hover:bg-white/4 hover:text-white text-[13px] font-semibold w-full text-left">
            <Database className="w-4 h-4 text-text-secondary" />
            <span>Database Integrations</span>
          </button>
        </div>

        {/* Right Side: Settings Content Panels */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Section 1: UI Styles */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 shadow-md">
            <h3 className="text-[14.5px] font-bold text-white flex items-center gap-2 border-b border-white/6 pb-2.5">
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              <span>SaaS Aesthetics (2026 Standards)</span>
            </h3>

            {/* Glassmorphic Blur Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[12px] font-semibold text-text-secondary">
                <span>Glassmorphism Backdrop Blur Strength</span>
                <span className="text-white bg-white/4 px-1.5 py-0.5 rounded font-mono text-[11px]">
                  {blurStrength}
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="4"
                value={parseInt(blurStrength)}
                onChange={(e) => {
                  const val = `${e.target.value}px`;
                  setBlurStrength(val);
                  // Dynamic injection of CSS property
                  document.documentElement.style.setProperty('--blur-strength', val);
                  toast.info(`Backdrop blur updated to ${val}`);
                }}
                className="w-full accent-accent h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Glowing borders toggle */}
            <div className="flex items-center justify-between py-2 border-t border-white/4 mt-1">
              <div className="flex flex-col gap-0.5">
                <span className="text-[12.5px] font-semibold text-white">Card Glowing Hover Borders</span>
                <span className="text-[10px] text-text-secondary">Subtle accent gradient overlay on hover</span>
              </div>
              <input
                type="checkbox"
                checked={glowEffects}
                onChange={(e) => {
                  setGlowEffects(e.target.checked);
                  toast.success(`Hover glows ${e.target.checked ? 'activated' : 'deactivated'}`);
                }}
                className="w-9 h-5 bg-white/10 checked:bg-accent rounded-full appearance-none outline-none cursor-pointer transition relative 
                  before:content-[''] before:absolute before:w-4 before:h-4 before:rounded-full before:bg-white before:top-0.5 before:left-0.5 before:transition-transform checked:before:translate-x-4"
              />
            </div>
          </div>

          {/* Section 2: Notifications / Webhooks */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 shadow-md">
            <h3 className="text-[14.5px] font-bold text-white flex items-center gap-2 border-b border-white/6 pb-2.5">
              <Bell className="w-4 h-4 text-accent" />
              <span>Signal Notification Filters</span>
            </h3>

            <div className="flex flex-col gap-3">
              {/* Checkboxes */}
              {[
                { checked: notifyOnGrowth, set: setNotifyOnGrowth, title: 'Headcount Growth Surges', desc: 'Trigger signal alarms if headcount rises by >15% monthly.' },
                { checked: notifyOnFunding, set: setNotifyOnFunding, title: 'Funding Closures', desc: 'Notify immediately on Series seed, A, B, and Venture rounds.' },
                { checked: notifyOnHiring, set: setNotifyOnHiring, title: 'Hiring Vacancies Velocity', desc: 'Notify when engineer vacancy volume expands by >30%.' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start justify-between py-1">
                  <div className="flex flex-col gap-0.5 pr-4">
                    <span className="text-[12px] font-semibold text-white">{item.title}</span>
                    <span className="text-[9.5px] text-text-secondary leading-normal">{item.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.set(e.target.checked)}
                    className="w-4.5 h-4.5 accent-accent shrink-0 rounded bg-[#16181D] border-white/6 outline-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            {/* Webhook Input */}
            <div className="flex flex-col gap-1.5 border-t border-white/4 pt-4 mt-1">
              <label className="text-[11.5px] font-bold text-text-secondary uppercase tracking-wider">
                System Webhook Trigger Endpoint
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-[#16181D] border border-white/6 rounded-xl p-3.5 text-[12px] text-white font-mono outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Section 3: High Density Diagnostics Database Stats */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5 shadow-md">
            <h3 className="text-[14.5px] font-bold text-white flex items-center gap-2 border-b border-white/6 pb-2.5">
              <Database className="w-4 h-4 text-accent" />
              <span>Database & System Diagnostics</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-[11.5px] font-medium leading-none text-text-secondary">
              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#16181D]/30 border border-white/4">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider">SQLite DB Status</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                  <span>Connected (intelliscope.db)</span>
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#16181D]/30 border border-white/4">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Redis Cache TTL</span>
                <span className="text-white font-semibold">Active (3,600s TTL)</span>
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#16181D]/30 border border-white/4">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Uvicorn Port</span>
                <span className="text-white font-semibold font-mono">http://localhost:8000</span>
              </div>

              <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-[#16181D]/30 border border-white/4">
                <span className="text-[9.5px] font-extrabold uppercase tracking-wider">Crustdata Sync</span>
                <span className="text-white font-semibold">Token Active (v2025-11-01)</span>
              </div>
            </div>
          </div>

          {/* Action Trigger Save */}
          <button
            onClick={handleSaveSettings}
            className="py-3 px-6 bg-accent hover:bg-accent/90 text-white rounded-xl text-[13px] font-bold self-end cursor-pointer shadow-lg shadow-accent/15"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
}
export default Settings;
