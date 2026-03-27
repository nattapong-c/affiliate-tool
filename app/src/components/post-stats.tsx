'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePostStats } from '@/hooks/use-posts';
import { Loader2, Heart, MessageCircle, Share2, TrendingUp, Eye } from 'lucide-react';

export function PostStats() {
  const { stats, isLoading } = usePostStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: stats?.totalPosts || 0,
      icon: Eye,
      description: 'posts scraped',
    },
    {
      title: 'Avg Likes',
      value: Math.round(stats?.avgLikes || 0),
      icon: Heart,
      description: 'per post',
    },
    {
      title: 'Avg Comments',
      value: Math.round(stats?.avgComments || 0),
      icon: MessageCircle,
      description: 'per post',
    },
    {
      title: 'Avg Shares',
      value: Math.round(stats?.avgShares || 0),
      icon: Share2,
      description: 'per post',
    },
    {
      title: 'Avg Density',
      value: (stats?.avgDensity || 0).toFixed(2),
      icon: TrendingUp,
      description: 'engagement/hr',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
