import React, { useState } from 'react';
import { ApiConfig } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, Wand2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface ScreenshotManagerProps {
  apiConfigs: ApiConfig[];
}

export function ScreenshotManager({ apiConfigs }: ScreenshotManagerProps) {
  const [selectedApiId, setSelectedApiId] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');

  const enabledApis = apiConfigs.filter(api => api.enabled);
  const selectedApi = apiConfigs.find(api => api.id === selectedApiId);

  const handleProcessImage = async () => {
    if (!selectedApi || !prompt.trim()) return;

    setIsProcessing(true);
    setResult('');

    try {
      // Mock API call - in a real implementation, this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate API response
      setResult(`Image processed successfully using ${selectedApi.name}!\nPrompt: "${prompt}"\nResult: Enhanced building visualization with improved lighting and materials.`);
    } catch (error) {
      setResult(`Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (enabledApis.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No API configurations available. Configure APIs in the API Manager tab to process screenshots.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Process Screenshots</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-select">Select API</Label>
          <Select value={selectedApiId} onValueChange={setSelectedApiId}>
            <SelectTrigger id="api-select">
              <SelectValue placeholder="Choose an API..." />
            </SelectTrigger>
            <SelectContent>
              {enabledApis.map(api => (
                <SelectItem key={api.id} value={api.id}>
                  {api.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">Enhancement Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'Add realistic lighting and materials', 'Convert to photorealistic style', 'Apply sunset lighting'"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleProcessImage}
          disabled={!selectedApiId || !prompt.trim() || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Process Next Screenshot
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <Label>Result</Label>
            <div className="p-3 bg-muted rounded-md text-sm">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>Screenshots will be automatically processed when taken if an API is selected here.</p>
        </div>
      </CardContent>
    </Card>
  );
}