import React from 'react';
import { BuildingConfig } from '../App';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';

interface BuildingControlsProps {
  config: BuildingConfig;
  onChange: (config: BuildingConfig) => void;
}

export function BuildingControls({ config, onChange }: BuildingControlsProps) {
  const updateConfig = (key: keyof BuildingConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    
    // Keep legacy properties in sync
    if (key === 'majorAxis') {
      newConfig.width = value;
    } else if (key === 'minorAxis') {
      newConfig.depth = value;
    } else if (key === 'facadeColor') {
      newConfig.color = value;
    }
    
    onChange(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* Elliptical Floor Plan */}
      <div className="space-y-4">
        <h4 className="font-medium">Elliptical Floor Plan</h4>
        
        <div className="space-y-2">
          <Label>Major Axis: {config.majorAxis}m</Label>
          <Slider
            value={[config.majorAxis]}
            onValueChange={([value]) => updateConfig('majorAxis', value)}
            min={10}
            max={60}
            step={2}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Minor Axis: {config.minorAxis}m</Label>
          <Slider
            value={[config.minorAxis]}
            onValueChange={([value]) => updateConfig('minorAxis', value)}
            min={8}
            max={50}
            step={2}
          />
        </div>
      </div>

      <Separator />

      {/* Building Structure */}
      <div className="space-y-4">
        <h4 className="font-medium">Building Structure</h4>
        
        <div className="space-y-2">
          <Label>Total Height: {config.height}m</Label>
          <Slider
            value={[config.height]}
            onValueChange={([value]) => updateConfig('height', value)}
            min={50}
            max={300}
            step={5}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Number of Floors: {config.floors}</Label>
          <Slider
            value={[config.floors]}
            onValueChange={([value]) => updateConfig('floors', value)}
            min={10}
            max={80}
            step={1}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Rotation per Floor: {config.rotationPerFloor}°</Label>
          <Slider
            value={[config.rotationPerFloor]}
            onValueChange={([value]) => updateConfig('rotationPerFloor', value)}
            min={0}
            max={10}
            step={0.5}
          />
        </div>
      </div>

      <Separator />

      {/* Glazed Facade */}
      <div className="space-y-4">
        <h4 className="font-medium">Glazed Facade</h4>
        
        <div className="space-y-2">
          <Label>Facade Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={config.facadeColor}
              onChange={(e) => updateConfig('facadeColor', e.target.value)}
              className="w-12 h-8 p-0 border-0"
            />
            <Input
              type="text"
              value={config.facadeColor}
              onChange={(e) => updateConfig('facadeColor', e.target.value)}
              placeholder="#C0C0C0"
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Glass Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={config.glassColor}
              onChange={(e) => updateConfig('glassColor', e.target.value)}
              className="w-12 h-8 p-0 border-0"
            />
            <Input
              type="text"
              value={config.glassColor}
              onChange={(e) => updateConfig('glassColor', e.target.value)}
              placeholder="#87CEEB"
              className="flex-1"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Glass Opacity: {(config.glassOpacity * 100).toFixed(0)}%</Label>
          <Slider
            value={[config.glassOpacity]}
            onValueChange={([value]) => updateConfig('glassOpacity', value)}
            min={0.1}
            max={1.0}
            step={0.1}
          />
        </div>
      </div>

      <Separator />

      {/* Vertical Louvers */}
      <div className="space-y-4">
        <h4 className="font-medium">Vertical Louvers</h4>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="enable-louvers"
            checked={config.enableLouvers}
            onCheckedChange={(enabled) => updateConfig('enableLouvers', enabled)}
          />
          <Label htmlFor="enable-louvers">Enable Louvers</Label>
        </div>
        
        {config.enableLouvers && (
          <>
            <div className="space-y-2">
              <Label>Louver Spacing: {config.louverSpacing}</Label>
              <Slider
                value={[config.louverSpacing]}
                onValueChange={([value]) => updateConfig('louverSpacing', value)}
                min={1}
                max={8}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Louver Depth: {config.louverDepth}m</Label>
              <Slider
                value={[config.louverDepth]}
                onValueChange={([value]) => updateConfig('louverDepth', value)}
                min={0.2}
                max={2.0}
                step={0.1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Louver Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.louverColor}
                  onChange={(e) => updateConfig('louverColor', e.target.value)}
                  className="w-12 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={config.louverColor}
                  onChange={(e) => updateConfig('louverColor', e.target.value)}
                  placeholder="#A0A0A0"
                  className="flex-1"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Separator />

      {/* Advanced Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Advanced Settings</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <Label className="text-xs">Floor Height</Label>
            <p>{(config.height / config.floors).toFixed(1)}m</p>
          </div>
          <div>
            <Label className="text-xs">Total Rotation</Label>
            <p>{(config.rotationPerFloor * config.floors).toFixed(1)}°</p>
          </div>
          <div>
            <Label className="text-xs">Floor Area</Label>
            <p>{(Math.PI * (config.majorAxis/2) * (config.minorAxis/2)).toFixed(0)}m²</p>
          </div>
          <div>
            <Label className="text-xs">Aspect Ratio</Label>
            <p>{(config.majorAxis / config.minorAxis).toFixed(2)}:1</p>
          </div>
        </div>
      </div>
    </div>
  );
}