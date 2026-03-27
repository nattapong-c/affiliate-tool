'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KeywordHistoryItem } from '@/lib/api';
import { formatDate, formatTime, getLanguageFlag, getLanguageLabel } from '@/lib/utils';
import { Trash2, Clock, FileText } from 'lucide-react';
import { useKeywords } from '@/hooks/use-keywords';

interface KeywordHistoryProps {
  history: KeywordHistoryItem[];
  isLoading: boolean;
}

export function KeywordHistory({ history, isLoading }: KeywordHistoryProps) {
  const { deleteHistory } = useKeywords();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No keyword generations yet</p>
            <p className="text-sm">Generate keywords to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation History</CardTitle>
        <p className="text-sm text-muted-foreground">
          Last {history.length} generations
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => (
            <HistoryItem
              key={item._id}
              item={item}
              onDelete={() => deleteHistory(item._id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface HistoryItemProps {
  item: KeywordHistoryItem;
  onDelete: () => void;
}

function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const intentCount = item.keywords.filter(k => k.category === 'intent').length;
  const topicCount = item.keywords.filter(k => k.category === 'topic').length;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-semibold">{item.productTitle}</h4>
          <div className="flex items-center gap-2 mt-1">
            {item.category && (
              <Badge variant="secondary">
                {item.category}
              </Badge>
            )}
            <Badge variant="outline">
              {getLanguageFlag(item.language)} {getLanguageLabel(item.language)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(item.createdAt)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Keywords:</span>
          <Badge variant="outline">{item.keywords.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Intent:</span>
          <Badge variant="default">{intentCount}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Topic:</span>
          <Badge variant="secondary">{topicCount}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Time:</span>
          <span>{formatTime(item.processingTimeMs)}</span>
        </div>
        {item.cacheHit && (
          <Badge variant="secondary">Cached</Badge>
        )}
      </div>

      <div className="text-sm text-muted-foreground line-clamp-2">
        {item.productDescription}
      </div>
    </div>
  );
}
