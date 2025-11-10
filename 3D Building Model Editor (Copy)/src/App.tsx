import React, { useState } from 'react';
import { BuildingEditor } from './components/BuildingEditor';
import { Gallery } from './components/Gallery';
import { ApiManager } from './components/ApiManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card } from './components/ui/card';
import { Building, Image, Settings } from 'lucide-react';

export interface BuildingConfig {
  // Elliptical floor plan
  majorAxis: number;
  minorAxis: number;
  height: number;
  floors: number;
  
  // Floor rotation
  rotationPerFloor: number; // degrees
  
  // Facade properties
  facadeColor: string;
  glassColor: string;
  glassOpacity: number;
  
  // Vertical louvers
  enableLouvers: boolean;
  louverSpacing: number;
  louverDepth: number;
  louverColor: string;
  
  // Legacy properties for compatibility
  width: number;
  depth: number;
  roofType: 'flat' | 'pitched' | 'pyramid';
  windowSpacing: number;
  windowSize: number;
  doorWidth: number;
  doorHeight: number;
  color: string;
  roofColor: string;
}

export interface SavedImage {
  id: string;
  name: string;
  dataUrl: string;
  timestamp: number;
  buildingConfig: BuildingConfig;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  headers: Record<string, string>;
  enabled: boolean;
}

export default function App() {
  const [savedImages, setSavedImages] = useState<SavedImage[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);

  const handleSaveImage = (image: SavedImage) => {
    setSavedImages(prev => [image, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setSavedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpdateApiConfigs = (configs: ApiConfig[]) => {
    setApiConfigs(configs);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b p-4">
        <div className="flex items-center gap-3">
          <Building className="w-6 h-6 text-primary" />
          <h1 className="font-medium">Elliptical Skyscraper Editor</h1>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="editor" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="apis" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              API Manager
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="flex-1 m-4 mt-2">
            <Card className="h-full p-0 overflow-hidden">
              <BuildingEditor 
                onSaveImage={handleSaveImage}
                apiConfigs={apiConfigs}
              />
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="flex-1 m-4 mt-2">
            <Card className="h-full p-4">
              <Gallery 
                images={savedImages}
                onDeleteImage={handleDeleteImage}
                apiConfigs={apiConfigs}
              />
            </Card>
          </TabsContent>

          <TabsContent value="apis" className="flex-1 m-4 mt-2">
            <Card className="h-full p-4">
              <ApiManager 
                configs={apiConfigs}
                onUpdateConfigs={handleUpdateApiConfigs}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}