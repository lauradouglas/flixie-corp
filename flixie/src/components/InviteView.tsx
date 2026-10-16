import { useEffect, useState } from 'react';
import { site } from '../site';
import DownloadLinks from './DownloadLinks';
import { watchInviteOpenLink } from '../watchInvite';
import { sharedMediaStore } from '../mediaShare';
import { Check, Copy, Smartphone, Users } from 'lucide-react';

type InviteDetails = {
  code: string;
  username: string;
};

const apiBase =
  import.meta.env.VITE_API_BASE_URL ??
  'https://flixie-api-fmcehvaecwdheccm.northeurope-01.azurewebsites.net';

export default function InviteView() {

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [watchLink, setWatchLink] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('watch')) {
      const device = sharedMediaStore(navigator.userAgent, navigator.platform, navigator.maxTouchPoints);
      const link = watchInviteOpenLink(window.location.search, device);
      setWatchLink(link);
      setInvalid(link === null);
      return;
    }
    const code = params.get('code')?.trim() ?? '';
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
  }, []);

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
          ) : watchLink ? (
            <>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                Log your shared watch
              </h1>
              <p className="text-text-secondary leading-relaxed">
                Someone you watched with has invited you to log your own watch on Flixie.
                Choose your own date, rating and review in the app.
              </p>
              <a href={watchLink} className="w-full inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-flixie-purple hover:bg-flixie-light px-5 py-4 text-white font-bold transition-colors">
                <Smartphone className="h-5 w-5" aria-hidden="true" />
                Open in Flixie
              </a>
              <h2 className="font-display text-xl font-bold">Need the app?</h2>
              <DownloadLinks />
              <p className="text-text-secondary leading-relaxed">
                After installing Flixie, reopen this invite. If you already have the app,
                tap Open in Flixie above. The app checks whether the invite is still available
                before you choose to log your watch.
              </p>
            </>
          ) : !invite ? (
            <div className="space-y-3"><h1 className="font-display text-2xl font-bold">Your Flixie invitation</h1><p className="text-text-secondary" role="status">Loading your invite…</p><noscript>Enable JavaScript to check your invitation, or ask your friend for the referral code.</noscript></div>
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
                href={site.iosUrl}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-flixie-purple hover:bg-flixie-light px-5 py-4 text-white font-bold transition-colors"
              >
                <Smartphone className="h-5 w-5" />
                {site.iosLabel}
              </a>

              <a
                href={site.androidUrl}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-border-custom hover:bg-bg-elevated px-5 py-4 text-white font-bold transition-colors"
              >
                <Smartphone className="h-5 w-5" />
                {site.androidLabel}
              </a>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
