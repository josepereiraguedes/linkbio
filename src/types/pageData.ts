/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CourseCardData {
  id: string;
  badge: string;
  badgeColor: string; // e.g. '#ff4612' or '#235848' or '#7c3aed'
  line1: string;
  line2Prefix: string;
  line2Bold: string;
  line3Bold: string;
  line3Suffix: string;
  buttonText: string;
  coverImage: string;
  
  // Modal Data
  modalTag: string;
  modalTitle: string;
  modalSubtitle: string;
  modalStats: string;
  learningTitle: string;
  learningItems: {
    title: string;
    description: string;
  }[];
  perk1Title: string;
  perk1Desc: string;
  perk2Title: string;
  perk2Desc: string;
  offerBadge: string;
  originalPrice: string;
  installmentPrice: string;
  cashPrice: string;
  checkoutButtonText: string;
  checkoutUrl: string;
}

export interface SupportReason {
  id: string;
  title: string;
  desc: string;
  message: string;
}

export interface SupportCardData {
  title: string;
  subtitle: string;
  linkText: string;
  whatsappNumber: string;
  modalTitle: string;
  modalSubtitle: string;
  reasons: SupportReason[];
}

export interface SocialAccountData {
  username: string;
  followers: string;
  followersLabel: string;
  description: string;
  buttonText: string;
  url: string;
}

export interface ProfileData {
  avatarUrl: string;
  name: string;
  bioHeading: string;
  bioBody: string;
  stat1: string;
  stat2: string;
}

export interface PageData {
  profile: ProfileData;
  card1: CourseCardData;
  card2: CourseCardData;
  card3: CourseCardData;
  support: SupportCardData;
  socials: {
    instagram: SocialAccountData;
    youtube: SocialAccountData;
    tiktok: SocialAccountData;
  };
}
