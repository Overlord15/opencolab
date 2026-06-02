import React, { useRef, useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { supabase, SUPABASE_ACTIVE } from "../supabase";
import { 
  Palette, 
  Trash2, 
  Download, 
  Save, 
  Sparkles, 
  Wifi, 
  Eraser, 
  Feather 
} from "lucide-react";

interface PathPoint {
  x: number;
  y: number;
}

interface Stroke {
  points: PathPoint[];
  color: string;
  width: number;
}

export default function WhiteboardPage() {
  const { profile } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  
  const [color, setColor] = useState("#2563eb"); // blue-600 default
  const [lineWidth, setLineWidth] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<PathPoint[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "online">("online");

  useEffect(() => {
    if (!profile?.orgCode) return;

    const fetchWhiteboard = async () => {
      const { data } = await supabase.from("whiteboards").select("*").eq("id", profile.orgCode).maybeSingle();
      if (data && data.strokes) {
        setStrokes(data.strokes as Stroke[]);
      }
    };
    
    fetchWhiteboard();

    const channel = supabase.channel(`public:whiteboards:${profile.orgCode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "whiteboards", filter: `id=eq.${profile.orgCode}` }, (payload) => {
        const nextData = payload.new as any;
        if (nextData && nextData.strokes) {
          setStrokes(nextData.strokes as Stroke[]);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.orgCode]);

  useEffect(() => {
    drawAllStrokes();
  }, [strokes]);

  // Adjust canvas size to parent container gracefully
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
         canvas.width = width || 800;
        canvas.height = height || 500;
        drawAllStrokes();
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, [strokes]);

  const drawAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Re-draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.points.length < 1) return;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): PathPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Scale coordinates accurately to canvas view box
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    isDrawingRef.current = true;
    const point: PathPoint = coords;
    setCurrentStroke([point]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    const point: PathPoint = coords;
    setCurrentStroke((prev) => [...prev, point]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (currentStroke.length > 0) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: tool === "eraser" ? "#ffffff" : color,
        width: lineWidth,
      };

      const updatedStrokes = [...strokes, newStroke];
      setStrokes(updatedStrokes);
      setCurrentStroke([]);

      // Sync strokes back to Firestore
      await syncWhiteboardToFirestore(updatedStrokes);
    }
  };

  const syncWhiteboardToFirestore = async (newStrokes: Stroke[]) => {
    if (!profile?.orgCode) return;
    setSyncStatus("syncing");
    try {
      const { error } = await supabase.from("whiteboards").upsert({
        id: profile.orgCode,
        strokes: newStrokes
      });
      if (error) throw error;
      setSyncStatus("online");
    } catch (err) {
      console.error("Failed to sync whiteboard list", err);
      setSyncStatus("idle");
    }
  };

  const handleClearCanvas = async () => {
    if (confirm("Clear drawings on team workspace board?")) {
      setStrokes([]);
      await syncWhiteboardToFirestore([]);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `OpenColab-whiteboard-${profile?.orgCode || "shared"}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="whiteboard-page-view">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-xs font-semibold">Workspace / Creative Workspace</p>
          <span className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            Brainstorm Whiteboard
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded flex items-center gap-1.5 border ${
            syncStatus === "syncing" 
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-250"
          }`}>
            <Wifi className={`h-3 w-3 ${syncStatus === "syncing" ? "animate-pulse" : ""}`} /> 
            {syncStatus === "syncing" ? "Broadcasting..." : "Collaboration Online"}
          </span>
          <button
            id="btn-clear-whiteboard"
            onClick={handleClearCanvas}
            className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded transition-all border border-rose-150 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Clear All
          </button>
          <button
            id="btn-download-whiteboard"
            onClick={handleDownload}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </div>
      </div>

      {/* Drawing Toolbar controls & Canvas space */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Controls block */}
        <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-5 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Drawing Tools</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  id="tool-pen"
                  onClick={() => setTool("pen")}
                  className={`p-2.5 rounded border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    tool === "pen" 
                      ? "bg-blue-600 border-blue-600 text-white shadow" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-105"
                  }`}
                >
                  <Feather className="h-4 w-4" /> Draw Pen
                </button>
                <button
                  id="tool-eraser"
                  onClick={() => setTool("eraser")}
                  className={`p-2.5 rounded border font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    tool === "eraser" 
                      ? "bg-slate-900 border-slate-900 text-white shadow" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-105"
                  }`}
                >
                  <Eraser className="h-4 w-4" /> Eraser
                </button>
              </div>
            </div>

            {/* Ink color palettes selectors */}
            {tool === "pen" && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">Color Palette</span>
                <div className="flex gap-2.5 flex-wrap">
                  {[
                    { hex: "#2563eb", label: "Corporate Blue" },
                    { hex: "#10b981", label: "Emerald" },
                    { hex: "#ef4444", label: "Crimson" },
                    { hex: "#f59e0b", label: "Amber" },
                    { hex: "#0f172a", label: "Charcoal" }
                  ].map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() => setColor(preset.hex)}
                      className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer ${
                        color === preset.hex ? "border-slate-800 scale-110" : "border-white hover:scale-105"
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Brush widths slider */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                Brush Width ({lineWidth}px)
              </span>
              <input
                id="brush-width-slider"
                type="range"
                min={2}
                max={20}
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 border border-dashed border-slate-200 rounded text-[11px] text-slate-400 leading-normal">
            <Sparkles className="h-4 w-4 text-blue-500 mb-2" />
            <span>
              <strong>Agile Collaboration Note:</strong> Any drawing strokes you perform will propagate automatically to your active workspace team in real-time.
            </span>
          </div>
        </div>

        {/* Dynamic Canvas wrapper */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded shadow-sm p-4 h-[500px] flex flex-col relative overflow-hidden group">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="flex-1 rounded cursor-crosshair border border-slate-105"
            style={{ width: "100%", height: "100%", background: "#ffffff" }}
          />
        </div>

      </div>
    </div>
  );
}
