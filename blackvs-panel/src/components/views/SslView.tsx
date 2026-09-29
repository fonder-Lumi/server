import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Plus,
  RotateCw,
  Lock,
  Key,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sliders,
} from 'lucide-react';
import { SslCertItem } from '../../types';

export const SslView: React.FC = () => {
  const { sslCerts, domains, issueSsl, renewSsl, addToast } = useApp();

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showCustomCertModal, setShowCustomCertModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState(domains[0]?.domain || '');
  const [forceHttpsGlobal, setForceHttpsGlobal] = useState(true);
  const [hstsGlobal, setHstsGlobal] = useState(true);
  const [tls13Only, setTls13Only] = useState(true);
  const [ocspStapling, setOcspStapling] = useState(true);

  // Custom Cert Form
  const [customDomain, setCustomDomain] = useState('');
  const [crtText, setCrtText] = useState('');
  const [keyText, setKeyText] = useState('');
  const [caText, setCaText] = useState('');

  const handleIssueCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomain) return;
    issueSsl(selectedDomain);
    setShowIssueModal(false);
  };

  const handleInstallCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim() || !crtText.trim() || !keyText.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Domain, Certificate CRT, and Private Key are required',
        type: 'error',
      });
      return;
    }

    addToast({
      title: 'Custom Certificate Installed',
      message: `Parsed RSA/ECDSA key pair for ${customDomain}. Nginx reloaded.`,
      type: 'success',
    });
    setShowCustomCertModal(false);
    setCustomDomain('');
    setCrtText('');
    setKeyText('');
    setCaText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            SSL / TLS Encryption & Certificates
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Let's Encrypt automated ACME certificates, custom EV/OV certs, and TLS 1.3 hardening
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCustomCertModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-200 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Install Custom Cert</span>
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Let's Encrypt</span>
          </button>
        </div>
      </div>

      {/* Security Hardening Toggles */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Sliders className="w-4 h-4 text-neutral-400" />
          <span>Server-Wide SSL/TLS Protocol Hardening</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Force HTTPS */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Force HTTPS Redirect</div>
              <div className="text-[11px] text-neutral-500">HTTP 301 to https://</div>
            </div>
            <button
              onClick={() => {
                setForceHttpsGlobal(!forceHttpsGlobal);
                addToast({
                  title: 'HTTPS Redirect Toggled',
                  message: !forceHttpsGlobal ? 'Permanent 301 redirect active' : 'Redirect disabled',
                  type: 'info',
                });
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                forceHttpsGlobal ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  forceHttpsGlobal ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          {/* HSTS */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="font-medium text-white">HSTS Preload</div>
              <div className="text-[11px] text-neutral-500">max-age=31536000</div>
            </div>
            <button
              onClick={() => {
                setHstsGlobal(!hstsGlobal);
                addToast({
                  title: 'HSTS Header Toggled',
                  message: !hstsGlobal ? 'Strict-Transport-Security enabled' : 'Disabled',
                  type: 'info',
                });
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                hstsGlobal ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  hstsGlobal ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          {/* TLS 1.3 */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="font-medium text-white">TLS 1.3 / 1.2 Strict</div>
              <div className="text-[11px] text-neutral-500">Disable legacy TLS 1.0/1.1</div>
            </div>
            <button
              onClick={() => {
                setTls13Only(!tls13Only);
                addToast({
                  title: 'TLS Cipher Hardening',
                  message: !tls13Only ? 'Modern ciphers enforced' : 'Intermediate ciphers allowed',
                  type: 'info',
                });
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                tls13Only ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  tls13Only ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>

          {/* OCSP Stapling */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="font-medium text-white">OCSP Stapling</div>
              <div className="text-[11px] text-neutral-500">Fast SSL handshakes</div>
            </div>
            <button
              onClick={() => {
                setOcspStapling(!ocspStapling);
                addToast({
                  title: 'OCSP Stapling Toggled',
                  message: !ocspStapling ? 'OCSP Stapling enabled' : 'Disabled',
                  type: 'info',
                });
              }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                ocspStapling ? 'bg-white' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  ocspStapling ? 'translate-x-4 bg-black' : 'translate-x-0 bg-neutral-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                <th className="py-3 px-4">Subject Domain</th>
                <th className="py-3 px-4">Certificate Authority</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4">Auto-Renew</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-xs">
              {sslCerts.map((cert) => (
                <tr key={cert.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-white flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold">{cert.domain}</span>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-300 font-mono text-[11px]">
                    {cert.issuer}
                  </td>

                  <td className="py-3.5 px-4 text-neutral-400">
                    {cert.type}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px] tabular-nums">
                    {cert.validFrom} → {cert.validTo}
                  </td>

                  <td className="py-3.5 px-4">
                    {cert.autoRenew ? (
                      <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Enabled (ACME)</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-neutral-500">Manual</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        cert.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {cert.status === 'active' ? 'Valid' : 'Expiring Soon'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => renewSsl(cert.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                      title="Force ACME Renewal Check"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>Renew</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Let's Encrypt Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Issue Free Let's Encrypt Certificate</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueCert} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Select Target Domain</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.domain}>
                      {d.domain} ({d.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-neutral-300 space-y-1">
                <div className="font-semibold text-white">Validation Method: HTTP-01 Challenge</div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  BlackVs ACME client will automatically place the cryptographic token into <span className="font-mono text-neutral-300">.well-known/acme-challenge/</span> and verify with Let's Encrypt authority in ~3 seconds.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl"
                >
                  Issue & Activate TLS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Install Custom Cert Modal */}
      {showCustomCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl glass-dropdown p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-white">Install Custom SSL Certificate (PEM)</h3>
              <button onClick={() => setShowCustomCertModal(false)} className="text-neutral-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleInstallCustom} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. enterprise.secure-portal.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Certificate (CRT)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  value={crtText}
                  onChange={(e) => setCrtText(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-[11px] text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Private Key (KEY)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  value={keyText}
                  onChange={(e) => setKeyText(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-[11px] text-white font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCustomCertModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium text-black bg-white hover:bg-neutral-200 rounded-xl"
                >
                  Validate & Install
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
