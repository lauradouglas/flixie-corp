import type { PostHog, PostHogConfig } from 'posthog-js';
import { campaignFromSearch, type Campaign } from './campaign';
import { pageFromPath, site, type PageId } from './site';
export type AnalyticsChoice = 'accepted' | 'declined' | 'unknown';
const choiceKey = 'flixie_website_analytics_v1';
const campaignKey = 'flixie_website_campaign_v1';
const events = new Set(['website_page_viewed', 'website_campaign_landed', 'website_store_clicked']);
const safeProperties = new Set(['token', 'distinct_id', '$device_id', '$session_id', '$window_id', '$lib', '$lib_version', '$insert_id', '$process_person_profile', 'page', 'store', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content']);
export const websiteAnalyticsConfig: Partial<PostHogConfig> = {
  api_host: 'https://eu.i.posthog.com', autocapture: false, capture_pageview: false,
  capture_pageleave: false, rageclick: false, disable_session_recording: true,
  capture_exceptions: false, advanced_disable_flags: true, disable_surveys: true,
  capture_performance: false, capture_heatmaps: false, capture_dead_clicks: false,
  disable_external_dependency_loading: true, person_profiles: 'never',
  save_referrer: false, save_campaign_params: false, persistence: 'localStorage',
  opt_out_capturing_by_default: true,
  before_send: event => {
    if (!events.has(event.event)) return null;
    event.properties = Object.fromEntries(Object.entries(event.properties ?? {}).filter(([key]) => safeProperties.has(key)));
    return event;
  },
};
type Sdk = Pick<PostHog, 'init' | 'capture' | 'opt_in_capturing' | 'opt_out_capturing'>;
export class WebsiteAnalytics {
  choice: AnalyticsChoice = 'unknown';
  private campaign: Campaign | null;
  private arrival: Campaign | null;
  private page: PageId;
  private sdk: Sdk | null = null;
  private loading: Promise<void> | null = null;
  private viewed = new Set<PageId>();
  constructor(private storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
    location: { search: string; pathname: string },
    private loadSdk: () => Promise<Sdk>, private production: boolean) {
    this.page = pageFromPath(location.pathname);
    this.campaign = this.arrival = campaignFromSearch(location.search);
    try {
      const choice = storage.getItem(choiceKey);
      this.choice = choice === 'accepted' || choice === 'declined' ? choice : 'unknown';
      if (this.choice === 'declined') this.campaign = this.arrival = null;
      if (this.choice === 'accepted' && !this.campaign) {
        const data = JSON.parse(storage.getItem(campaignKey) ?? 'null');
        const age = Date.now() - Date.parse(data?.captured_at);
        if (age >= 0 && age <= 30 * 86400000 && data && typeof data === 'object') {
          const params = new URLSearchParams();
          for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) if (typeof data[key] === 'string') params.set(key, data[key]);
          this.campaign = campaignFromSearch(params.toString());
        } else storage.removeItem(campaignKey);
      }
    } catch { /* Denied/corrupt browser storage never blocks the website. */ }
  }
  private persistCampaign() {
    if (this.choice !== 'accepted' || !this.campaign) return;
    try { this.storage.setItem(campaignKey, JSON.stringify({ ...this.campaign, captured_at: new Date().toISOString() })); } catch { /* Memory-only attribution remains usable. */ }
  }
  async start(page: PageId) {
    this.page = page;
    if (this.choice !== 'accepted' || !this.production) return;
    if (this.arrival) this.persistCampaign();
    if (!this.sdk) {
      this.loading ??= this.loadSdk().then(sdk => {
        if (this.choice !== 'accepted') return;
        sdk.init('phc_pBPr8bxMacv2NFncoFSTrD4jjKhwCmEGD58McJkq4CDY', websiteAnalyticsConfig);
        sdk.opt_in_capturing({ captureEventName: false });
        this.sdk = sdk;
      }).catch(() => {}).finally(() => { this.loading = null; });
      await this.loading;
    }
    if (this.choice !== 'accepted' || !this.sdk) return;
    if (!this.viewed.has(this.page)) {
      this.viewed.add(this.page);
      this.capture('website_page_viewed');
    }
    if (this.arrival) { this.capture('website_campaign_landed'); this.arrival = null; }
  }
  async choose(choice: Exclude<AnalyticsChoice, 'unknown'>) {
    this.choice = choice;
    try { this.storage.setItem(choiceKey, choice); } catch { /* Choice still applies this visit. */ }
    if (choice === 'declined') {
      this.campaign = this.arrival = null;
      try { this.storage.removeItem(campaignKey); } catch { /* No tracking continues. */ }
      try { this.sdk?.opt_out_capturing(); } catch { /* Our consent guard still blocks all events. */ }
    } else {
      try { this.sdk?.opt_in_capturing({ captureEventName: false }); } catch { /* Website actions stay available. */ }
      await this.start(this.page);
    }
  }
  capture(event: string, properties: { store?: 'ios' | 'android' } = {}) {
    if (!events.has(event) || this.choice !== 'accepted' || !this.sdk) return;
    try { this.sdk.capture(event, { page: this.page, ...this.campaign, ...properties }, { transport: 'sendBeacon', send_instantly: true }); } catch { /* Analytics never interrupts navigation. */ }
  }
  storeClicked(href: string) {
    const store = storeFromLink(href);
    if (store) this.capture('website_store_clicked', { store });
  }
}
export function storeFromLink(href: string): 'ios' | 'android' | null {
  try {
    const url = new URL(href);
    if (url.origin === 'https://apps.apple.com' && /\/id6779375028$/.test(url.pathname)) return 'ios';
    if (url.origin === 'https://play.google.com' && url.pathname === '/store/apps/details' && url.searchParams.get('id') === 'com.flixie.app') return 'android';
  } catch { /* Ignore ordinary internal links. */ }
  return null;
}
let instance: WebsiteAnalytics | null = null;
export function websiteAnalytics() {
  if (!instance) {
    // Accessing localStorage itself may throw in restricted webviews.
    let storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
    try { storage = window.localStorage; } catch { storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }; }
    instance = new WebsiteAnalytics(storage, window.location, async () => (await import('posthog-js')).default,
      import.meta.env.PROD && window.location.origin === site.origin);
  }
  return instance;
}
