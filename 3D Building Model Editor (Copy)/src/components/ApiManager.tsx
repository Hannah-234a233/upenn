import React, { useState } from 'react';
import { ApiConfig } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Edit, Trash2, Settings, Globe, Key, TestTube } from 'lucide-react';
import { Separator } from './ui/separator';

interface ApiManagerProps {
  configs: ApiConfig[];
  onUpdateConfigs: (configs: ApiConfig[]) => void;
}

export function ApiManager({ configs, onUpdateConfigs }: ApiManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ApiConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ApiConfig>>({
    name: '',
    endpoint: '',
    apiKey: '',
    headers: {},
    enabled: true
  });

  const handleSaveConfig = () => {
    if (!formData.name || !formData.endpoint) return;

    const newConfig: ApiConfig = {
      id: editingConfig?.id || Date.now().toString(),
      name: formData.name,
      endpoint: formData.endpoint,
      apiKey: formData.apiKey || '',
      headers: formData.headers || {},
      enabled: formData.enabled ?? true
    };

    let updatedConfigs;
    if (editingConfig) {
      updatedConfigs = configs.map(config => 
        config.id === editingConfig.id ? newConfig : config
      );
    } else {
      updatedConfigs = [...configs, newConfig];
    }

    onUpdateConfigs(updatedConfigs);
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingConfig(null);
    setFormData({
      name: '',
      endpoint: '',
      apiKey: '',
      headers: {},
      enabled: true
    });
  };

  const handleEditConfig = (config: ApiConfig) => {
    setEditingConfig(config);
    setFormData({ ...config });
    setIsAddDialogOpen(true);
  };

  const handleDeleteConfig = (id: string) => {
    onUpdateConfigs(configs.filter(config => config.id !== id));
  };

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    onUpdateConfigs(configs.map(config =>
      config.id === id ? { ...config, enabled } : config
    ));
  };

  const handleTestApi = async (config: ApiConfig) => {
    console.log(`Testing API: ${config.name}`);
    // Implement API test logic here
  };

  const parseHeaders = (headersStr: string): Record<string, string> => {
    try {
      return JSON.parse(headersStr);
    } catch {
      return {};
    }
  };

  const stringifyHeaders = (headers: Record<string, string>): string => {
    return JSON.stringify(headers, null, 2);
  };

  const presets = [
    {
      name: 'OpenAI DALL-E',
      endpoint: 'https://api.openai.com/v1/images/generations',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Stability AI',
      endpoint: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Midjourney (via API)',
      endpoint: 'https://api.midjourney.com/v1/imagine',
      headers: { 'Content-Type': 'application/json' }
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2>API Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Configure external APIs for image processing and enhancement
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add API
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? 'Edit API Configuration' : 'Add API Configuration'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-name">API Name</Label>
                    <Input
                      id="api-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., OpenAI DALL-E"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-enabled">Enabled</Label>
                    <div className="pt-2">
                      <Switch
                        id="api-enabled"
                        checked={formData.enabled}
                        onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint URL</Label>
                  <Input
                    id="api-endpoint"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="https://api.example.com/v1/generate"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Your API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-headers">Custom Headers (JSON)</Label>
                  <Textarea
                    id="api-headers"
                    value={stringifyHeaders(formData.headers || {})}
                    onChange={(e) => setFormData({ ...formData, headers: parseHeaders(e.target.value) })}
                    placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Quick Setup Presets</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {presets.map((preset, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({
                          ...formData,
                          name: preset.name,
                          endpoint: preset.endpoint,
                          headers: preset.headers
                        })}
                        className="justify-start"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveConfig}>
                    {editingConfig ? 'Update' : 'Add'} API
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No APIs Configured</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Add API configurations to process and enhance your building screenshots
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First API
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {configs.map((config) => (
              <Card key={config.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-base">{config.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.enabled ? 'default' : 'secondary'}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                        {config.apiKey && (
                          <Badge variant="outline" className="text-xs">
                            <Key className="w-3 h-3 mr-1" />
                            API Key Set
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch
                        checked={config.enabled}
                        onCheckedChange={(enabled) => handleToggleEnabled(config.id, enabled)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Endpoint</Label>
                      <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {config.endpoint}
                      </p>
                    </div>
                    
                    {Object.keys(config.headers).length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Headers</Label>
                        <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {Object.entries(config.headers).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="text-muted-foreground">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestApi(config)}
                        disabled={!config.enabled}
                      >
                        <TestTube className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditConfig(config)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteConfig(config.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}