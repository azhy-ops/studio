
"use client";

import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        Cropper: any;
    }
}

interface ImageCropperDialogProps {
  src: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onClose: () => void;
  isProcessing?: boolean;
}

export function ImageCropperDialog({ src, onCropComplete, onClose, isProcessing = false }: ImageCropperDialogProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<any>(null);
  const [isImageReady, setIsImageReady] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const script = document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js"]');
    if (!script) return;

    const handleLoad = () => {
      setIsScriptLoaded(true);
    };
    
    // If script is already loaded via other means
    if (window.Cropper) {
        handleLoad();
        return;
    }

    if ((script as any).readyState) { 
      (script as any).onreadystatechange = () => {
        if ((script as any).readyState === "loaded" || (script as any).readyState === "complete") {
          (script as any).onreadystatechange = null;
          handleLoad();
        }
      };
    } else {
      script.addEventListener('load', handleLoad);
    }

    return () => {
      if (script && (script as any).onreadystatechange) {
        (script as any).onreadystatechange = null;
      }
      script.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !src || !imageRef.current) return;

    const img = imageRef.current;
    
    const initializeCropper = () => {
        if (cropperRef.current) {
            cropperRef.current.destroy();
        }
        const cropperInstance = new window.Cropper(img, {
            aspectRatio: 0,
            viewMode: 1,
            autoCropArea: 0.8,
            dragMode: 'move',
            guides: true,
            background: false,
            responsive: true,
            checkOrientation: false,
        });
        cropperRef.current = cropperInstance;
    };
    
    img.onload = () => {
        setIsImageReady(true);
        initializeCropper();
    };

    img.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'Image Load Error',
            description: 'The selected image could not be loaded. Please try another file.',
        });
        onClose();
    };

    // This triggers the onload or onerror
    img.src = src;
    
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
      if(img) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [src, isScriptLoaded, onClose, toast]);

  const handleCrop = () => {
    if (cropperRef.current) {
      const croppedCanvas = cropperRef.current.getCroppedCanvas({
        minWidth: 256,
        minHeight: 256,
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      if (croppedCanvas) {
        const dataUrl = croppedCanvas.toDataURL('image/png');
        onCropComplete(dataUrl);
      }
    }
  };
  
  const showLoader = isProcessing || !isImageReady || !isScriptLoaded;

  return (
    <Dialog open={!!src} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <DialogDescription>
            Drag the box to select the stats bar. Adjust the selection to focus only on the weapon's stats area for best results.
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-[60vh] overflow-hidden bg-muted flex items-center justify-center">
            <div className='w-full h-full'>
              <img ref={imageRef} alt="Source for cropping" className={showLoader ? "opacity-0" : "max-w-full max-h-full block"} />
            </div>
           {showLoader && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleCrop} disabled={showLoader}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isProcessing ? 'Analyzing...' : 'Crop & Analyze'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
