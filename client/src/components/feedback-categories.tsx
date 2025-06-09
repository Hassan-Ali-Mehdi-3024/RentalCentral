import { useState } from "react";
import { Edit3, Save, X, MessageSquare, Star, MapPin, Home, DollarSign, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface FeedbackCategory {
  category: string;
  summaryText: string;
  isEdited: boolean;
  editedBy?: string;
  icon: React.ReactNode;
  color: string;
  responses: string[];
}

interface FeedbackCategoriesProps {
  propertyId: number;
  categories: FeedbackCategory[];
}

export function FeedbackCategories({ propertyId, categories }: FeedbackCategoriesProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSummaryMutation = useMutation({
    mutationFn: (data: { category: string; summaryText: string }) =>
      api.performance.updateFeedbackSummary(propertyId, data.category, data.summaryText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/performance", propertyId] });
      toast({
        title: "Summary Updated",
        description: "Feedback summary has been successfully updated.",
      });
      setEditingCategory(null);
      setEditText("");
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update feedback summary.",
        variant: "destructive",
      });
    },
  });

  const handleEditStart = (category: string, currentText: string) => {
    setEditingCategory(category);
    setEditText(currentText);
  };

  const handleEditSave = () => {
    if (!editingCategory || !editText.trim()) return;
    
    updateSummaryMutation.mutate({
      category: editingCategory,
      summaryText: editText.trim()
    });
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditText("");
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'price': return <DollarSign className="h-5 w-5" />;
      case 'amenities': return <Star className="h-5 w-5" />;
      case 'location': return <MapPin className="h-5 w-5" />;
      case 'size': return <Home className="h-5 w-5" />;
      case 'comparison': return <MessageSquare className="h-5 w-5" />;
      case 'suggestions': return <Lightbulb className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'price': return 'bg-green-50 border-green-200 text-green-800';
      case 'amenities': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'location': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'size': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'comparison': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestions': return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'price': return 'Pricing Feedback';
      case 'amenities': return 'Amenities & Features';
      case 'location': return 'Location Comments';
      case 'size': return 'Size & Layout';
      case 'comparison': return 'Property Comparisons';
      case 'suggestions': return 'Improvement Suggestions';
      default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Feedback Analysis by Category</h3>
        <Badge variant="secondary">
          {categories.length} Categories
        </Badge>
      </div>

      <div className="grid gap-4">
        {categories.map((categoryData) => (
          <Card key={categoryData.category} className={`${getCategoryColor(categoryData.category)} border-2`}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(categoryData.category)}
                  <span>{getCategoryTitle(categoryData.category)}</span>
                  <Badge variant="outline" className="ml-2">
                    {categoryData.responses.length} responses
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {categoryData.isEdited && (
                    <Badge variant="secondary" className="text-xs">
                      Edited by {categoryData.editedBy}
                    </Badge>
                  )}
                  {editingCategory === categoryData.category ? (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={handleEditSave}
                        disabled={updateSummaryMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleEditCancel}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditStart(categoryData.category, categoryData.summaryText)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {editingCategory === categoryData.category ? (
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Enter feedback summary..."
                  className="min-h-24 bg-white"
                  rows={4}
                />
              ) : (
                <p className="text-sm leading-relaxed">
                  {categoryData.summaryText || "No summary available yet. Click edit to add insights."}
                </p>
              )}

              {/* Sample responses for context */}
              {categoryData.responses.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Recent Responses:</h5>
                  <div className="space-y-1">
                    {categoryData.responses.slice(0, 3).map((response, index) => (
                      <div key={index} className="text-xs p-2 bg-white bg-opacity-50 rounded border">
                        "{response}"
                      </div>
                    ))}
                    {categoryData.responses.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{categoryData.responses.length - 3} more responses
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No feedback data available for analysis</p>
            <p className="text-sm text-muted-foreground mt-2">
              Feedback will appear here once prospects complete questionnaires
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}