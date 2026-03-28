'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeywordHistoryItem } from '@/lib/api';
import { KeywordPreview } from './keyword-preview';
import { Clock, Trash2, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryItemProps {
  item: KeywordHistoryItem;
  onDelete: (id: string) => void;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const [showKeywords, setShowKeywords] = useState(false);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-lg">{item.productTitle}</h4>
              <Badge variant="outline" className="text-sm">
                {item.language === 'en' ? '🇬🇧' : '🇹🇭'} {item.language.toUpperCase()}
              </Badge>
              {item.cacheHit && (
                <Badge variant="secondary" className="text-xs">
                  ⚡ Cached
                </Badge>
              )}
            </div>
            
            {item.category && (
              <Badge variant="secondary" className="text-xs">
                📁 {item.category}
              </Badge>
            )}

            {item.productUrl && (
              <div className="flex items-center gap-1 text-xs text-primary hover:underline">
                <LinkIcon className="h-3 w-3" />
                <a href={item.productUrl} target="_blank" rel="noopener noreferrer" className="truncate max-w-[300px]">
                  {item.productUrl}
                </a>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✨ {item.keywords.length} keywords</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⏱️ {item.cacheHit ? 'Instant' : `${item.processingTimeMs}ms`}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowKeywords(!showKeywords)}
              className="gap-1"
            >
              {showKeywords ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Keywords
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(item._id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showKeywords && (
          <KeywordPreview keywords={item.keywords} language={item.language} />
        )}
      </CardContent>
    </Card>
  );
}
