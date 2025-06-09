import { useState, useRef } from "react";
import { CloudUpload, FileText, FileSpreadsheet, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function FileUpload() {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => api.properties.import(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Import Started",
        description: `File "${data.filename}" uploaded successfully. Processing ${(data.size / 1024).toFixed(1)}KB of data.`,
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CloudUpload className="h-5 w-5 mr-2" />
          Import Properties
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Upload property data from CSV or Excel files
        </p>
      </CardHeader>
      
      <CardContent>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragOver 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
        >
          <CloudUpload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">
            Drop files here or click to browse
          </h4>
          <p className="text-muted-foreground mb-4">
            Supports CSV, Excel (.xlsx, .xls) files up to 10MB
          </p>
          <Button 
            type="button"
            disabled={uploadMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {uploadMutation.isPending ? "Uploading..." : "Choose Files"}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <FileText className="h-8 w-8 text-secondary mx-auto mb-2" />
            <p className="font-medium text-foreground">CSV Format</p>
            <p className="text-sm text-muted-foreground">Standard comma-separated values</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <FileSpreadsheet className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-medium text-foreground">Excel Format</p>
            <p className="text-sm text-muted-foreground">Microsoft Excel files</p>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <Download className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="font-medium text-foreground">Template</p>
            <button className="text-sm text-primary hover:underline">Download sample</button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
