import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LanguageCode } from './api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getRelevanceColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

export function getRelevanceBadgeColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getLanguageLabel(code: LanguageCode): string {
  const labels: Record<LanguageCode, string> = {
    en: 'English',
    th: 'ไทย'
  };
  return labels[code] || code;
}

export function getLanguageFlag(code: LanguageCode): string {
  const flags: Record<LanguageCode, string> = {
    en: '🇬🇧',
    th: '🇹🇭'
  };
  return flags[code] || '🌐';
}

export function exportToCSV(keywords: Array<{ text: string; category: string; relevanceScore: number; searchVolume: string }>): void {
  const csv = [
    ['Keyword', 'Category', 'Relevance Score', 'Search Volume'],
    ...keywords.map(k => [k.text, k.category, k.relevanceScore, k.searchVolume])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keywords-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
