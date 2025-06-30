
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeedback, type FeedbackData, type FeedbackType } from "@/hooks/useFeedback";
import { ImagePlus, X } from "lucide-react";

const feedbackTypes = [
  { value: 'bug' as FeedbackType, label: 'Bug Report', description: 'Report a technical issue or error' },
  { value: 'suggestion' as FeedbackType, label: 'Feature Suggestion', description: 'Suggest a new feature or improvement' },
  { value: 'issue' as FeedbackType, label: 'General Issue', description: 'Report a problem or concern' },
  { value: 'general' as FeedbackType, label: 'General Feedback', description: 'Share your thoughts or comments' },
];

export function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'general',
    title: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { submitFeedback, isSubmitting } = useFeedback();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      return;
    }

    const success = await submitFeedback(formData);
    if (success) {
      setFormData({
        type: 'general',
        title: '',
        description: '',
        image: null,
      });
      setImagePreview(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-800 border-2 border-cyan-500/50">
      <CardHeader>
        <CardTitle className="text-white">Submit Feedback</CardTitle>
        <CardDescription className="text-gray-400">
          Help us improve by sharing your feedback, reporting bugs, or suggesting new features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-white">Feedback Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: FeedbackType) => 
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-600">
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-400">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of your feedback"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about your feedback..."
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Attachment (Optional)</Label>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-gray-600"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 bg-gray-700/30">
                  <div className="text-center">
                    <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="image" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-white">
                          Upload an image
                        </span>
                        <span className="mt-1 block text-sm text-gray-400">
                          PNG, JPG, GIF up to 10MB
                        </span>
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
