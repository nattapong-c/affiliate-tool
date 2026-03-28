'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PostFilterParams } from '@/lib/api';
import { X } from 'lucide-react';

interface PostFiltersProps {
  filters: PostFilterParams;
  onFilterChange: (filters: PostFilterParams) => void;
}

export function PostFilters({ filters, onFilterChange }: PostFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === 'all' ? undefined : (value as any),
      page: 1,
    });
  };

  const handleMinDensityChange = (value: string) => {
    onFilterChange({
      ...filters,
      minDensity: value === 'all' ? undefined : parseFloat(value),
      page: 1,
    });
  };

  const handleReset = () => {
    onFilterChange({});
  };

  return (
    <div className="flex flex-wrap gap-4 items-end mb-6 p-4 border rounded-lg bg-card">
      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={filters.status || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="engaged">Engaged</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px] space-y-2">
        <label className="text-sm font-medium">Min Density</label>
        <Select
          value={filters.minDensity?.toString() || 'all'}
          onValueChange={handleMinDensityChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select density" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="1">1+ (Medium)</SelectItem>
            <SelectItem value="10">10+ (High)</SelectItem>
            <SelectItem value="100">100+ (Viral)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          title="Reset filters"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
