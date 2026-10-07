import { X } from 'lucide-react';

export default function TermsModal({ onDecline, onAgree }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
      onClick={onDecline}
    >
      <div
        className="max-w-md w-full max-h-[80vh] rounded-3xl p-6 overflow-y-auto animate-cute-pop"
        style={{ background: 'var(--surface)', border: '1.5px solid var(--border-soft)', boxShadow: 'var(--modal-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
            Terms of Service & Privacy Policy
          </h2>
          <button onClick={onDecline} className="p-1 rounded-full hover:bg-black/5 transition" style={{ color: 'var(--ink-soft)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-[13px] font-medium leading-relaxed normal-case" style={{ color: 'var(--ink-soft)' }}>
          <div>
            <h3 className="text-[15px] font-bold text-[var(--ink)] mb-2">Terms of Service</h3>
            <p className="mb-2">By using Unfiltered, you agree to the following terms:</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>This app is created for academic purposes as part of an HCI & UX Design project.</p></div>
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>All data entered is for demonstration purposes only and is not stored permanently.</p></div>
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>You are responsible for the content you create and share within the app.</p></div>
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>The app is provided "as is" without warranties of any kind.</p></div>
            </div>
          </div>

          <div>
            <h3 className="text-[15px] font-bold text-[var(--ink)] mb-2">Privacy Policy</h3>
            <p className="mb-2">Your privacy matters to us. Here's how we handle your data:</p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>No personal data is collected, stored, or shared with third parties.</p></div>
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>All journal entries are stored locally on your device and are not transmitted to external servers.</p></div>
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>Your email and password are used solely for authentication within the app.</p></div>
              <div className="flex items-start gap-2"><span className="text-[var(--accent)]">•</span><p>No analytics or tracking tools are implemented in this application.</p></div>
            </div>
          </div>

          <div className="border-t border-[var(--border-soft)] pt-3" />

          <p className="text-[12px] italic opacity-75">
            By tapping "I Agree", you acknowledge that you have read and understood these terms.
          </p>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onDecline}
            className="flex-1 py-3 rounded-2xl text-[14px] font-bold transition hover:bg-black/5 cursor-pointer"
            style={{ color: 'var(--ink-soft)', background: 'var(--surface-muted)' }}
          >
            Decline
          </button>
          <button
            onClick={onAgree}
            className="flex-1 py-3 rounded-2xl text-[14px] font-bold text-white transition hover:scale-[1.02] active:scale-95 cursor-pointer"
            style={{ background: 'var(--accent)' }}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}