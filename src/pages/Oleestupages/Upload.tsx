
import React, { useState, useEffect, useRef } from "react";
import api from "../../api";

// -----------------------------
// Types
// -----------------------------
type User = {
  user_id: number;
  first_name: string;
  last_name: string | null;
};

type Category = {
  category_id: number;
  category_name: string;
};

type Currency = {
  currency_id: number;
  currency_name: string;
};

export default function UploadPage() {
  // -----------------------------
  // Form State
  // -----------------------------
  const [ownerId, setOwnerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [currencyId, setCurrencyId] = useState("");
  const [price, setPrice] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");

  const [thumbnailMode, setThumbnailMode] = useState<"auto" | "manual">("auto");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [progress, setProgress] = useState(0);
  const CHUNK_SIZE = 5 * 1024 * 1024;
  const videoUrlRef = useRef("");

  // store all created blob URLs so we can revoke on unmount (safe mode)
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // -----------------------------
  // Thumbnail Editor (Modal) State
  // -----------------------------
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorDuration, setEditorDuration] = useState<number>(0);
  const [editorCurrentTime, setEditorCurrentTime] = useState<number>(0);
  const [suggestedThumbnails, setSuggestedThumbnails] = useState<
    { time: number; preview: string; file?: File }[]
  >([]);
  const [compression, setCompression] = useState<"high" | "medium" | "low">(
    "medium"
  );
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const scrubCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrubTimeoutRef = useRef<number | null>(null);

  // -----------------------------
  // Load Users, Categories, Currency
  // -----------------------------
  useEffect(() => {
    async function loadAll() {
      try {
        const resUsers = await api.get("/api/accounts/all");
        setUsers(resUsers.data.data);
 
        const resCategories = await api.get("/api/categories/all");
        setCategories(resCategories.data.data);

        const resCurrencies = await api.get("/api/currencies/all");
        setCurrencies(resCurrencies.data.data);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    }

    loadAll();
  }, []);

  // -----------------------------
  // Utility: compression quality map
  // -----------------------------
  const compressionQuality = (level: "high" | "medium" | "low") =>
    level === "high" ? 0.9 : level === "medium" ? 0.7 : 0.5;

  // -----------------------------
  // Robust extractor (used by submit fallback)
  // -----------------------------
  const extractFrameFromVideo = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");

      video.src = url;
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.muted = true;
      video.load();

      const cleanup = () => {
        try {
          video.src = "";
          URL.revokeObjectURL(url);
        } catch {}
      };

      video.addEventListener("loadedmetadata", () => {
        if (!video.duration || video.duration === Infinity) {
          cleanup();
          return reject("Invalid video metadata");
        }
      });

      video.addEventListener("canplay", () => {
        // capture at 1s or near end
        video.currentTime = Math.min(1, Math.max(0, video.duration - 0.1));
      });

      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            cleanup();
            return reject("Canvas error");
          }

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                cleanup();
                return reject("Thumbnail blob failed");
              }

              const fileThumb = new File([blob], "thumbnail.jpg", {
                type: "image/jpeg",
              });

              cleanup();
              resolve(fileThumb);
            },
            "image/jpeg",
            compressionQuality(compression)
          );
        } catch (err) {
          cleanup();
          reject("Thumbnail generation failed");
        }
      });

      video.onerror = () => {
        cleanup();
        reject("Video failed to load");
      };
    });
  };

  // -----------------------------
  // Capture a frame from a file at a specific time (independent)
  // -----------------------------
  const captureFrameAtTime = (
    file: File,
    timeSec: number,
    quality: number
  ): Promise<{ file: File; preview: string }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");

      let cleaned = false;
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        try {
          video.src = "";
          URL.revokeObjectURL(url);
        } catch {}
      };

      video.src = url;
      video.crossOrigin = "anonymous";
      video.preload = "metadata";
      video.muted = true;
      video.load();

      const onError = () => {
        cleanup();
        reject("Failed to load video for capture");
      };

      video.addEventListener("loadedmetadata", () => {
        if (!video.duration || video.duration === Infinity) {
          onError();
          return;
        }
        // clamp time
        const t = Math.min(Math.max(0, timeSec), video.duration - 0.05);
        video.currentTime = t;
      });

      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            cleanup();
            return reject("Canvas unsupported");
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                cleanup();
                return reject("Blob creation failed");
              }
              const fileThumb = new File([blob], `thumb-${Math.round(timeSec)}.jpg`, {
                type: "image/jpeg",
              });
              const preview = URL.createObjectURL(fileThumb);
              // record preview so we don't revoke it prematurely
              blobUrlsRef.current.add(preview);
              cleanup();
              resolve({ file: fileThumb, preview });
            },
            "image/jpeg",
            quality
          );
        } catch (err) {
          cleanup();
          reject(err);
        }
      });

      video.onerror = onError;
    });
  };

  // -----------------------------
  // Upload Thumbnail
  // -----------------------------
  const uploadThumbnail = async (file: File) => {
    const form = new FormData();
    form.append("thumbnail", file);
    const res = await api.post("/api/upload/upload-thumbnail", form);
    return res.data.data.filePath;
  };

  // -----------------------------
  // Chunk Upload
  // -----------------------------
  const uploadVideoInChunks = async (file: File) => {
    const uploadId = Date.now().toString();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    let uploaded = 0;

    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);

      const form = new FormData();
      form.append("chunk", chunk);
      form.append("uploadId", uploadId);
      form.append("chunkNumber", String(i));

      await api.post("/api/upload/upload-chunk", form);

      uploaded++;
      setProgress(Math.round((uploaded / totalChunks) * 100));
    }

    const merge = await api.post("/api/upload/merge-chunks", {
      uploadId,
      totalChunks,
      originalName: file.name,
    });

    return merge.data.data.filePath;
  };

  // -----------------------------
  // Submit Upload
  // -----------------------------
  const submit = async (e: any) => {
    e.preventDefault();

    if (!ownerId || !title || !description || !categoryId || !currencyId || !videoFile) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      // 1. Upload Video
      const videoUrl = await uploadVideoInChunks(videoFile);

      // 2. Auto or Manual Thumbnail
      let thumbnailUrl = "";

      if (thumbnailMode === "auto") {
        // prefer the user-picked thumbnail from editor if available
        if (thumbnailFile) {
          thumbnailUrl = await uploadThumbnail(thumbnailFile);
        } else {
          const autoThumb = await extractFrameFromVideo(videoFile);
          thumbnailUrl = await uploadThumbnail(autoThumb);
        }
      } else if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile);
      }

      // 3. Final Save
      await api.post("/api/videos/add", {
        owner_id: Number(ownerId),
        title,
        description,
        category: Number(categoryId),
        price,
        currency_id: Number(currencyId),
        url: videoUrl,
        thumbnail: thumbnailUrl,
      });

      alert("Video uploaded successfully!");

      // Reset
      setProgress(0);
      setTitle("");
      setDescription("");
      setCategoryId("");
      setCurrencyId("");
      setPrice(0);
      setVideoFile(null);
      setVideoPreview("");
      setThumbnailFile(null);
      setThumbnailPreview("");
      setSuggestedThumbnails([]);
      setIsEditorOpen(false);
      setEditorDuration(0);
      setEditorCurrentTime(0);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed.");
    }
  };

  // -----------------------------
  // Thumbnail Editor Helpers
  // -----------------------------
  const openEditor = (autoOpen = false) => {
    if (!videoFile) return;
    setIsEditorOpen(true);

    // ensure modal video has the updated src; metadata listener will set duration
    requestAnimationFrame(() => {
      const v = modalVideoRef.current;
      if (!v) return;
      v.pause();
      v.currentTime = 0;
      // setting src via preview URL already done in file input handler
    });

    // if autoOpen, generate suggested thumbnails after metadata loads via event
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    // do NOT revoke previews here (safe mode)
  };

  const generateSuggestedThumbnails = async () => {
    if (!videoFile) return;
    try {
      const v = modalVideoRef.current;
      const duration = v?.duration || editorDuration || 0;
      if (!duration) return;

      const percents = [0.1, 0.3, 0.6];
      const quality = compressionQuality(compression);

      const suggestions: { time: number; preview: string; file?: File }[] = [];

      for (const p of percents) {
        const t = Math.min(Math.max(0, duration * p), duration - 0.05);
        try {
          const captured = await captureFrameAtTime(videoFile, t, quality);
          suggestions.push({ time: t, preview: captured.preview, file: captured.file });
        } catch (err) {
          console.error("suggestion capture failed", err);
        }
      }

      setSuggestedThumbnails(suggestions);
    } catch (err) {
      console.error("generate suggestions failed", err);
    }
  };

  const handleModalVideoLoaded = () => {
    const v = modalVideoRef.current;
    if (!v) return;
    const dur = v.duration || 0;
    setEditorDuration(dur);
    setEditorCurrentTime(0);

    // Auto-generate suggestions when the editor opens and mode is auto
    if (thumbnailMode === "auto") {
      generateSuggestedThumbnails();
    }
  };

  // scrub: when slider changes, set video.currentTime and draw frame to a canvas for live preview
  const handleScrubTimeChange = (t: number) => {
    setEditorCurrentTime(t);
    const v = modalVideoRef.current;
    if (!v) return;

    // throttle frequent seeks when user drags
    if (scrubTimeoutRef.current) {
      window.clearTimeout(scrubTimeoutRef.current);
    }
    // schedule seek (small debounce to avoid over-seeking)
    scrubTimeoutRef.current = window.setTimeout(() => {
      v.currentTime = t;
    }, 40);
  };

  const handleModalVideoSeeked = async () => {
    const v = modalVideoRef.current;
    const c = scrubCanvasRef.current;
    if (!v || !c) return;
    try {
      c.width = v.videoWidth || 640;
      c.height = v.videoHeight || 360;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(v, 0, 0, c.width, c.height);

      // show a preview (data URL)
      const dataUrl = c.toDataURL("image/jpeg", compressionQuality(compression));
      setThumbnailPreview(dataUrl);
    } catch (err) {
      console.error("scrub draw failed", err);
    }
  };

  const handleCaptureFromEditor = async () => {
    if (!videoFile) return;
    try {
      const quality = compressionQuality(compression);
      const captured = await captureFrameAtTime(videoFile, editorCurrentTime, quality);
      // set selected thumbnail (we got a File and a preview blob URL)
      setThumbnailFile(captured.file);
      setThumbnailPreview(captured.preview);
      // keep modal open
    } catch (err) {
      console.error("capture failed", err);
      alert("Capture failed.");
    }
  };

  const handleSelectSuggested = async (item: { time: number; preview: string; file?: File }) => {
    if (item.file) {
      setThumbnailFile(item.file);
      setThumbnailPreview(item.preview);
    } else if (item.preview) {
      // if only preview exists (unlikely), attempt to fetch it and convert to File
      try {
        const res = await fetch(item.preview);
        const blob = await res.blob();
        const f = new File([blob], `thumb-${Math.round(item.time)}.jpg`, { type: blob.type || "image/jpeg" });
        // record preview's URL if needed
        setThumbnailFile(f);
        const p = URL.createObjectURL(f);
        blobUrlsRef.current.add(p);
        setThumbnailPreview(p);
      } catch (err) {
        console.error("select suggested conversion failed", err);
        setThumbnailPreview(item.preview);
        setThumbnailFile(null);
      }
    }
    // keep modal open so user can confirm or change
  };

  // -----------------------------
  // VIDEO INPUT handler (we add auto-open + auto thumbnail trigger)
  // -----------------------------
  const onVideoFileSelected = async (f: File | null) => {
    if (!f) return;
    setVideoFile(f);
    const url = URL.createObjectURL(f);
    // record this blob URL
    blobUrlsRef.current.add(url);
    setVideoPreview(url);
    videoUrlRef.current = url;

    // If auto mode chosen (behavior 3), open editor automatically AND start suggestions
    if (thumbnailMode === "auto") {
      // open editor, editor's onLoadedMetadata will generate suggestions
      setTimeout(() => openEditor(true), 50);
    }
  };

  // Cleanup object URLs when component unmounts (safe mode: revoke only on unmount)
  useEffect(() => {
    return () => {
      try {
        blobUrlsRef.current.forEach((u) => {
          try {
            URL.revokeObjectURL(u);
          } catch {}
        });
        blobUrlsRef.current.clear();
      } catch {}
    };
  }, []);

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Upload Video</h1>

      <form onSubmit={submit} className="space-y-4">
        {/* OWNER */}
        <select className="border p-2 w-full" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
          <option value="">Select Owner</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.first_name} {u.last_name}
            </option>
          ))}
        </select>

        {/* TITLE */}
        <input
          className="border p-2 w-full"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* DESCRIPTION */}
        <textarea
          className="border p-2 w-full"
          placeholder="Video Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* VIDEO FILE */}
        <input
          type="file"
          accept="video/*"
          onChange={async (e) => {
            const f = e.target.files?.[0] ?? null;
            onVideoFileSelected(f);
          }}
        />

        {videoPreview && <video src={videoPreview} controls className="w-full rounded" />}

        {/* Button to open thumbnail editor manually (behavior 3 requires reopenability) */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex gap-4 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={thumbnailMode === "auto"}
                onChange={() => setThumbnailMode("auto")}
              />
              Auto Thumbnail
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={thumbnailMode === "manual"}
                onChange={() => setThumbnailMode("manual")}
              />
              Manual Upload
            </label>
          </div>

          <button
            type="button"
            onClick={() => openEditor(false)}
            className="ml-auto bg-gray-200 text-sm px-3 py-1 rounded"
          >
            Open Thumbnail Editor
          </button>
        </div>

        {thumbnailMode === "manual" && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const p = URL.createObjectURL(f);
              blobUrlsRef.current.add(p);
              setThumbnailFile(f);
              setThumbnailPreview(p);
            }}
          />
        )}

        {thumbnailPreview && (
          // if preview is a blob URL or data URL, render it
          <img src={thumbnailPreview} className="w-40 rounded border mt-2" alt="thumbnail preview" />
        )}

        {/* CATEGORY */}
        <select className="border p-2 w-full" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.category_name}
            </option>
          ))}
        </select>

        {/* PRICE + CURRENCY */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            className="border p-2"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <select className="border p-2" value={currencyId} onChange={(e) => setCurrencyId(e.target.value)}>
            <option value="">Select Currency</option>
            {currencies.map((c) => (
              <option key={c.currency_id} value={c.currency_id}>
                {c.currency_name}
              </option>
            ))}
          </select>
        </div>

        {/* PROGRESS BAR */}
        {progress > 0 && (
          <div className="w-full bg-gray-300 h-3 rounded">
            <div className="bg-blue-600 h-3 rounded" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* SUBMIT */}
        <button className="bg-blue-600 text-white p-2 rounded w-full">
          Upload {progress > 0 ? `${progress}%` : ""}
        </button>
      </form>

      {/* -----------------------------
          Thumbnail Editor Modal (Tailwind custom)
         ----------------------------- */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => closeEditor()}
          />

          {/* modal panel */}
          <div className="relative max-w-3xl w-full bg-white rounded-lg shadow-lg overflow-hidden z-10">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Thumbnail Editor</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm">Compression</label>
                <select
                  value={compression}
                  onChange={(e) => setCompression(e.target.value as any)}
                  className="border p-1 rounded text-sm"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <button
                  onClick={() => closeEditor()}
                  className="ml-3 text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Video + scrub */}
              <div>
                <div className="bg-black rounded overflow-hidden">
                  <video
                    ref={modalVideoRef}
                    src={videoPreview}
                    controls
                    className="w-full"
                    onLoadedMetadata={handleModalVideoLoaded}
                    onSeeked={handleModalVideoSeeked}
                  />
                </div>

                <div className="mt-3">
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, editorDuration)}
                    value={editorCurrentTime}
                    step={0.05}
                    onChange={(e) => handleScrubTimeChange(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{(editorCurrentTime || 0).toFixed(2)}s</span>
                    <span>{editorDuration ? editorDuration.toFixed(2) + "s" : "0.00s"}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={handleCaptureFromEditor}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Capture Frame
                  </button>

                  <button
                    type="button"
                    onClick={() => generateSuggestedThumbnails()}
                    className="bg-gray-200 px-3 py-1 rounded text-sm"
                  >
                    Auto-generate 3 suggestions
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // download preview currently shown (if thumbnailPreview is data URL)
                      if (!thumbnailPreview) return;
                      const a = document.createElement("a");
                      a.href = thumbnailPreview;
                      a.download = "preview-thumbnail.jpg";
                      a.click();
                    }}
                    className="ml-auto bg-gray-100 px-3 py-1 rounded text-sm"
                  >
                    Download Preview
                  </button>
                </div>

                {/* hidden canvas for scrubbing preview */}
                <canvas ref={scrubCanvasRef} style={{ display: "none" }} />
              </div>

              {/* Right: Preview, suggestions, chosen thumbnail */}
              <div>
                <div className="border rounded p-3">
                  <h3 className="font-medium mb-2">Live Preview</h3>
                  <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    {thumbnailPreview ? (
                      // data URL or object URL
                      <img src={thumbnailPreview} alt="preview" className="max-h-full" />
                    ) : (
                      <div className="text-sm text-gray-500">Move the slider or capture a frame</div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Suggested Thumbnails</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {suggestedThumbnails.length === 0 && (
                        <div className="text-sm text-gray-500 col-span-3">No suggestions yet</div>
                      )}
                      {suggestedThumbnails.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSuggested(s)}
                          className="border rounded overflow-hidden focus:outline-none"
                          title={`Time: ${s.time.toFixed(2)}s`}
                        >
                          <img src={s.preview} alt={`suggest-${idx}`} className="w-full h-20 object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Selected Thumbnail</h4>
                    <div className="flex items-center gap-3">
                      {thumbnailPreview ? (
                        <img src={thumbnailPreview} alt="selected" className="w-24 h-24 object-cover rounded border" />
                      ) : (
                        <div className="w-24 h-24 bg-gray-50 rounded border flex items-center justify-center text-sm text-gray-400">
                          none
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            // keep thumbnail as chosen (do nothing)
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Use Selected
                        </button>

                        <button
                          onClick={() => {
                            // clear selection
                            setThumbnailFile(null);
                            setThumbnailPreview("");
                          }}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-gray-600">
                    Tip: drag the timeline to choose an exact frame. Use compression to reduce
                    thumbnail size before upload.
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 p-3 border-t">
              <button
                onClick={() => {
                  // If user has a thumbnailPreview that is a data URL (from canvas) but not a File,
                  // attempt to convert it to a File so it will upload
                  if (thumbnailPreview && !thumbnailFile) {
                    // thumbnailPreview might be data URL from canvas.toDataURL or blob URL from captureFrameAtTime
                    // If it's a data URL we convert it to a File; if it's a blob URL, try fetch it.
                    (async () => {
                      try {
                        if (thumbnailPreview.startsWith("data:")) {
                          // data url -> blob
                          const res = await fetch(thumbnailPreview);
                          const blob = await res.blob();
                          const f = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
                          setThumbnailFile(f);
                          // create and record object URL for consistency
                          const p = URL.createObjectURL(f);
                          blobUrlsRef.current.add(p);
                          setThumbnailPreview(p);
                        } else if (thumbnailPreview.startsWith("blob:")) {
                          // try fetch blob url
                          const res = await fetch(thumbnailPreview);
                          const blob = await res.blob();
                          const f = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
                          setThumbnailFile(f);
                        }
                      } catch (err) {
                        console.error("convert preview to file failed", err);
                      }
                    })();
                  }
                  // close editor
                  closeEditor();
                }}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Save & Close
              </button>

              <button
                onClick={() => {
                  // choose to keep editing
                }}
                className="bg-gray-100 px-3 py-1 rounded"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
