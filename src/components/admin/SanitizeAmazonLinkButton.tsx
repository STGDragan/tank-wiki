
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SanitizeAmazonLinkButtonProps {
  url: string;
  onUrlChange: (cleanedUrl: string) => void;
  className?: string;
}

const SanitizeAmazonLinkButton = ({ url, onUrlChange, className }: SanitizeAmazonLinkButtonProps) => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const extractASIN = (amazonUrl: string): string | null => {
    if (!amazonUrl || !amazonUrl.toLowerCase().includes('amazon.')) {
      return null;
    }

    // Pattern 1: /dp/ASIN
    let asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1];

    // Pattern 2: /gp/product/ASIN
    asinMatch = amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1];

    // Pattern 3: /product/ASIN
    asinMatch = amazonUrl.match(/\/product\/([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1];

    // Pattern 4: pd_rd_i=ASIN (in query parameters)
    asinMatch = amazonUrl.match(/[?&]pd_rd_i=([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1];

    // Pattern 5: ASIN in query parameter
    asinMatch = amazonUrl.match(/[?&]ASIN=([A-Z0-9]{10})/i);
    if (asinMatch) return asinMatch[1];

    return null;
  };

  const sanitizeAmazonUrl = () => {
    if (!url || !url.trim()) {
      setStatus('error');
      toast({
        title: "No URL provided",
        description: "Please enter an Amazon URL first.",
        variant: "destructive",
      });
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    if (!url.toLowerCase().includes('amazon.')) {
      setStatus('error');
      toast({
        title: "Not an Amazon URL",
        description: "This button only works with Amazon URLs.",
        variant: "destructive",
      });
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const asin = extractASIN(url);
    
    if (!asin) {
      setStatus('error');
      toast({
        title: "No ASIN found",
        description: "Could not extract product ASIN from this Amazon URL.",
        variant: "destructive",
      });
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    const cleanUrl = `https://www.amazon.com/dp/${asin}?tag=travisdraga07-20`;
    onUrlChange(cleanUrl);
    setStatus('success');
    
    toast({
      title: "URL sanitized successfully",
      description: "Amazon URL has been cleaned and tagged with your affiliate ID.",
    });
    
    setTimeout(() => setStatus('idle'), 3000);
  };

  const getTooltipContent = () => {
    switch (status) {
      case 'success':
        return "✅ Cleaned and tagged";
      case 'error':
        return "❌ No ASIN found";
      default:
        return "Clean Amazon URL and add affiliate tag";
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={sanitizeAmazonUrl}
            className={`flex items-center gap-1 text-xs ${className}`}
            disabled={!url || !url.toLowerCase().includes('amazon.')}
          >
            {getIcon()}
            Sanitize
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SanitizeAmazonLinkButton;
