'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useKeywords } from '@/hooks/use-keywords';
import { LanguageSelector } from '@/components/language-selector';
import { LanguageCode } from '@/lib/api';

interface KeywordFormProps {
  onSuccess?: () => void;
}

export function KeywordForm({ onSuccess }: KeywordFormProps) {
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const { generateKeywords, isGenerating } = useKeywords();

  // Load language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('keyword-language') as LanguageCode;
    if (saved && (saved === 'en' || saved === 'th')) {
      setLanguage(saved);
    }
  }, []);

  // Save language preference when changed
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
    localStorage.setItem('keyword-language', newLanguage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await generateKeywords({
        productTitle,
        productDescription,
        productUrl,
        category: category || undefined,
        language
      });
      
      // Clear form
      setProductTitle('');
      setProductDescription('');
      setProductUrl('');
      setCategory('');
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to generate keywords:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Keywords</CardTitle>
        <CardDescription>
          Enter Shopee product details to generate Facebook-optimized keywords
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <LanguageSelector value={language} onChange={handleLanguageChange} />

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Product Title *
            </label>
            <Input
              id="title"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder={language === 'en' ? "e.g., Wireless Bluetooth Earbuds TWS" : "เช่น หูฟังไร้สาย TWS"}
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Product Description *
            </label>
            <Textarea
              id="description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder={language === 'en' 
                ? "Enter product features, specifications, and benefits..." 
                : "ระบุคุณสมบัติ รายละเอียด และประโยชน์ของสินค้า..."
              }
              required
              maxLength={2000}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="productUrl" className="text-sm font-medium">
              Product Link (Optional)
            </label>
            <Input
              id="productUrl"
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://shopee.co.th/product-link"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category (Optional)
            </label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={language === 'en' ? "e.g., Electronics, Audio, Accessories" : "เช่น อิเล็กทรอนิกส์, เสียง, อุปกรณ์เสริม"}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isGenerating || !productTitle || !productDescription}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Keywords
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
