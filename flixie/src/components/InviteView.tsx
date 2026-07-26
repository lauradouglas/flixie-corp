import { useEffect, useMemo, useState } from 'react';
import { Check, Clapperboard, Copy, Smartphone, Users } from 'lucide-react';

type InviteDetails = {
  code: string;
  username: string;
};

const apiBase =
  import.meta.env.VITE_API_BASE_URL ??
  'https://flixie-api-fmcehvaecwdheccm.northeurope-01.azurewebsites.net';

export default function InviteView() {
  const code = useMemo(
    () => new URLSearchParams(window.location.search).get('code')?.trim() ?? '',
    [],
  );
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) {
      setInvalid(true);
      return;
    }
    fetch(`${apiBase}/referrals/${encodeURIComponent(code)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Invalid invite');
        return response.json() as Promise<InviteDetails>;
      })
      .then(setInvite)
      .catch(() => setInvalid(true));
  }, [code]);

  const copyCode = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative overflow-hidden pt-28 pb-20">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[520px] h-[360px] bg-flixie-purple/10 rounded-full blur-[110px] pointer-events-none" />
      <section className="relative max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-bg-card border border-border-custom rounded-3xl p-6 sm:p-9 text-center shadow-2xl space-y-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-tr from-flixie-deep to-flixie-purple flex items-center justify-center shadow-lg shadow-flixie-purple/20">
            <Users className="h-8 w-8 text-white" />
          </div>

          {invalid ? (
            <>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                This invite link isn’t valid
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed">
                Ask your friend to share a fresh invite from Flixie.
              </p>
            </>
          ) : !invite ? (
            <p className="text-text-secondary">Loading your invite…</p>
          ) : (
            <>
              <div className="space-y-3">
                <p className="text-flixie-purple text-xs font-bold uppercase tracking-widest">
                  Invited by @{invite.username}
                </p>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Find your Movie Match
                </h1>
                <p className="text-text-secondary text-sm leading-relaxed">
                  @{invite.username} invited you because Flixie helps friends
                  find films and shows they’ll enjoy together. Complete your
                  taste profile and you’ll both unlock a personalised list of
                  films picked for the two of you.
                </p>
              </div>

              <div className="rounded-2xl bg-bg-darkest border border-border-custom px-5 py-5 sm:px-7 sm:py-6 overflow-hidden">
                <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">
                  Keep this referral code
                </p>
                <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 min-w-0">
                  <span className="min-w-0 max-w-full break-all text-center font-mono text-[clamp(0.9rem,3vw,1.25rem)] font-bold tracking-[0.12em] leading-relaxed text-white">
                    {invite.code}
                  </span>
                  <button
                    type="button"
                    onClick={copyCode}
                    className="shrink-0 p-2 rounded-xl text-flixie-purple hover:bg-white/5 transition-colors"
                    aria-label="Copy referral code"
                  >
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-text-muted">
                  Enter it under “Who referred you?” when creating your account.
                </p>
              </div>

              <a
                href="https://testflight.apple.com/join/RRrZjJw7"
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-flixie-purple hover:bg-flixie-light px-5 py-4 text-white font-bold transition-colors"
              >
                <Smartphone className="h-5 w-5" />
                Install the iOS beta with TestFlight
              </a>

              <div className="flex items-start gap-3 text-left rounded-2xl border border-border-custom p-4">
                <Clapperboard className="h-5 w-5 text-flixie-teal shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed text-text-muted">
                  Android is currently a closed test and requires an approved
                  Google account. Ask your inviter if you need Android access.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
