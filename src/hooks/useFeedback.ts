
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";

export type FeedbackType = 'bug' | 'suggestion' | 'issue' | 'general';

export interface FeedbackData {
  type: FeedbackType;
  title: string;
  description: string;
  image?: File | null;
}

export function useFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitFeedback = async (feedbackData: FeedbackData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (feedbackData.image) {
        const fileExt = feedbackData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('feedback-images')
          .upload(fileName, feedbackData.image);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('feedback-images')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      // Submit feedback
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          type: feedbackData.type,
          title: feedbackData.title,
          description: feedbackData.description,
          image_url: imageUrl,
          browser_info: browserInfo,
          page_url: window.location.href,
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for your feedback. We'll review it and get back to you at OriginalTankWiki@gmail.com if needed.",
      });

      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later or contact OriginalTankWiki@gmail.com if the issue persists.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitFeedback,
    isSubmitting,
  };
}
