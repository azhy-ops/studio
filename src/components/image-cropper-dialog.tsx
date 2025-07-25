
"use client";

import { useState, useCallback } from 'react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Loader2 } from 'lucide-react';
import getCroppedImg from '@/lib/crop-image';

interface ImageCropperDialogProps {
  src: string | null;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

export function ImageCropperDialog({ src, onCropComplete, onClose, isProcessing = false }: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropPixelsComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (croppedAreaPixels && src) {
      try {
        const croppedImage = await getCroppedImg(src, croppedAreaPixels);
        onCropComplete(croppedImage);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Dialog open={!!src} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Drag the box to select the stats bar. Use the slider to zoom. Adjust the selection to focus only on the weapon's stats area for best results.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-[60vh] overflow-hidden bg-muted">
            {src && (
                 <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropPixelsComplete}
                />
            )}
        </div>
         <div className="p-4 space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="w-full"
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleCrop} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Analyzing...' : 'Crop & Analyze'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
