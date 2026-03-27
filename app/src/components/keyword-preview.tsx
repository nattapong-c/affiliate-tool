'use client';

import { Badge } from '@/components/ui/badge';
import { Keyword, LanguageCode } from '@/lib/api';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface KeywordPreviewProps {
  keywords: Keyword[];
  language: LanguageCode;
}

export function KeywordPreview({ keywords, language }: KeywordPreviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const intentKeywords = keywords.filter(k => k.category === 'intent');
  const topicKeywords = keywords.filter(k => k.category === 'topic');

  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="text-blue-600">🎯</span>
          Intent-based ({intentKeywords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {intentKeywords.map((keyword, idx) => (
            <Badge
              key={`intent-${idx}`}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => copyToClipboard(keyword.text, `intent-${idx}`)}
            >
              {copiedId === `intent-${idx}` ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {keyword.text}
              <span className="ml-1 text-xs opacity-60">({keyword.relevanceScore}%)</span>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="text-purple-600">💬</span>
          Topic-based ({topicKeywords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {topicKeywords.map((keyword, idx) => (
            <Badge
              key={`topic-${idx}`}
              variant="outline"
              className="cursor-pointer hover:bg-background transition-colors"
              onClick={() => copyToClipboard(keyword.text, `topic-${idx}`)}
            >
              {copiedId === `topic-${idx}` ? (
                <Check className="h-3 w-3 mr-1 text-green-600" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {keyword.text}
              <span className="ml-1 text-xs opacity-60">({keyword.relevanceScore}%)</span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t">
        💡 Click any keyword to copy to clipboard
      </div>
    </div>
  );
}
