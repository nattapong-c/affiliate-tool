'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Keyword, KeywordGenerationResponse } from '@/lib/api';
import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { formatTime, getRelevanceBadgeColor, exportToCSV, getLanguageFlag, getLanguageLabel } from '@/lib/utils';

interface KeywordResultsProps extends KeywordGenerationResponse {
}

export function KeywordResults({ keywords, processingTimeMs, cacheHit, language }: KeywordResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const intentKeywords = keywords.filter(k => k.category === 'intent');
  const topicKeywords = keywords.filter(k => k.category === 'topic');

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    exportToCSV(keywords);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generated Keywords</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={cacheHit ? 'secondary' : 'default'}>
              {cacheHit ? 'Cached' : 'Fresh'}
            </Badge>
            <Badge variant="outline">
              {getLanguageFlag(language)} {getLanguageLabel(language)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatTime(processingTimeMs)}
            </span>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Intent-based Keywords */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Intent-based ({intentKeywords.length})
            <Badge variant="outline">High Purchase Intent</Badge>
          </h3>
          <div className="grid gap-2">
            {intentKeywords.map((keyword, idx) => (
              <KeywordCard
                key={`intent-${idx}`}
                keyword={keyword}
                onCopy={() => copyToClipboard(keyword.text, `intent-${idx}`)}
                copied={copiedId === `intent-${idx}`}
              />
            ))}
          </div>
        </div>

        {/* Topic-based Keywords */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Topic-based ({topicKeywords.length})
            <Badge variant="outline">Discussion Topics</Badge>
          </h3>
          <div className="grid gap-2">
            {topicKeywords.map((keyword, idx) => (
              <KeywordCard
                key={`topic-${idx}`}
                keyword={keyword}
                onCopy={() => copyToClipboard(keyword.text, `topic-${idx}`)}
                copied={copiedId === `topic-${idx}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface KeywordCardProps {
  keyword: Keyword;
  onCopy: () => void;
  copied: boolean;
}

function KeywordCard({ keyword, onCopy, copied }: KeywordCardProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <p className="font-medium">{keyword.text}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getRelevanceBadgeColor(keyword.relevanceScore)}`} />
            <span className="text-xs text-muted-foreground">
              Relevance: {keyword.relevanceScore}%
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {keyword.searchVolume} volume
          </Badge>
          {keyword.language && (
            <Badge variant="outline" className="text-xs">
              {getLanguageFlag(keyword.language)}
            </Badge>
          )}
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={onCopy}>
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
