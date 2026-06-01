import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api";

type User = {
  user_id: number;
  first_name: string;
  last_name: string | null;
};

type Category = {
  category_id: number;
  category_name: string;
};

type VideoListItem = {
  id?: number;
  video_id?: number;
  title?: string;
  description?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  video_url?: string;
  video_file_url?: string;
  views?: number;
  duration?: string;
  likes?: number;
  dislikes?: number;
  price?: string | number;
  category?: number | string;
  owner?: string;
  video_type?: string;
  status?: number;
};

type UploadedVideoPreview = {
  video_id?: number;
  video_url?: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  price?: string | number;
  is_premium?: string | number;
  category?: string | number;
  owner?: string;
  duration?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  status?: number;
};

type ThumbSuggestion = {
  time: number;
  preview: string;
  file?: File;
};

type UploadStep = "details" | "elements" | "checks" | "visibility";

type VideoFxState = {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: number;
  sepia: number;
  rotate: number;
  zoom: number;
  playbackRate: number;
  volume: number;
  muted: boolean;
  trimStart: number;
  trimEnd: number;
};

type ThumbnailFxState = {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: number;
  sepia: number;
  zoom: number;
};

const defaultVideoFx: VideoFxState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  rotate: 0,
  zoom: 1,
  playbackRate: 1,
  volume: 1,
  muted: false,
  trimStart: 0,
  trimEnd: 0,
};

const defaultThumbnailFx: ThumbnailFxState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  zoom: 1,
};

const toMediaUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("blob:")) return path;
  if (path.startsWith("data:")) return path;
  if (path.startsWith("http://")) return path.replace("http://", "https://");
  if (path.startsWith("https://")) return path;
  return `${api.defaults.baseURL}${path.startsWith("/") ? path : `/${path}`}`;
};

export default function UploadPage() {
  const [ownerId, setOwnerId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("500");
  const [isPremium, setIsPremium] = useState("1");

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideoPreview | null>(null);
  const [showPreviewCard, setShowPreviewCard] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [isThumbEditorOpen, setIsThumbEditorOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);

  const [editorDuration, setEditorDuration] = useState(0);
  const [editorCurrentTime, setEditorCurrentTime] = useState(0);
  const [suggestedThumbnails, setSuggestedThumbnails] = useState<ThumbSuggestion[]>([]);
  const [compression, setCompression] = useState<"high" | "medium" | "low">("medium");

  const [editorThumbnailPreview, setEditorThumbnailPreview] = useState("");
  const [editorThumbnailFile, setEditorThumbnailFile] = useState<File | null>(null);

  const [currentStep, setCurrentStep] = useState<UploadStep>("details");
  const [visibility, setVisibility] = useState<"private" | "public" | "unlisted">("private");

  const [videoFx, setVideoFx] = useState<VideoFxState>(defaultVideoFx);
  const [thumbnailFx, setThumbnailFx] = useState<ThumbnailFxState>(defaultThumbnailFx);

  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const editRoomVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const scrubCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrubTimeoutRef = useRef<number | null>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  const steps: UploadStep[] = ["details", "elements", "checks", "visibility"];
  const stepIndex = steps.indexOf(currentStep);

  useEffect(() => {
    async function loadAll() {
      try {
        const resUsers = await api.get("/api/accounts/all");
        setUsers(resUsers?.data?.data || []);

        const resCategories = await api.get("/api/categories/all");
        setCategories(resCategories?.data?.data || []);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    }
    loadAll();
  }, []);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
      blobUrlsRef.current.clear();
    };
  }, []);

  const compressionQuality = (level: "high" | "medium" | "low") =>
    level === "high" ? 0.92 : level === "medium" ? 0.78 : 0.6;

  const videoFilterStyle = useMemo(
    () =>
      `brightness(${videoFx.brightness}%) contrast(${videoFx.contrast}%) saturate(${videoFx.saturation}%) hue-rotate(${videoFx.hue}deg) blur(${videoFx.blur}px) grayscale(${videoFx.grayscale}%) sepia(${videoFx.sepia}%)`,
    [videoFx]
  );

  const videoTransformStyle = useMemo(
    () => `scale(${videoFx.zoom}) rotate(${videoFx.rotate}deg)`,
    [videoFx.zoom, videoFx.rotate]
  );

  const thumbFilterStyle = useMemo(
    () =>
      `brightness(${thumbnailFx.brightness}%) contrast(${thumbnailFx.contrast}%) saturate(${thumbnailFx.saturation}%) hue-rotate(${thumbnailFx.hue}deg) blur(${thumbnailFx.blur}px) grayscale(${thumbnailFx.grayscale}%) sepia(${thumbnailFx.sepia}%)`,
    [thumbnailFx]
  );

  const applyVideoPlaybackSettings = (videoEl: HTMLVideoElement | null) => {
    if (!videoEl) return;
    videoEl.playbackRate = videoFx.playbackRate;
    videoEl.volume = videoFx.volume;
    videoEl.muted = videoFx.muted;
  };

  useEffect(() => {
    applyVideoPlaybackSettings(previewVideoRef.current);
    applyVideoPlaybackSettings(editRoomVideoRef.current);
    applyVideoPlaybackSettings(modalVideoRef.current);
  }, [videoFx.playbackRate, videoFx.volume, videoFx.muted]);

  useEffect(() => {
    const v = editRoomVideoRef.current;
    if (!v) return;

    const onTimeUpdate = () => {
      if (videoFx.trimEnd > 0 && v.currentTime >= videoFx.trimEnd) {
        v.pause();
        v.currentTime = videoFx.trimStart || 0;
      }
    };

    v.addEventListener("timeupdate", onTimeUpdate);
    return () => v.removeEventListener("timeupdate", onTimeUpdate);
  }, [videoFx.trimStart, videoFx.trimEnd]);

  const getLoggedInUserId = (): number | null => {
    try {
      const candidates = [
        localStorage.getItem("auth_user"),
        localStorage.getItem("user"),
        localStorage.getItem("currentUser"),
      ].filter(Boolean);

      for (const raw of candidates) {
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        const possibleId =
          parsed?.user_id ?? parsed?.id ?? parsed?.data?.user_id ?? parsed?.data?.id;

        if (
          possibleId !== undefined &&
          possibleId !== null &&
          !Number.isNaN(Number(possibleId))
        ) {
          return Number(possibleId);
        }
      }
    } catch (err) {
      console.error("Could not detect logged in user id:", err);
    }

    return null;
  };

  const getPublishStatus = (value: "private" | "public" | "unlisted"): 0 | 1 => {
    return value === "private" ? 0 : 1;
  };

  const normalizeVideoFromList = (item: VideoListItem): UploadedVideoPreview => {
    const rawPrice = item?.price ?? "0";
    const numericPrice = Number(rawPrice || 0);

    return {
      video_id: item?.id ?? item?.video_id,
      video_url: toMediaUrl(item?.video_url || item?.video_file_url || ""),
      thumbnail_url: toMediaUrl(item?.thumbnail || item?.thumbnail_url || ""),
      title: item?.title || title.trim(),
      description: item?.description || description.trim(),
      price: rawPrice,
      is_premium:
        (item as any)?.is_premium !== undefined
          ? String((item as any).is_premium)
          : numericPrice > 0
          ? "1"
          : "0",
      category: item?.category ?? categoryId,
      owner: item?.owner || "",
      duration: item?.duration || "0.00",
      views: item?.views ?? 0,
      likes: item?.likes ?? 0,
      dislikes: item?.dislikes ?? 0,
      status: item?.status,
    };
  };

  const resetForm = () => {
    setOwnerId("");
    setTitle("");
    setDescription("");
    setCategoryId("");
    setPrice("500");
    setIsPremium("1");
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview("");
    setThumbnailPreview("");
    setUploading(false);
    setPublishing(false);
    setUploadProgress(0);
    setSuccessMessage("");
    setErrorMessage("");
    setUploadedVideo(null);
    setShowPreviewCard(false);
    setIsPublished(false);
    setSuggestedThumbnails([]);
    setEditorDuration(0);
    setEditorCurrentTime(0);
    setEditorThumbnailPreview("");
    setEditorThumbnailFile(null);
    setCurrentStep("details");
    setVisibility("private");
    setVideoFx(defaultVideoFx);
    setThumbnailFx(defaultThumbnailFx);
    setIsEditRoomOpen(false);
    setIsThumbEditorOpen(false);
  };

  const canMoveFromDetails = () =>
    !!title.trim() && !!description.trim() && !!ownerId && !!categoryId && !!videoFile;

  const validateBeforeNext = () => {
    if (currentStep === "details" && !canMoveFromDetails()) {
      setErrorMessage("Please fill all required details and choose a video before continuing.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const goNextStep = () => {
    if (stepIndex < steps.length - 1) setCurrentStep(steps[stepIndex + 1]);
  };

  const goPrevStep = () => {
    if (stepIndex > 0) setCurrentStep(steps[stepIndex - 1]);
  };

  const handleNext = () => {
    if (!validateBeforeNext()) return;
    goNextStep();
  };

  const onVideoFileSelected = (f: File | null) => {
    if (!f) return;
    setVideoFile(f);

    const url = URL.createObjectURL(f);
    blobUrlsRef.current.add(url);
    setVideoPreview(url);

    setThumbnailFile(null);
    setThumbnailPreview("");
    setSuggestedThumbnails([]);
    setSuccessMessage("");
    setErrorMessage("");
    setUploadedVideo(null);
    setShowPreviewCard(false);
    setIsPublished(false);
    setUploadProgress(0);
    setVideoFx(defaultVideoFx);
    setThumbnailFx(defaultThumbnailFx);
  };

  const onThumbnailSelected = (f: File | null) => {
    if (!f) return;
    setThumbnailFile(f);
    const url = URL.createObjectURL(f);
    blobUrlsRef.current.add(url);
    setThumbnailPreview(url);
  };

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
        const t = Math.min(Math.max(0, timeSec), Math.max(0.05, video.duration - 0.05));
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
            reject("Canvas unsupported");
            return;
          }

          ctx.filter = `brightness(${thumbnailFx.brightness}%) contrast(${thumbnailFx.contrast}%) saturate(${thumbnailFx.saturation}%) hue-rotate(${thumbnailFx.hue}deg) blur(${thumbnailFx.blur}px) grayscale(${thumbnailFx.grayscale}%) sepia(${thumbnailFx.sepia}%)`;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                cleanup();
                reject("Blob creation failed");
                return;
              }

              const thumb = new File([blob], `thumb-${Math.round(timeSec)}.jpg`, {
                type: "image/jpeg",
              });

              const preview = URL.createObjectURL(thumb);
              blobUrlsRef.current.add(preview);

              cleanup();
              resolve({ file: thumb, preview });
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

  const extractFrameFromVideo = async (file: File): Promise<File> => {
    return captureFrameAtTime(file, 1, compressionQuality(compression)).then((res) => res.file);
  };

  const openThumbEditor = () => {
    if (!videoFile) return;
    setEditorThumbnailPreview(thumbnailPreview || "");
    setEditorThumbnailFile(thumbnailFile || null);
    setIsThumbEditorOpen(true);

    requestAnimationFrame(() => {
      const v = modalVideoRef.current;
      if (!v) return;
      v.pause();
      v.currentTime = 0;
    });
  };

  const closeThumbEditor = () => setIsThumbEditorOpen(false);
  const handleBackFromThumbnailEditor = () => setIsThumbEditorOpen(false);

  const handleModalVideoLoaded = () => {
    const v = modalVideoRef.current;
    if (!v) return;

    const dur = v.duration || 0;
    setEditorDuration(dur);
    setEditorCurrentTime(0);

    setVideoFx((prev) => ({
      ...prev,
      trimEnd: prev.trimEnd > 0 ? prev.trimEnd : dur,
    }));

    generateSuggestedThumbnails();
  };

  const handleScrubTimeChange = (t: number) => {
    setEditorCurrentTime(t);
    const v = modalVideoRef.current;
    if (!v) return;

    if (scrubTimeoutRef.current) window.clearTimeout(scrubTimeoutRef.current);
    scrubTimeoutRef.current = window.setTimeout(() => {
      v.currentTime = t;
    }, 40);
  };

  const handleModalVideoSeeked = () => {
    const v = modalVideoRef.current;
    const c = scrubCanvasRef.current;
    if (!v || !c) return;

    try {
      c.width = v.videoWidth || 640;
      c.height = v.videoHeight || 360;

      const ctx = c.getContext("2d");
      if (!ctx) return;

      ctx.filter = `brightness(${thumbnailFx.brightness}%) contrast(${thumbnailFx.contrast}%) saturate(${thumbnailFx.saturation}%) hue-rotate(${thumbnailFx.hue}deg) blur(${thumbnailFx.blur}px) grayscale(${thumbnailFx.grayscale}%) sepia(${thumbnailFx.sepia}%)`;
      ctx.drawImage(v, 0, 0, c.width, c.height);

      const dataUrl = c.toDataURL("image/jpeg", compressionQuality(compression));
      setEditorThumbnailPreview(dataUrl);
    } catch (err) {
      console.error("scrub draw failed", err);
    }
  };

  const handleCaptureFromEditor = async () => {
    if (!videoFile) return;

    try {
      const captured = await captureFrameAtTime(
        videoFile,
        editorCurrentTime,
        compressionQuality(compression)
      );
      setEditorThumbnailFile(captured.file);
      setEditorThumbnailPreview(captured.preview);
    } catch (err) {
      console.error("capture failed", err);
      alert("Capture failed.");
    }
  };

  const generateSuggestedThumbnails = async () => {
    if (!videoFile) return;

    try {
      const v = modalVideoRef.current;
      const duration = v?.duration || editorDuration || 0;
      if (!duration) return;

      const points = [0.15, 0.45, 0.75];
      const suggestions: ThumbSuggestion[] = [];

      for (const p of points) {
        const t = Math.min(duration - 0.05, duration * p);
        try {
          const captured = await captureFrameAtTime(
            videoFile,
            t,
            compressionQuality(compression)
          );
          suggestions.push({
            time: t,
            preview: captured.preview,
            file: captured.file,
          });
        } catch (err) {
          console.error("suggestion capture failed", err);
        }
      }

      setSuggestedThumbnails(suggestions);
    } catch (err) {
      console.error("generate suggestions failed", err);
    }
  };

  const handleSelectSuggested = (item: ThumbSuggestion) => {
    if (!item.file) return;
    setEditorThumbnailFile(item.file);
    setEditorThumbnailPreview(item.preview);
  };

  const handleSaveEditorThumbnail = async () => {
    let finalFile = editorThumbnailFile;
    let finalPreview = editorThumbnailPreview;

    if (!finalFile && editorThumbnailPreview) {
      const res = await fetch(editorThumbnailPreview);
      const blob = await res.blob();
      finalFile = new File([blob], "thumbnail.jpg", {
        type: blob.type || "image/jpeg",
      });

      if (!finalPreview.startsWith("blob:")) {
        const localUrl = URL.createObjectURL(finalFile);
        blobUrlsRef.current.add(localUrl);
        finalPreview = localUrl;
      }
    }

    if (finalFile) setThumbnailFile(finalFile);
    if (finalPreview) setThumbnailPreview(finalPreview);
  };

  const handleSaveThumbnailOnly = async () => {
    try {
      await handleSaveEditorThumbnail();
      setSuccessMessage("Thumbnail saved.");
      setIsThumbEditorOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedFromThumbnailEditor = async () => {
    try {
      await handleSaveEditorThumbnail();
      setIsThumbEditorOpen(false);
      setCurrentStep("checks");
      setSuccessMessage("Thumbnail saved. Continue to checks.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditRoom = () => {
    setSuccessMessage("Edits saved in preview.");
    setIsEditRoomOpen(false);
  };

  const handleProceedFromEditRoom = () => {
    setSuccessMessage("Edits saved. Continue to checks.");
    setIsEditRoomOpen(false);
    setCurrentStep("checks");
  };

  const handleEditUploaded = () => {
    setShowPreviewCard(false);
    setSuccessMessage("");
    setErrorMessage("");
    setIsPublished(false);
    setCurrentStep("details");
    setIsEditRoomOpen(true);
  };

  const handleCancelUploaded = () => {
    setUploadedVideo(null);
    setShowPreviewCard(false);
    setIsPublished(false);
    resetForm();
  };

  const handlePublishUploaded = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      if (!uploadedVideo?.video_id) {
        setErrorMessage("No uploaded video found to publish.");
        return;
      }

      const detectedVerifierId = getLoggedInUserId();
      const verifiedBy = detectedVerifierId ?? Number(ownerId);

      if (!verifiedBy || Number.isNaN(Number(verifiedBy))) {
        setErrorMessage("Could not detect verified_by user id.");
        return;
      }

      const status = getPublishStatus(visibility);
      setPublishing(true);

      const res = await api.put("/api/videos/verify", {
        video_id: Number(uploadedVideo.video_id),
        verified_by: Number(verifiedBy),
        status,
      });

      setUploadedVideo((prev) => (prev ? { ...prev, status } : prev));
      setIsPublished(status === 1);
      setSuccessMessage(
        res?.data?.message ||
          (status === 1
            ? "Video approved and published successfully."
            : "Video saved as not approved.")
      );
    } catch (err: any) {
      console.error("PUBLISH ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || "Publish failed.");
      setIsPublished(false);
    } finally {
      setPublishing(false);
    }
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");
    setUploadProgress(0);
    setUploadedVideo(null);
    setShowPreviewCard(false);
    setIsPublished(false);

    if (!ownerId || !title || !description || !categoryId || !videoFile) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      let finalThumbnail = thumbnailFile;

      if (!finalThumbnail && videoFile) {
        finalThumbnail = await extractFrameFromVideo(videoFile);
        const localThumbUrl = URL.createObjectURL(finalThumbnail);
        blobUrlsRef.current.add(localThumbUrl);
        setThumbnailPreview(localThumbUrl);
      }

      const form = new FormData();
      form.append("owner_id", ownerId);
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("category", categoryId);
      form.append("price", isPremium === "0" ? "0" : price || "0");
      form.append("is_premium", isPremium);
      form.append("video_file", videoFile);

      if (finalThumbnail) form.append("thumbnail_file", finalThumbnail);

      const res = await api.post("/api/videos/add", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          const total = progressEvent.total || 0;
          if (!total) return;
          const percent = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(percent);
        },
      });

      const payload = res?.data;
      const data = payload?.data || payload || {};
      const uploadedId = Number(data?.video_id);

      let uploaded: UploadedVideoPreview | null = null;

      if (uploadedId) {
        try {
          const listRes = await api.get("/api/videos/videoList");
          const list = listRes?.data?.data || [];

          const savedVideo = list.find(
            (item: any) => Number(item?.id ?? item?.video_id) === uploadedId
          );

          if (savedVideo) {
            uploaded = normalizeVideoFromList(savedVideo);
          }
        } catch (listErr) {
          console.error("VIDEO LIST REFRESH ERROR:", listErr);
        }
      }

      if (!uploaded) {
        uploaded = {
          video_id: data?.video_id,
          video_url: toMediaUrl(data?.video_url || data?.video_file_url || ""),
          thumbnail_url: toMediaUrl(data?.thumbnail_url || data?.thumbnail_file_url || ""),
          title: title.trim(),
          description: description.trim(),
          price: isPremium === "0" ? "0" : price,
          is_premium: isPremium,
          category: categoryId,
          owner: "",
          duration: "0.00",
          views: 0,
          likes: 0,
          dislikes: 0,
          status: 0,
        };
      }

      setUploadedVideo(uploaded);
      setShowPreviewCard(true);
      setSuccessMessage(payload?.message || "Upload successful");
      setUploadProgress(100);
      setCurrentStep("checks");
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err?.response?.data || err?.message || err);
      setErrorMessage(err?.response?.data?.message || err?.message || "Upload failed.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#3a3a3a] bg-[#101828] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8b8b8b] focus:border-blue-500";
  const textareaClass =
    "w-full rounded-xl border border-[#3a3a3a] bg-[#101828] px-4 py-3 text-sm text-white outline-none placeholder:text-[#8b8b8b] focus:border-blue-500 resize-none";
  const selectClass =
    "w-full rounded-xl border border-[#3a3a3a] bg-[#101828] px-4 py-3 text-sm text-white outline-none focus:border-blue-500";
  const ghostButton =
    "rounded-full border border-[#3a3a3a] bg-[#21395e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-60";
  const primaryButton =
    "rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60";
  const darkPanel = "rounded-3xl border border-[#2b2b2b] bg-[#101828]";
  const muted = "text-sm text-[#a1a1a1]";

  const stepMeta = [
    { key: "details", label: "Details" },
    { key: "elements", label: "Video elements" },
    { key: "checks", label: "Checks" },
    { key: "visibility", label: "Visibility" },
  ] as const;

  const RangeRow = ({
    label,
    min,
    max,
    step = 1,
    value,
    onChange,
    suffix = "",
  }: {
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    onChange: (v: number) => void;
    suffix?: string;
  }) => (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-[#a1a1a1]">
        <span>{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-6 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[28px] border border-[#2a2a2a] bg-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 border-b border-[#2a2a2a] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Upload video</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setIsEditRoomOpen(true)} className={ghostButton}>
                Open editing room
              </button>
              <button type="button" onClick={handleCancelUploaded} className={ghostButton}>
                Cancel
              </button>
              {currentStep === "visibility" && (
                <button
                  type="button"
                  onClick={handlePublishUploaded}
                  className={primaryButton}
                  disabled={!showPreviewCard || publishing}
                >
                  {publishing
                    ? "Publishing..."
                    : visibility === "private"
                    ? "Save as Private"
                    : "Publish"}
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-[#2a2a2a] px-5 py-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stepMeta.map((item, idx) => {
                const active = currentStep === item.key;
                const completed =
                  stepIndex > idx ||
                  (item.key === "checks" && showPreviewCard) ||
                  (item.key === "visibility" && isPublished);

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (idx <= stepIndex || completed) {
                        setCurrentStep(item.key as UploadStep);
                      }
                    }}
                    className="flex items-center gap-3 text-left"
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                        active || completed
                          ? "border-white bg-white text-black"
                          : "border-[#5a5a5a] text-[#a1a1a1]"
                      }`}
                    >
                      {completed ? "✓" : idx + 1}
                    </div>
                    <div
                      className={
                        active || completed
                          ? "text-sm font-semibold text-white"
                          : "text-sm text-[#8c8c8c]"
                      }
                    >
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              {currentStep === "details" && (
                <div className={`${darkPanel} p-5`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Details</h2>
                    <button
                      type="button"
                      className={ghostButton}
                      onClick={() => {
                        setTitle("");
                        setDescription("");
                        setCategoryId("");
                        setPrice("500");
                        setIsPremium("1");
                      }}
                    >
                      Reuse details
                    </button>
                  </div>

                  <form onSubmit={submit} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wide text-[#8f8f8f]">
                        Title (required)
                      </label>
                      <input
                        className={inputClass}
                        placeholder="Add a title that describes your video"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs uppercase tracking-wide text-[#8f8f8f]">
                        Description
                      </label>
                      <textarea
                        className={`${textareaClass} min-h-[180px]`}
                        placeholder="Tell viewers about your video"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wide text-[#8f8f8f]">
                          Owner
                        </label>
                        <select
                          className={selectClass}
                          value={ownerId}
                          onChange={(e) => setOwnerId(e.target.value)}
                        >
                          <option value="">Select Owner</option>
                          {users.map((u) => (
                            <option key={u.user_id} value={u.user_id}>
                              {u.first_name} {u.last_name || ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wide text-[#8f8f8f]">
                          Category
                        </label>
                        <select
                          className={selectClass}
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c.category_id} value={c.category_id}>
                              {c.category_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wide text-[#8f8f8f]">
                          Video type
                        </label>
                        <select
                          className={selectClass}
                          value={isPremium}
                          onChange={(e) => {
                            const value = e.target.value;
                            setIsPremium(value);
                            if (value === "0") setPrice("0");
                          }}
                        >
                          <option value="1">Premium</option>
                          <option value="0">Free</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-wide text-[#8f8f8f]">
                          Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={inputClass}
                          placeholder="500.00"
                          value={price}
                          disabled={isPremium === "0"}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={`${darkPanel} border border-dashed border-[#3a3a3a] bg-[#111111] p-4`}>
                      <div className="mb-3">
                        <div className="text-sm font-semibold text-white">Video file</div>
                        <div className={muted}>Upload the main video file</div>
                      </div>

                      <input
                        type="file"
                        accept="video/*"
                        className="block w-full text-sm text-[#cfcfcf] file:mr-4 file:rounded-full file:border-0 file:bg-[#1d293d] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#3a3a3a]"
                        onChange={(e) => onVideoFileSelected(e.target.files?.[0] || null)}
                      />
                    </div>

                    <div className={`${darkPanel} border border-dashed border-[#3a3a3a] bg-[#111111] p-4`}>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-white">Thumbnail</div>
                          <div className={muted}>Upload one or generate from video</div>
                        </div>

                        {videoFile && (
                          <button type="button" onClick={openThumbEditor} className={ghostButton}>
                            Edit thumbnail
                          </button>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-[#cfcfcf] file:mr-4 file:rounded-full file:border-0 file:bg-[#1d293d] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#3a3a3a]"
                        onChange={(e) => onThumbnailSelected(e.target.files?.[0] || null)}
                      />
                    </div>

                    {uploading && (
                      <div className={`${darkPanel} p-4`}>
                        <div className="mb-2 flex items-center justify-between text-sm text-[#bdbdbd]">
                          <span>Uploading video...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#101828]">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {errorMessage && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {errorMessage}
                      </div>
                    )}
                  </form>
                </div>
              )}

              {currentStep === "elements" && (
                <div className={`${darkPanel} p-5`}>
                  <h2 className="text-xl font-semibold">Video elements</h2>
                  <p className="mt-2 text-sm text-[#a1a1a1]">
                    Review media and open editing room if needed.
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-[#2f2f2f] bg-[#101828] p-4">
                      <div className="mb-3 text-sm font-semibold">Thumbnail</div>
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="thumbnail"
                          className="h-44 w-full rounded-xl object-cover"
                          style={{
                            filter: thumbFilterStyle,
                            transform: `scale(${thumbnailFx.zoom})`,
                            transformOrigin: "center center",
                          }}
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-xl bg-[#1b1b1b] text-sm text-[#6f6f6f]">
                          No thumbnail selected
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#2f2f2f] bg-[#1d293d] p-4">
                      <div className="mb-3 text-sm font-semibold">Video preview</div>
                      {videoPreview ? (
                        <video
                          src={videoPreview}
                          controls
                          className="h-44 w-full rounded-xl object-contain bg-[#1d293d]"
                          poster={thumbnailPreview || undefined}
                          style={{
                            filter: videoFilterStyle,
                            transform: videoTransformStyle,
                            transformOrigin: "center center",
                          }}
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-xl bg-[#1d293d] text-sm text-[#6f6f6f]">
                          No video selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "checks" && (
                <div className={`${darkPanel} p-5`}>
                  <h2 className="text-xl font-semibold">Checks</h2>
                  <p className="mt-2 text-sm text-[#a1a1a1]">
                    Upload the video first, then review the result here.
                  </p>

                  <div className="mt-5 rounded-2xl border border-[#2f2f2f] bg-[#1d293d] p-4 text-sm text-[#d7d7d7]">
                    {showPreviewCard
                      ? "Checks complete."
                      : "No uploaded result yet. Click Upload to continue."}
                  </div>

                  {!showPreviewCard && (
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => submit()}
                        className={primaryButton}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload now"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "visibility" && (
                <div className={`${darkPanel} p-5`}>
                  <h2 className="text-xl font-semibold">Visibility</h2>
                  <p className="mt-2 text-sm text-[#a1a1a1]">
                    Choose how your video should appear when saved or published.
                  </p>

                  <div className="mt-6 space-y-4">
                    {[
                      {
                        value: "private",
                        title: "Private",
                        desc: "Sends status 0 (not approved / draft / private).",
                      },
                      {
                        value: "unlisted",
                        title: "Unlisted",
                        desc: "Sends status 1 (approved / published).",
                      },
                      {
                        value: "public",
                        title: "Public",
                        desc: "Sends status 1 (approved / published).",
                      },
                    ].map((item) => (
                      <label
                        key={item.value}
                        className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${
                          visibility === item.value
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-[#2f2f2f] bg-[#1d293d]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          checked={visibility === item.value}
                          onChange={() => setVisibility(item.value as typeof visibility)}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="mt-1 text-sm text-[#a1a1a1]">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {showPreviewCard ? (
                    <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
                      Uploaded video is ready. Choose visibility and publish.
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                      Upload the video first from the Checks step.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goPrevStep}
                  className={ghostButton}
                  disabled={currentStep === "details"}
                >
                  Back
                </button>

                {currentStep !== "visibility" && (
                  <button type="button" onClick={handleNext} className={primaryButton}>
                    Next
                  </button>
                )}

                {currentStep === "visibility" && (
                  <button
                    type="button"
                    onClick={handlePublishUploaded}
                    className={primaryButton}
                    disabled={!showPreviewCard || publishing}
                  >
                    {publishing
                      ? "Publishing..."
                      : visibility === "private"
                      ? "Save as Private"
                      : "Publish"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className={`${darkPanel} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">Preview</h2>
                  <button type="button" onClick={() => setIsEditRoomOpen(true)} className={ghostButton}>
                    Edit room
                  </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-[#1d293d]">
                  <div className="aspect-video bg-[#1d293d]">
                    {videoPreview ? (
                      <video
                        src={videoPreview}
                        controls
                        preload="metadata"
                        ref={previewVideoRef}
                        className="h-full w-full object-contain"
                        poster={thumbnailPreview || undefined}
                        style={{
                          filter: videoFilterStyle,
                          transform: videoTransformStyle,
                          transformOrigin: "center center",
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#7b7b7b]">
                        Video preview will appear here
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#2f2f2f] bg-[#1d293d] p-3">
                    <div className="mb-2 text-xs uppercase tracking-wide text-[#8f8f8f]">
                      Thumbnail
                    </div>
                    {thumbnailPreview ? (
                      <img
                        src={thumbnailPreview}
                        alt="thumbnail preview"
                        className="h-32 w-full rounded-xl object-cover"
                        style={{
                          filter: thumbFilterStyle,
                          transform: `scale(${thumbnailFx.zoom})`,
                          transformOrigin: "center center",
                        }}
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center rounded-xl bg-[#0f172b] text-sm text-[#6f6f6f]">
                        No thumbnail yet
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#2f2f2f] bg-[#1d293d] p-3">
                    <div className="mb-2 text-xs uppercase tracking-wide text-[#8f8f8f]">
                      Upload info
                    </div>
                    <div className="space-y-2 text-sm text-[#d3d3d3]">
                      <div>Title: {title || "--"}</div>
                      <div>Description: {description || "--"}</div>
                      <div>Type: {isPremium === "1" ? "Premium" : "Free"}</div>
                      <div>Price: {isPremium === "1" ? price || "0" : "0"}</div>
                      <div>Category: {categoryId || "--"}</div>
                      <div>Visibility: {visibility}</div>
                      <div>Status to send: {getPublishStatus(visibility)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {showPreviewCard && uploadedVideo && (
                <div className={`${darkPanel} p-5`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">Uploaded video preview</h2>
                      <p className="mt-1 text-sm text-[#a1a1a1]">
                        Ready for review and publishing.
                      </p>
                    </div>

                    {(isPublished || Number(uploadedVideo.status) === 1) && (
                      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300">
                        Published
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-black">
                      {uploadedVideo.thumbnail_url || thumbnailPreview ? (
                        <img
                          src={uploadedVideo.thumbnail_url || thumbnailPreview}
                          alt={uploadedVideo.title || "thumbnail"}
                          className="h-48 w-full object-cover"
                          style={{
                            filter: thumbFilterStyle,
                            transform: `scale(${thumbnailFx.zoom})`,
                            transformOrigin: "center center",
                          }}
                          onError={(e) => {
                            if (thumbnailPreview && e.currentTarget.src !== thumbnailPreview) {
                              e.currentTarget.src = thumbnailPreview;
                            }
                          }}
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-[#707070]">
                          No thumbnail
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                      <div className="text-lg font-semibold">
                        {uploadedVideo.title || "Untitled Video"}
                      </div>
                      <div className="mt-2 text-sm text-[#c9c9c9]">
                        {uploadedVideo.description || "No description"}
                      </div>
                    </div>

                    {/*<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                        <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Status</div>
                        <div className="mt-2 text-lg font-semibold">
                          {Number(uploadedVideo.status) === 1 ? "Published" : "Pending"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                        <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Owner</div>
                        <div className="mt-2 text-lg font-semibold">{uploadedVideo.owner || "--"}</div>
                      </div>

                      <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                        <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Duration</div>
                        <div className="mt-2 text-lg font-semibold">{uploadedVideo.duration || "0.00"}</div>
                      </div>

                      <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                        <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Views</div>
                        <div className="mt-2 text-lg font-semibold">{uploadedVideo.views ?? 0}</div>
                      </div>
                    </div>*/}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                        <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Video ID</div>
                        <div className="mt-2 text-lg font-semibold">{uploadedVideo.video_id ?? "--"}</div>
                      </div>

                      <div className="rounded-2xl border border-[#2f2f2f] bg-[#111111] p-4">
                        <div className="text-xs uppercase tracking-wide text-[#8f8f8f]">Type</div>
                        <div className="mt-2 text-lg font-semibold">
                          {String(uploadedVideo.is_premium) === "1" ? "Premium" : "Free"}
                        </div>
                      </div>
                    </div>

                    {(uploadedVideo.video_url || videoPreview) && (
                      <div className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-black">
                        <video
                          src={uploadedVideo.video_url || videoPreview}
                          controls
                          className="w-full rounded-2xl"
                          poster={uploadedVideo.thumbnail_url || thumbnailPreview || undefined}
                          preload="metadata"
                          style={{
                            filter: videoFilterStyle,
                            transform: videoTransformStyle,
                            transformOrigin: "center center",
                          }}
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleCancelUploaded}
                        className="rounded-full border border-slate-500/20 bg-slate-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500/15"
                      >
                        Cancel
                      </button>

                      <button type="button" onClick={handleEditUploaded} className={ghostButton}>
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setCurrentStep("visibility")}
                        className={primaryButton}
                      >
                        Continue to Visibility
                      </button>
                    </div>

                    {successMessage && (
                      <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                        {successMessage}
                      </div>
                    )}

                    {errorMessage && (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isThumbEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center py-6">
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-[#2b2b2b] bg-[#181818] shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
              <div className="flex flex-col gap-4 border-b border-[#2a2a2a] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <button type="button" onClick={handleBackFromThumbnailEditor} className={ghostButton}>
                    ← Back
                  </button>

                  <div>
                    <h2 className="text-xl font-semibold">Thumbnail editor</h2>
                    <p className="mt-1 text-sm text-[#a1a1a1]">
                      Capture a frame, choose a suggestion, then save or continue.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={compression}
                    onChange={(e) =>
                      setCompression(e.target.value as "high" | "medium" | "low")
                    }
                    className={selectClass}
                  >
                    <option value="high">High quality</option>
                    <option value="medium">Medium quality</option>
                    <option value="low">Low quality</option>
                  </select>

                  <button type="button" onClick={closeThumbEditor} className={ghostButton}>
                    Close
                  </button>

                  <button type="button" onClick={handleSaveThumbnailOnly} className={primaryButton}>
                    Save thumbnail
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <div className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-black">
                    <video
                      ref={modalVideoRef}
                      src={videoPreview}
                      controls
                      className="w-full"
                      onLoadedMetadata={handleModalVideoLoaded}
                      onSeeked={handleModalVideoSeeked}
                    />
                  </div>

                  <div className="mt-4">
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, editorDuration)}
                      value={editorCurrentTime}
                      step={0.05}
                      onChange={(e) => handleScrubTimeChange(Number(e.target.value))}
                      className="w-full accent-blue-500"
                    />

                    <div className="mt-2 flex justify-between text-xs text-[#9b9b9b]">
                      <span>{(editorCurrentTime || 0).toFixed(2)}s</span>
                      <span>{editorDuration ? `${editorDuration.toFixed(2)}s` : "0.00s"}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={handleCaptureFromEditor} className={primaryButton}>
                      Capture frame
                    </button>

                    <button type="button" onClick={generateSuggestedThumbnails} className={ghostButton}>
                      Generate suggestions
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className={`${darkPanel} p-4`}>
                    <h3 className="mb-3 text-base font-semibold">Selected thumbnail</h3>
                    <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#101010]">
                      {editorThumbnailPreview ? (
                        <img
                          src={editorThumbnailPreview}
                          alt="preview"
                          className="max-h-full rounded-xl"
                          style={{
                            filter: thumbFilterStyle,
                            transform: `scale(${thumbnailFx.zoom})`,
                            transformOrigin: "center center",
                          }}
                        />
                      ) : (
                        <div className="text-sm text-[#6f6f6f]">Capture a frame to preview</div>
                      )}
                    </div>
                  </div>

                  <div className={`${darkPanel} p-4`}>
                    <h3 className="mb-3 text-base font-semibold">Suggested thumbnails</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {suggestedThumbnails.length === 0 && (
                        <div className="col-span-3 text-sm text-[#7c7c7c]">No suggestions yet</div>
                      )}
                      {suggestedThumbnails.map((s, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => handleSelectSuggested(s)}
                          className="overflow-hidden rounded-xl border border-[#2f2f2f] bg-[#111111] transition hover:border-[#4a4a4a]"
                          title={`Time: ${s.time.toFixed(2)}s`}
                        >
                          <img src={s.preview} alt={`suggest-${idx}`} className="h-20 w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`${darkPanel} space-y-4 p-4`}>
                    <h3 className="text-base font-semibold">Thumbnail effects</h3>
                    <RangeRow
                      label="Brightness"
                      min={0}
                      max={200}
                      value={thumbnailFx.brightness}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, brightness: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Contrast"
                      min={0}
                      max={200}
                      value={thumbnailFx.contrast}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, contrast: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Saturation"
                      min={0}
                      max={200}
                      value={thumbnailFx.saturation}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, saturation: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Hue"
                      min={-180}
                      max={180}
                      value={thumbnailFx.hue}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, hue: v }))}
                      suffix="°"
                    />
                    <RangeRow
                      label="Blur"
                      min={0}
                      max={10}
                      step={0.1}
                      value={thumbnailFx.blur}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, blur: v }))}
                      suffix="px"
                    />
                    <RangeRow
                      label="Grayscale"
                      min={0}
                      max={100}
                      value={thumbnailFx.grayscale}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, grayscale: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Sepia"
                      min={0}
                      max={100}
                      value={thumbnailFx.sepia}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, sepia: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Zoom"
                      min={1}
                      max={2}
                      step={0.01}
                      value={Number(thumbnailFx.zoom.toFixed(2))}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, zoom: v }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#2a2a2a] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-[#a1a1a1]">
                  Save your thumbnail and continue with the upload flow.
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={handleBackFromThumbnailEditor} className={ghostButton}>
                    Back
                  </button>

                  <button type="button" onClick={handleSaveThumbnailOnly} className={ghostButton}>
                    Save only
                  </button>

                  <button type="button" onClick={handleProceedFromThumbnailEditor} className={primaryButton}>
                    Proceed to checks
                  </button>
                </div>
              </div>
            </div>
          </div>
          <canvas ref={scrubCanvasRef} className="hidden" />
        </div>
      )}

      {isEditRoomOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-start justify-center py-6">
            <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-[#2b2b2b] bg-[#181818] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col gap-4 border-b border-[#2a2a2a] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditRoomOpen(false)}
                    className={ghostButton}
                  >
                    ← Back
                  </button>

                  <div>
                    <h2 className="text-xl font-semibold">Editing room</h2>
                    <p className="mt-1 text-sm text-[#a1a1a1]">
                      Edit video, thumbnail, and description before continuing.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={openThumbEditor} className={ghostButton}>
                    Thumbnail editor
                  </button>

                  <button type="button" onClick={() => setIsEditRoomOpen(false)} className={ghostButton}>
                    Close
                  </button>

                  <button type="button" onClick={handleSaveEditRoom} className={primaryButton}>
                    Save changes
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-5">
                  <div className={`${darkPanel} p-4`}>
                    <h3 className="mb-4 text-lg font-semibold">Description editor</h3>
                    <div className="space-y-4">
                      <input
                        className={inputClass}
                        placeholder="Video title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                      <textarea
                        className={`${textareaClass} min-h-[180px]`}
                        placeholder="Edit your description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className={`${darkPanel} p-4`}>
                    <h3 className="mb-4 text-lg font-semibold">Video editor</h3>

                    <div className="overflow-hidden rounded-2xl border border-[#2f2f2f] bg-black">
                      <div className="aspect-video bg-black">
                        {videoPreview ? (
                          <video
                            ref={editRoomVideoRef}
                            src={videoPreview}
                            controls
                            preload="metadata"
                            className="h-full w-full object-contain"
                            poster={thumbnailPreview || undefined}
                            style={{
                              filter: videoFilterStyle,
                              transform: videoTransformStyle,
                              transformOrigin: "center center",
                            }}
                            onLoadedMetadata={(e) => {
                              const d = e.currentTarget.duration || 0;
                              setEditorDuration(d);
                              setVideoFx((prev) => ({
                                ...prev,
                                trimEnd: prev.trimEnd > 0 ? prev.trimEnd : d,
                              }));
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[#6f6f6f]">
                            No video selected
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                      <div className="space-y-4">
                        <RangeRow
                          label="Trim Start"
                          min={0}
                          max={Math.max(0, videoFx.trimEnd || 0)}
                          step={0.1}
                          value={videoFx.trimStart}
                          onChange={(v) =>
                            setVideoFx((prev) => ({
                              ...prev,
                              trimStart: Math.min(v, Math.max(0, prev.trimEnd - 0.1)),
                            }))
                          }
                          suffix="s"
                        />
                        <RangeRow
                          label="Trim End"
                          min={Math.min(videoFx.trimStart + 0.1, editorDuration || 0)}
                          max={Math.max(videoFx.trimStart + 0.1, editorDuration || 0)}
                          step={0.1}
                          value={videoFx.trimEnd || 0}
                          onChange={(v) =>
                            setVideoFx((prev) => ({
                              ...prev,
                              trimEnd: Math.max(v, prev.trimStart + 0.1),
                            }))
                          }
                          suffix="s"
                        />
                        <RangeRow
                          label="Brightness"
                          min={0}
                          max={200}
                          value={videoFx.brightness}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, brightness: v }))}
                          suffix="%"
                        />
                        <RangeRow
                          label="Contrast"
                          min={0}
                          max={200}
                          value={videoFx.contrast}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, contrast: v }))}
                          suffix="%"
                        />
                        <RangeRow
                          label="Saturation"
                          min={0}
                          max={200}
                          value={videoFx.saturation}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, saturation: v }))}
                          suffix="%"
                        />
                        <RangeRow
                          label="Hue"
                          min={-180}
                          max={180}
                          value={videoFx.hue}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, hue: v }))}
                          suffix="°"
                        />
                      </div>

                      <div className="space-y-4">
                        <RangeRow
                          label="Blur"
                          min={0}
                          max={10}
                          step={0.1}
                          value={videoFx.blur}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, blur: v }))}
                          suffix="px"
                        />
                        <RangeRow
                          label="Grayscale"
                          min={0}
                          max={100}
                          value={videoFx.grayscale}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, grayscale: v }))}
                          suffix="%"
                        />
                        <RangeRow
                          label="Sepia"
                          min={0}
                          max={100}
                          value={videoFx.sepia}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, sepia: v }))}
                          suffix="%"
                        />
                        <RangeRow
                          label="Rotate"
                          min={-180}
                          max={180}
                          value={videoFx.rotate}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, rotate: v }))}
                          suffix="°"
                        />
                        <RangeRow
                          label="Zoom"
                          min={1}
                          max={2.5}
                          step={0.01}
                          value={Number(videoFx.zoom.toFixed(2))}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, zoom: v }))}
                        />
                        <RangeRow
                          label="Playback Speed"
                          min={0.25}
                          max={2}
                          step={0.05}
                          value={Number(videoFx.playbackRate.toFixed(2))}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, playbackRate: v }))}
                        />
                        <RangeRow
                          label="Volume"
                          min={0}
                          max={1}
                          step={0.01}
                          value={Number(videoFx.volume.toFixed(2))}
                          onChange={(v) => setVideoFx((prev) => ({ ...prev, volume: v }))}
                        />

                        <label className="flex items-center gap-3 text-sm text-[#d6d6d6]">
                          <input
                            type="checkbox"
                            checked={videoFx.muted}
                            onChange={(e) =>
                              setVideoFx((prev) => ({ ...prev, muted: e.target.checked }))
                            }
                          />
                          Mute preview
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className={`${darkPanel} p-4`}>
                    <h3 className="mb-4 text-lg font-semibold">Thumbnail preview</h3>
                    <div className="flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-[#101828]">
                      {thumbnailPreview ? (
                        <img
                          src={thumbnailPreview}
                          alt="thumb preview"
                          className="max-h-full rounded-xl"
                          style={{
                            filter: thumbFilterStyle,
                            transform: `scale(${thumbnailFx.zoom})`,
                            transformOrigin: "center center",
                          }}
                        />
                      ) : (
                        <div className="text-sm text-[#6f6f6f]">No thumbnail selected</div>
                      )}
                    </div>

                    <button type="button" onClick={openThumbEditor} className={`${ghostButton} mt-4`}>
                      Open thumbnail editor
                    </button>
                  </div>

                  <div className={`${darkPanel} space-y-4 p-4`}>
                    <h3 className="text-lg font-semibold">Quick thumbnail effects</h3>
                    <RangeRow
                      label="Brightness"
                      min={0}
                      max={200}
                      value={thumbnailFx.brightness}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, brightness: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Contrast"
                      min={0}
                      max={200}
                      value={thumbnailFx.contrast}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, contrast: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Saturation"
                      min={0}
                      max={200}
                      value={thumbnailFx.saturation}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, saturation: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Hue"
                      min={-180}
                      max={180}
                      value={thumbnailFx.hue}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, hue: v }))}
                      suffix="°"
                    />
                    <RangeRow
                      label="Blur"
                      min={0}
                      max={10}
                      step={0.1}
                      value={thumbnailFx.blur}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, blur: v }))}
                      suffix="px"
                    />
                    <RangeRow
                      label="Grayscale"
                      min={0}
                      max={100}
                      value={thumbnailFx.grayscale}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, grayscale: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Sepia"
                      min={0}
                      max={100}
                      value={thumbnailFx.sepia}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, sepia: v }))}
                      suffix="%"
                    />
                    <RangeRow
                      label="Zoom"
                      min={1}
                      max={2}
                      step={0.01}
                      value={Number(thumbnailFx.zoom.toFixed(2))}
                      onChange={(v) => setThumbnailFx((prev) => ({ ...prev, zoom: v }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[#2a2a2a] px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-[#a1a1a1]">
                  Save your edits, then continue to the next upload step.
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setIsEditRoomOpen(false)} className={ghostButton}>
                    Back to upload
                  </button>

                  <button type="button" onClick={handleSaveEditRoom} className={ghostButton}>
                    Save only
                  </button>

                  <button type="button" onClick={handleProceedFromEditRoom} className={primaryButton}>
                    Proceed to checks
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101828] backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#2f2f2f] bg-[#101828] p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Uploading video...</h3>
                <p className="text-sm text-[#a1a1a1]">
                  Please wait while your file is being uploaded.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm text-[#d0d0d0]">
                <span>Progress</span>
                <span>{uploadProgress}%</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-[#101828]">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {publishing && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#2f2f2f] bg-[#101828] p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-blue-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Publishing video...</h3>
                <p className="text-sm text-[#a1a1a1]">
                  Please wait while publish request is processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
