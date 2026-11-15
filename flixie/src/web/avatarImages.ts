import { getApp } from 'firebase/app';
import { connectStorageEmulator, getDownloadURL, getStorage, ref } from 'firebase/storage';
import { imageUrl, text, type JsonObject } from './models';
import { webConfig } from './config';

const cache = new Map<string,Promise<string>>();
const connected = new WeakSet<object>();
export function avatarSources(avatar: JsonObject, full = false): string[] {
  const original = [avatar.imageUrl,avatar.originalUrl,avatar.url,avatar.storagePath];
  return [...new Set((full ? original : [avatar.iconImageUrl,avatar.iconUrl,avatar.thumbnailUrl,avatar.iconStoragePath,...original]).map(v=>text(v)).filter(Boolean))];
}
export async function resolveAvatarImage(source: string): Promise<string> {
  const config=webConfig();
  const direct=imageUrl(source);
  // Debug avatars use the local Storage emulator, never a cloud bucket URL.
  if (direct && (!config.local || !['firebasestorage.googleapis.com','storage.googleapis.com'].includes(new URL(direct).hostname))) return direct;
  if (!source || source.startsWith('/') || source.includes('..') || /^(https?:|gs:)/i.test(source)) throw new Error('Avatar unavailable');
  const key=`${config.local}:${config.firebase.storageBucket}:${source}`;
  if (!cache.has(key)) {
    const storage=getStorage(getApp(config.local?'flixie-web-local':'flixie-web'));
    if (config.local && !connected.has(storage)) { connectStorageEmulator(storage,'127.0.0.1',9199); connected.add(storage); }
    const pending=getDownloadURL(ref(storage,source)).catch(error=>{cache.delete(key);throw error;});
    cache.set(key,pending);
  }
  return cache.get(key)!;
}
