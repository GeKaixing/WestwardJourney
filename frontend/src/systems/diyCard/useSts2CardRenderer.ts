import { useCallback, useEffect, useRef, useState } from "react";
import type { DiyCardFormState, RenderOptions, Sts2Manifest } from "./types";
import { MANIFEST_URL } from "./constants";
import { loadFonts, loadImage } from "./imageCache";
import { renderSts2Card } from "./renderSts2Card";

export function useSts2CardRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderToken = useRef(0);
  const [manifest, setManifest] = useState<Sts2Manifest | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(MANIFEST_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Sts2Manifest | null) => {
        if (active && data) setManifest(data);
      })
      .catch(() => {
        if (active) setManifest(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!manifest) return;
    let active = true;

    (async () => {
      try {
        const bold = manifest.fonts?.bold ?? "/diy-card-assets/fonts/Kreon-Bold.ttf";
        const regular = manifest.fonts?.regular ?? "/diy-card-assets/fonts/Kreon-Regular.ttf";
        await loadFonts(bold, regular);
        if (active) setFontsReady(true);
      } catch {
        if (active) setFontsReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [manifest]);

  useEffect(() => {
    if (!manifest?.atlases.length) return;
    let active = true;
    let loaded = 0;
    const total = manifest.atlases.length + (manifest.typePlaque ? 1 : 0);

    const markLoaded = () => {
      loaded += 1;
      if (active && loaded >= total) setAssetsReady(true);
    };

    for (const url of manifest.atlases) {
      loadImage(url).then(markLoaded).catch(markLoaded);
    }
    if (manifest.typePlaque) {
      loadImage(manifest.typePlaque).then(markLoaded).catch(markLoaded);
    } else {
      markLoaded();
    }

    return () => {
      active = false;
    };
  }, [manifest]);

  const render = useCallback(
    async (form: DiyCardFormState, artworkUrl: string | null, options: RenderOptions = {}) => {
      const canvas = canvasRef.current;
      if (!canvas || !manifest || !assetsReady) return;

      const token = ++renderToken.current;
      setIsRendering(true);
      try {
        await renderSts2Card(canvas, manifest, form, artworkUrl, options);
      } finally {
        if (token === renderToken.current) setIsRendering(false);
      }
    },
    [manifest, assetsReady],
  );

  const download = useCallback((filename: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    exportCanvas.getContext("2d")?.drawImage(canvas, 0, 0);

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, []);

  return {
    canvasRef,
    manifest,
    assetsReady: assetsReady && !!manifest,
    fontsReady,
    isRendering,
    render,
    download,
  };
}
