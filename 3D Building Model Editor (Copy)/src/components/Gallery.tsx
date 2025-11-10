import React, { useState } from 'react';
import { SavedImage, ApiConfig } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Trash2, Download, Search, Wand2, Calendar, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface GalleryProps {
  images: SavedImage[];
  onDeleteImage: (id: string) => void;
  apiConfigs: ApiConfig[];
}

export function Gallery({ images, onDeleteImage, apiConfigs }: GalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null);

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (image: SavedImage) => {
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = `${image.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessWithApi = (image: SavedImage, apiId: string) => {
    const api = apiConfigs.find(a => a.id === apiId);
    if (api) {
      console.log(`Processing image ${image.id} with API: ${api.name}`);
      // Implement API processing logic here
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const enabledApis = apiConfigs.filter(api => api.enabled);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <h2>Screenshot Gallery</h2>
          <Badge variant="secondary">{images.length} images</Badge>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No screenshots yet</p>
            <p className="text-sm">Take screenshots in the Editor to see them here</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((image) => (
              <Card key={image.id} className="group">
                <CardHeader className="pb-2">
                  <div className="aspect-video relative overflow-hidden rounded-md border bg-muted">
                    <img
                      src={image.dataUrl}
                      alt={image.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm truncate">{image.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(image.timestamp)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {image.buildingConfig.floors} floors
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {image.buildingConfig.height}m tall
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {image.buildingConfig.majorAxis}×{image.buildingConfig.minorAxis}m
                      </Badge>
                      {image.buildingConfig.enableLouvers && (
                        <Badge variant="outline" className="text-xs">
                          Louvers
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedImage(image)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{image.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="aspect-video relative overflow-hidden rounded-md border">
                              <img
                                src={image.dataUrl}
                                alt={image.name}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Building Configuration</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Ellipse: {image.buildingConfig.majorAxis}×{image.buildingConfig.minorAxis}m</p>
                                  <p>Height: {image.buildingConfig.height}m</p>
                                  <p>Floors: {image.buildingConfig.floors}</p>
                                  <p>Rotation: {image.buildingConfig.rotationPerFloor}° per floor</p>
                                  <p>Glass Opacity: {(image.buildingConfig.glassOpacity * 100).toFixed(0)}%</p>
                                  {image.buildingConfig.enableLouvers && (
                                    <p>Louvers: {image.buildingConfig.louverSpacing}m spacing, {image.buildingConfig.louverDepth}m depth</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Camera Position</h4>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                  <p>Position: [{image.cameraPosition.map(n => n.toFixed(1)).join(', ')}]</p>
                                  <p>Target: [{image.cameraTarget.map(n => n.toFixed(1)).join(', ')}]</p>
                                  <p>Captured: {formatDate(image.timestamp)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(image)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>

                      {enabledApis.length > 0 && (
                        <Select onValueChange={(apiId) => handleProcessWithApi(image, apiId)}>
                          <SelectTrigger className="w-auto h-8">
                            <Wand2 className="w-3 h-3" />
                          </SelectTrigger>
                          <SelectContent>
                            {enabledApis.map(api => (
                              <SelectItem key={api.id} value={api.id}>
                                {api.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteImage(image.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}