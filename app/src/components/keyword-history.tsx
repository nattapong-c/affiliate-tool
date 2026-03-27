'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeywordHistoryItem, LanguageCode } from '@/lib/api';
import { HistoryItem } from '@/components/history-item';
import { useKeywords } from '@/hooks/use-keywords';
import { Search, Filter, X, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface KeywordHistoryProps {
}

export function KeywordHistory() {
  const { history, isLoading, deleteHistory } = useKeywords();
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'th'>('all');

  const handleDelete = async (id: string) => {
    await deleteHistory(id);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.productTitle
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLanguage = languageFilter === 'all' || 
      item.language === languageFilter;
    
    return matchesSearch && matchesLanguage;
  });

  const handleReset = () => {
    setSearchQuery('');
    setLanguageFilter('all');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
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
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No keyword generations yet</p>
            <p className="text-sm mt-1">Generate keywords to see them here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Generation History</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredHistory.length} of {history.length} items
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-end p-4 border rounded-lg bg-muted/50">
          <div className="flex-1 min-w-[250px] space-y-2">
            <label className="text-sm font-medium">Search Products</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="w-[200px] space-y-2">
            <label className="text-sm font-medium">Language</label>
            <Select value={languageFilter} onValueChange={(v: any) => setLanguageFilter(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="en">English 🇬🇧</SelectItem>
                <SelectItem value="th">Thai 🇹🇭</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            title="Reset filters"
            className="mb-[1px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* History Items */}
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <HistoryItem
              key={item._id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No items match your filters</p>
            <Button variant="link" onClick={handleReset} className="mt-2">
              Reset filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
