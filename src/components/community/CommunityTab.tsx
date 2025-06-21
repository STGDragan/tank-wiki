
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Camera, Users, Trophy, Gift, Info, Heart, MessageCircle, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CommunityTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Image uploaded successfully!",
        description: "Your aquarium photo has been shared with the community.",
      });
      
      setSelectedFile(null);
      setCaption("");
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const communityFeatures = [
    {
      icon: <Trophy className="h-5 w-5 text-yellow-600" />,
      title: "Monthly Contests",
      description: "Win prizes for best aquarium photos",
      status: "Coming Soon"
    },
    {
      icon: <Users className="h-5 w-5 text-blue-600" />,
      title: "Community Highlights",
      description: "Featured tanks and success stories",
      status: "Coming Soon"
    },
    {
      icon: <Gift className="h-5 w-5 text-purple-600" />,
      title: "Monthly Giveaways",
      description: "Free equipment and supplies",
      status: "Coming Soon"
    }
  ];

  const samplePosts = [
    {
      id: 1,
      user: "AquaScaper_Mike",
      image: "/api/placeholder/300/200",
      caption: "My 75g planted tank after 6 months! CO2 injection really made a difference 🌱",
      likes: 47,
      comments: 12,
      tags: ["planted", "co2", "75gallon"]
    },
    {
      id: 2,
      user: "ReefMaster_Sarah",
      image: "/api/placeholder/300/200",
      caption: "New additions to my SPS reef! These Acropora frags are already showing great color 🪸",
      likes: 89,
      comments: 23,
      tags: ["reef", "sps", "acropora"]
    },
    {
      id: 3,
      user: "BettaLover_Alex",
      image: "/api/placeholder/300/200",
      caption: "My Betta Splendens 'Neptune' in his 20g long planted paradise 🐠",
      likes: 156,
      comments: 34,
      tags: ["betta", "planted", "20gallon"]
    }
  ];

  return (
    <div className="space-y-6 community-bg min-h-screen p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">Community Gallery</h1>
        <p className="text-white/90 drop-shadow">Share your aquarium journey with fellow enthusiasts</p>
      </div>

      {/* Upload Section */}
      <Card className="vibrant-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Share Your Aquarium
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Max file size: 5MB • JPG, PNG, GIF
              </p>
            </label>
          </div>
          
          {selectedFile && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
              
              <Textarea
                placeholder="Add a caption... (optional)"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
                className="resize-none"
              />
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  className="btn-vibrant flex-1"
                >
                  {isUploading ? "Uploading..." : "Share Photo"}
                </Button>
                <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="vibrant-card">
                    <DialogHeader>
                      <DialogTitle>Community Guidelines & Disclaimer</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          By uploading images, you grant us permission to use your photos for promotional materials, 
                          contests, and community features while maintaining your attribution.
                        </AlertDescription>
                      </Alert>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Community Guidelines:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Only upload your own aquarium photos</li>
                          <li>• Keep content family-friendly and respectful</li>
                          <li>• No spam or promotional content</li>
                          <li>• Respect others' work and experiences</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Future Features:</h4>
                        <ul className="space-y-1 text-muted-foreground">
                          <li>• Monthly photo contests with prizes</li>
                          <li>• Community voting and recognition</li>
                          <li>• Equipment giveaways for active members</li>
                        </ul>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Features Preview */}
      <div className="grid md:grid-cols-3 gap-4">
        {communityFeatures.map((feature, index) => (
          <Card key={index} className="vibrant-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {feature.icon}
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs">
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sample Community Posts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white drop-shadow">Community Highlights</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samplePosts.map((post) => (
            <Card key={post.id} className="vibrant-card overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <span className="text-sm font-medium">{post.user}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{post.caption}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {post.comments}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
