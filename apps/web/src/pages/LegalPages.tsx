import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { GlassCard } from '@cryptosp/ui';

export const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-5xl text-white mb-6">About CRYPTOSP</h1>
      <GlassCard className="p-8 space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>CRYPTOSP is a high-performance full-stack digital wallet and internal cryptocurrency platform built for fast, transparent value settlement.</p>
        <p>Our platform combines liquid glass visual ergonomics with production PostgreSQL double-entry accounting.</p>
      </GlassCard>
    </div>
    <Footer />
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-5xl text-white mb-6">Terms of Service</h1>
      <GlassCard className="p-8 space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>By registering a Cryptosp digital wallet, you agree to these platform terms.</p>
        <p>Phoenix Coin (PHX) is an internal platform digital asset with an administrator-configured reference value ($10.00 USD). It is not a publicly traded security or bank deposit.</p>
      </GlassCard>
    </div>
    <Footer />
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-5xl text-white mb-6">Privacy Policy</h1>
      <GlassCard className="p-8 space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>Your data privacy is fundamental to our architecture. We store password hashes using bcrypt and collect technical session data strictly for fraud prevention.</p>
      </GlassCard>
    </div>
    <Footer />
  </div>
);

export const RiskPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-5xl text-white mb-6">Risk Disclosure</h1>
      <GlassCard className="p-8 space-y-4 text-neutral-300 text-sm leading-relaxed font-sans">
        <p>Cryptocurrency prices fluctuate based on external market conditions. Market data feeds are provided for reference only.</p>
        <p>Internal Phoenix Coin balances reflect platform accounting values ($10 reference) and are settled internally through double-entry database records.</p>
      </GlassCard>
    </div>
    <Footer />
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-5xl text-white mb-6">Contact & Support</h1>
      <GlassCard className="p-8 space-y-4 text-neutral-300 text-sm leading-relaxed">
        <p>For support or compliance inquiries, reach out to our team at <strong>support@cryptosp.internal</strong>.</p>
      </GlassCard>
    </div>
    <Footer />
  </div>
);
