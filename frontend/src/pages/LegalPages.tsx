import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-bold mb-6">About CRYPTOSP</h1>
      <p className="text-neutral-400 leading-relaxed mb-4">
        CRYPTOSP is a modern digital wallet and internal payment platform designed for instant, transparent value transfers using double-entry accounting.
      </p>
    </div>
    <Footer />
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="text-neutral-400 leading-relaxed">
        By accessing CRYPTOSP digital wallet platform, you agree to adhere to our terms, double-entry financial rules, and compliance standards.
      </p>
    </div>
    <Footer />
  </div>
);

export const PrivacyPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-neutral-400 leading-relaxed">
        We prioritize security and privacy. User data is encrypted and ledger entries are securely preserved in PostgreSQL.
      </p>
    </div>
    <Footer />
  </div>
);

export const RiskPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-bold mb-6">Risk Disclosure</h1>
      <p className="text-neutral-400 leading-relaxed">
        Digital asset valuations may fluctuate. Phoenix Coin ($10 reference price) is an internal platform reference asset.
      </p>
    </div>
    <Footer />
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-[#030305] text-white bg-liquid-mesh">
    <Navbar />
    <div className="pt-36 pb-24 max-w-4xl mx-auto px-6">
      <h1 className="font-serif text-4xl font-bold mb-6">Contact & Support</h1>
      <p className="text-neutral-400 leading-relaxed">
        For support or compliance inquiries, contact support@cryptosp.internal.
      </p>
    </div>
    <Footer />
  </div>
);
