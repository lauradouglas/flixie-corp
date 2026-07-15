/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageId = 'home' | 'features' | 'faq' | 'privacy' | 'terms' | 'contact';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  items: FaqItem[];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  iconName: string; // references lucide-react icons
  colorClass: string;
  detailedDescription?: string;
}

export interface SupportFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}
