import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";

export default function Import() {
  return (
    <div className="flex-1 overflow-hidden">
      <Header 
        title="Import Properties" 
        subtitle="Upload property data from CSV or Excel files" 
      />
      
      <main className="p-6 overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto">
          <FileUpload />
        </div>
      </main>
    </div>
  );
}
