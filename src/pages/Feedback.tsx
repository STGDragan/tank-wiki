
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Lightbulb, MessageSquare, AlertTriangle } from "lucide-react";

const Feedback = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">We Value Your Feedback</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your input helps us improve the platform. Whether you've found a bug, have a suggestion, 
          or just want to share your thoughts, we'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="text-center pb-4">
            <Bug className="h-8 w-8 mx-auto text-red-500" />
            <CardTitle className="text-lg">Bug Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Found something broken? Help us fix it by reporting bugs.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <Lightbulb className="h-8 w-8 mx-auto text-yellow-500" />
            <CardTitle className="text-lg">Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Have ideas for new features or improvements? We're all ears!
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <AlertTriangle className="h-8 w-8 mx-auto text-orange-500" />
            <CardTitle className="text-lg">Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Experiencing problems or have concerns? Let us know.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center pb-4">
            <MessageSquare className="h-8 w-8 mx-auto text-blue-500" />
            <CardTitle className="text-lg">General</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Share your thoughts, comments, or any other feedback.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <FeedbackForm />
    </div>
  );
};

export default Feedback;
