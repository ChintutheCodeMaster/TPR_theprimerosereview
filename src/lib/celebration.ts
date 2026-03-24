export type CelebrationEvent =
  | 'essay_submitted'
  | 'new_application'
  | 'rec_letter_received'
  | 'feedback_sent'
  | 'rec_letter_sent';

export interface CelebrationConfig {
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  confettiColors: string[];
}

export const CELEBRATION_CONFIGS: Record<CelebrationEvent, CelebrationConfig> = {
  essay_submitted: {
    emoji: '🎉',
    title: 'Essay Submitted!',
    subtitle: 'Your story is on its way.',
    gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)',
    confettiColors: ['#22c55e', '#14b8a6', '#6ee7b7', '#a7f3d0', '#ffffff'],
  },
  new_application: {
    emoji: '🚀',
    title: 'Application Started!',
    subtitle: 'Every great journey begins here.',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    confettiColors: ['#8b5cf6', '#6366f1', '#c4b5fd', '#a5b4fc', '#ffffff'],
  },
  rec_letter_received: {
    emoji: '⭐',
    title: 'Letter Received!',
    subtitle: 'Your counselor came through for you.',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    confettiColors: ['#f59e0b', '#f97316', '#fde68a', '#fed7aa', '#ffffff'],
  },
  feedback_sent: {
    emoji: '✉️',
    title: 'Feedback Sent!',
    subtitle: "You're making a difference.",
    gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    confettiColors: ['#3b82f6', '#06b6d4', '#93c5fd', '#67e8f9', '#ffffff'],
  },
  rec_letter_sent: {
    emoji: '🌟',
    title: 'Letter Delivered!',
    subtitle: 'Another student ready to shine.',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    confettiColors: ['#ec4899', '#f43f5e', '#f9a8d4', '#fda4af', '#ffffff'],
  },
};
