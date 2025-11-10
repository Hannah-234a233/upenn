import React, { useState, useRef, useCallback } from 'react';
import { Building3DViewer } from './Building3DViewer';
import { BuildingControls } from './BuildingControls';
import { CameraControls } from './CameraControls';
import { ScreenshotManager } from './ScreenshotManager';
import { BuildingConfig, SavedImage, ApiConfig } from '../App';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Camera, Download } from 'lucide-react';

interface BuildingEditorProps {
  onSaveImage: (image: SavedImage) => void;
  apiConfigs: ApiConfig[];
}

export function BuildingEditor({ onSaveImage, apiConfigs }: BuildingEditorProps) {
  const viewerRef = useRef<any>(null);
  
  const [buildingConfig, setBuildingConfig] = useState<BuildingConfig>({
    // Elliptical parameters
    majorAxis: 20,
    minorAxis: 15,
    height: 120,
    floors: 30,
    
    // Floor rotation
    rotationPerFloor: 2, // degrees per floor
    
    // Facade properties
    facadeColor: '#C0C0C0',
    glassColor: '#87CEEB',
    glassOpacity: 0.7,
    
    // Vertical louvers
    enableLouvers: true,
    louverSpacing: 2,
    louverDepth: 0.5,
    louverColor: '#A0A0A0',
    
    // Legacy properties for compatibility
    width: 20,
    height: 120,
    depth: 15,
    floors: 30,
    roofType: 'flat',
    windowSpacing: 2,
    windowSize: 1.5,
    doorWidth: 2,
    doorHeight: 3,
    color: '#C0C0C0',
    roofColor: '#654321'
  });

  const [cameraPreset, setCameraPreset] = useState<string>('perspective');

  const handleTakeScreenshot = useCallback(async () => {
    if (viewerRef.current?.takeScreenshot) {
      try {
        const screenshot = await viewerRef.current.takeScreenshot();
        const cameraState = viewerRef.current.getCameraState();
        
        const savedImage: SavedImage = {
          id: Date.now().toString(),
          name: `Building_${new Date().toLocaleString()}`,
          dataUrl: screenshot,
          timestamp: Date.now(),
          buildingConfig: { ...buildingConfig },
          cameraPosition: cameraState.position,
          cameraTarget: cameraState.target
        };
        
        onSaveImage(savedImage);
      } catch (error) {
        console.error('Failed to take screenshot:', error);
      }
    }
  }, [buildingConfig, onSaveImage]);

  const handleExportModel = useCallback(() => {
    if (viewerRef.current?.exportModel) {
      viewerRef.current.exportModel();
    }
  }, []);

  const handleCameraPresetChange = useCallback((preset: string) => {
    setCameraPreset(preset);
    if (viewerRef.current?.setCameraPreset) {
      viewerRef.current.setCameraPreset(preset);
    }
  }, []);

  return (
    <div className="h-full flex">
      {/* Sidebar Controls */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-medium mb-4">Building Parameters</h3>
          <BuildingControls 
            config={buildingConfig}
            onChange={setBuildingConfig}
          />
        </div>
        
        <div className="p-4 border-b">
          <h3 className="font-medium mb-4">Camera Controls</h3>
          <CameraControls 
            currentPreset={cameraPreset}
            onPresetChange={handleCameraPresetChange}
          />
        </div>

        <div className="p-4 border-b">
          <h3 className="font-medium mb-4">Capture & Export</h3>
          <div className="space-y-2">
            <Button 
              onClick={handleTakeScreenshot}
              className="w-full"
              variant="default"
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Screenshot
            </Button>
            <Button 
              onClick={handleExportModel}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Model
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <h3 className="font-medium mb-4">Screenshot Manager</h3>
          <ScreenshotManager apiConfigs={apiConfigs} />
        </div>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Building3DViewer 
          ref={viewerRef}
          config={buildingConfig}
          cameraPreset={cameraPreset}
        />
      </div>
    </div>
  );
}