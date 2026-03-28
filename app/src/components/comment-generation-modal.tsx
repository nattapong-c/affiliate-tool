'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useKeywords } from '@/hooks/use-keywords';
import { useComments } from '@/hooks/use-comments';
import { ScrapedPost } from '@/lib/api';
import { Sparkles, MessageCircle, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CommentGenerationModalProps {
  post: ScrapedPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentGenerationModal({ post, open, onOpenChange }: CommentGenerationModalProps) {
  const { history: products } = useKeywords();
  const { 
    comments, 
    generateComments, 
    isGenerating, 
    selectComment,
    isSelecting 
  } = useComments(post?._id);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const [emotion, setEmotion] = useState<string>('Helpful');
  const [length, setLength] = useState<string>('medium');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Initialize selected product if not set
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0]._id);
    }
  }, [products, selectedProductId]);

  const handleGenerate = async () => {
    if (!post || !selectedProductId) {
      toast.error('Please select a product first');
      return;
    }

    try {
      await generateComments({
        postId: post._id,
        productId: selectedProductId,
        settings: {
          language,
          emotion,
          length: length as any,
          customPrompt: customPrompt || undefined
        }
      });
      toast.success('Comments generated successfully');
    } catch (error) {
      toast.error('Failed to generate comments');
    }
  };

  const handleCopy = (text: string, index: number) => {
    const selectedProduct = products.find(p => p._id === selectedProductId);
    const productUrl = selectedProduct?.productUrl;
    
    let copyText = text;
    if (productUrl) {
      copyText = `${text}\n\nCheck it out here: ${productUrl}`;
    }

    navigator.clipboard.writeText(copyText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success(productUrl ? 'Copied with product link' : 'Copied to clipboard');
  };

  const handleSelect = async (commentId: string, index: number) => {
    try {
      await selectComment({ commentId, index, postId: post!._id });
      toast.success('Comment selection saved');
    } catch (error) {
      toast.error('Failed to save selection');
    }
  };

  const latestComment = comments[comments.length - 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Engagement Specialist
          </DialogTitle>
          <DialogDescription>
            Craft the perfect AI-generated comment for this post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Post Context */}
          <div className="bg-muted/50 p-3 rounded-md text-sm border border-border">
            <Label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
              Post Context
            </Label>
            <p className="line-clamp-3 italic text-muted-foreground">
              "{post?.content}"
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.productTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="th">Thai</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone / Emotion</Label>
              <Select value={emotion} onValueChange={setEmotion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Helpful">Helpful</SelectItem>
                  <SelectItem value="Excited">Excited</SelectItem>
                  <SelectItem value="Humorous">Humorous</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Curious">Curious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Comment Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (1 sentence)</SelectItem>
                  <SelectItem value="medium">Medium (2-3 sentences)</SelectItem>
                  <SelectItem value="long">Long (Paragraph)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Custom Instruction (Optional)</Label>
              <Textarea 
                placeholder="e.g. mention the battery life" 
                className="h-20"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full gap-2" 
            onClick={handleGenerate} 
            disabled={isGenerating || !selectedProductId}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Options
              </>
            )}
          </Button>

          {/* Results Section */}
          {(isGenerating || latestComment) && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Generated Comments
              </h3>

              <div className="grid gap-3">
                {isGenerating ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 h-20 bg-muted/20" />
                    </Card>
                  ))
                ) : (
                  latestComment?.options.map((option: { text: string; version: number }, index: number) => (
                    <Card 
                      key={index} 
                      className={`relative border-2 transition-all ${
                        latestComment.selectedOptionIndex === index 
                          ? 'border-primary bg-primary/5' 
                          : 'border-transparent'
                      }`}
                    >
                      <CardContent className="p-4 pr-12 space-y-3">
                        <p className="text-sm leading-relaxed">{option.text}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleCopy(option.text, index)}
                          >
                            {copiedIndex === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            Copy
                          </Button>
                          <Button
                            variant={latestComment.selectedOptionIndex === index ? "default" : "ghost"}
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleSelect(latestComment._id, index)}
                            disabled={isSelecting}
                          >
                            {latestComment.selectedOptionIndex === index ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
