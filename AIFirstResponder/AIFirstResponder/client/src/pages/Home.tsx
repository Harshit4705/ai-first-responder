import React from "react";
import { AlertTriangle } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import ResultsSection from "@/components/ResultsSection";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  id: number;
  injuryType: string;
  severity: number;
  confidence: number;
  firstAidInstructions: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  recommendedAction: string;
  nearbyFacilities: Array<{
    id: number;
    name: string;
    distance: string;
    duration: string;
    address: string;
    phone: string;
    openHours: string;
    emergencyServices: boolean;
  }>;
}

const Home: React.FC = () => {
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null);
  const [analyzedImage, setAnalyzedImage] = React.useState<string | null>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("POST", "/api/analyze", { image: imageData });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      window.scrollTo({
        top: document.getElementById("results-section")?.offsetTop || 0,
        behavior: "smooth"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not analyze the image. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleAnalyzeImage = (imageData: string) => {
    setAnalyzedImage(imageData);
    analysisMutation.mutate(imageData);
  };

  return (
    <>
      {/* Emergency Disclaimer */}
      <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-primary p-4 mb-6 rounded-md">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mr-3" />
          <div>
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              In case of life-threatening emergency, call <strong>911</strong> (or your local emergency number) immediately.
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              This app provides guidance but is not a substitute for professional medical care.
            </p>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <ImageUpload 
        onAnalyze={handleAnalyzeImage} 
        isLoading={analysisMutation.isPending} 
      />

      {/* Results Section (conditionally displayed) */}
      {analysisResult && analyzedImage && (
        <section id="results-section" className="mb-8 fade-in">
          <ResultsSection 
            analysisResult={analysisResult} 
            analyzedImage={analyzedImage} 
          />
        </section>
      )}
    </>
  );
};

export default Home;
