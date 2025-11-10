import React from 'react';
import { Button } from './ui/button';
import { Eye, RotateCcw, Home } from 'lucide-react';

interface CameraControlsProps {
  currentPreset: string;
  onPresetChange: (preset: string) => void;
}

export function CameraControls({ currentPreset, onPresetChange }: CameraControlsProps) {
  const presets = [
    { id: 'perspective', label: 'Perspective', icon: Eye },
    { id: 'front', label: 'Front', icon: Home },
    { id: 'back', label: 'Back', icon: Home },
    { id: 'left', label: 'Left', icon: Home },
    { id: 'right', label: 'Right', icon: Home },
    { id: 'top', label: 'Top View', icon: Eye },
    { id: 'isometric', label: 'Isometric', icon: RotateCcw },
    { id: 'ground', label: 'Ground Level', icon: Home },
    { id: 'aerial', label: 'Aerial View', icon: Eye }
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Choose a camera angle or use mouse to orbit around the building
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {presets.slice(0, 6).map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={currentPreset === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange(id)}
            className="w-full justify-start"
          >
            <Icon className="w-3 h-3 mr-2" />
            {label}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {presets.slice(6).map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={currentPreset === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPresetChange(id)}
            className="w-full justify-start"
          >
            <Icon className="w-3 h-3 mr-2" />
            {label}
          </Button>
        ))}
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Mouse Controls:</strong></p>
        <p>• Left click + drag: Rotate</p>
        <p>• Right click + drag: Pan</p>
        <p>• Scroll: Zoom in/out</p>
      </div>
    </div>
  );
}