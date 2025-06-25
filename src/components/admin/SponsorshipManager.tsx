
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";

const fetchSlideshowImages = async () => {
  const { data, error } = await supabase
    .from("slideshow_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching slideshow images:", error);
    throw new Error(error.message);
  }
  return data;
};

export const SponsorshipManager = () => {
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [newSlide, setNewSlide] = useState({
    image_url: "",
    alt_text: "",
    context: "landing-page",
    display_order: 0
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: slides, isLoading } = useQuery({
    queryKey: ["slideshow-images"],
    queryFn: fetchSlideshowImages,
  });

  const addSlideMutation = useMutation({
    mutationFn: async (slideData: typeof newSlide) => {
      const { error } = await supabase.from('slideshow_images').insert([slideData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideshow-images'] });
      toast({ title: 'Slide Added', description: 'New sponsorship slide has been added.' });
      setIsAddingSlide(false);
      setNewSlide({ image_url: "", alt_text: "", context: "landing-page", display_order: 0 });
    },
    onError: (error: Error) => {
      toast({ title: 'Error adding slide', description: error.message, variant: 'destructive' });
    }
  });

  const deleteSlideMutation = useMutation({
    mutationFn: async (slideId: string) => {
      const { error } = await supabase.from('slideshow_images').delete().eq('id', slideId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slideshow-images'] });
      toast({ title: 'Slide Deleted', description: 'Sponsorship slide has been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting slide', description: error.message, variant: 'destructive' });
    }
  });

  const handleAddSlide = () => {
    if (!newSlide.image_url) {
      toast({ title: 'Image URL Required', description: 'Please provide an image URL.', variant: 'destructive' });
      return;
    }
    addSlideMutation.mutate(newSlide);
  };

  const getContextBadgeVariant = (context: string) => {
    switch (context) {
      case 'landing-page': return 'default';
      case 'shopping-tab': return 'secondary';
      case 'footer': return 'outline';
      default: return 'outline';
    }
  };

  const getContextLabel = (context: string) => {
    switch (context) {
      case 'landing-page': return 'Landing Page';
      case 'shopping-tab': return 'Shopping Tab';
      case 'footer': return 'Footer';
      default: return context;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Sponsorship & Slideshow Manager
          </CardTitle>
          <CardDescription>
            Manage promotional slides and sponsorship content across different areas of your site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Current Slides</h3>
              <p className="text-sm text-muted-foreground">
                {slides?.length || 0} slides configured
              </p>
            </div>
            <Button onClick={() => setIsAddingSlide(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          </div>

          {isAddingSlide && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Add New Slide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="image-url">Image URL*</Label>
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newSlide.image_url}
                      onChange={(e) => setNewSlide(prev => ({ ...prev, image_url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="context">Display Context</Label>
                    <Select 
                      value={newSlide.context} 
                      onValueChange={(value) => setNewSlide(prev => ({ ...prev, context: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landing-page">Landing Page</SelectItem>
                        <SelectItem value="shopping-tab">Shopping Tab</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alt-text">Alt Text</Label>
                    <Input
                      id="alt-text"
                      placeholder="Descriptive text for accessibility"
                      value={newSlide.alt_text}
                      onChange={(e) => setNewSlide(prev => ({ ...prev, alt_text: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="display-order">Display Order</Label>
                    <Input
                      id="display-order"
                      type="number"
                      placeholder="0"
                      value={newSlide.display_order}
                      onChange={(e) => setNewSlide(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddSlide} disabled={addSlideMutation.isPending}>
                    {addSlideMutation.isPending ? "Adding..." : "Add Slide"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingSlide(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {slides?.map((slide) => (
              <Card key={slide.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={slide.image_url}
                        alt={slide.alt_text || "Slide image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Badge variant={getContextBadgeVariant(slide.context) as any}>
                          {getContextLabel(slide.context)}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Order: {slide.display_order}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(slide.image_url, '_blank')}
                          title="View full image"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSlideMutation.mutate(slide.id)}
                          className="text-destructive hover:text-destructive"
                          title="Delete slide"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {slide.alt_text && (
                      <p className="text-xs text-muted-foreground">
                        Alt: {slide.alt_text}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!isLoading && (!slides || slides.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sponsorship slides configured yet.</p>
              <p className="text-sm">Add your first slide to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
