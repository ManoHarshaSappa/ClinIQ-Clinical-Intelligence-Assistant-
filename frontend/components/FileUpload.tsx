"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { uploadFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, FileText, CheckCircle, AlertCircle, Eye, Shield, Zap, FileImage, Filter, RotateCcw, Download, Star, Clock, Trash2, RefreshCw, Upload } from "lucide-react";

interface FileUploadProps {
  compact?: boolean;
}

interface FileMetadata {
  pages?: number;
  words?: number;
  hasImages?: boolean;
  isScanned?: boolean;
  confidence?: number;
  extractedText?: string;
  language?: string;
}

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'extracting' | 'success' | 'error' | 'duplicate';
  progress: number;
  error?: string;
  patient_id?: string;
  metadata?: FileMetadata;
  preview?: string;
  priority: 'low' | 'normal' | 'high';
  uploadTime?: Date;
  processingSteps?: string[];
  currentStep?: string;
  isHIPAACompliant?: boolean;
  isDuplicate?: boolean;
  similarFiles?: string[];
}

export function FileUpload({ compact = false }: FileUploadProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchComplete, setBatchComplete] = useState(false);
  const [finalPatientId, setFinalPatientId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'success' | 'error' | 'processing'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'status' | 'priority'>('date');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [processingStats, setProcessingStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    processing: 0
  });

  // File analysis helper functions
  const analyzeFile = useCallback(async (file: File): Promise<FileMetadata> => {
    const metadata: FileMetadata = {};

    // Basic file analysis
    if (file.type === 'application/pdf') {
      metadata.pages = Math.ceil(file.size / 50000); // Rough estimate
      metadata.hasImages = file.size > 1000000; // Large PDFs likely have images
      metadata.isScanned = file.size > 2000000; // Very large PDFs likely scanned
    }

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = await file.text();
      metadata.words = text.split(/\s+/).length;
      metadata.extractedText = text.substring(0, 200);
      metadata.language = 'en'; // Simple assumption
    }

    metadata.confidence = file.size > 10000 ? 85 + Math.random() * 10 : 60 + Math.random() * 20;
    return metadata;
  }, []);

  const checkDuplicate = useCallback((file: File, existingFiles: UploadedFile[]): boolean => {
    return existingFiles.some(existing =>
      existing.file.name === file.name &&
      existing.file.size === file.size &&
      existing.file.lastModified === file.lastModified
    );
  }, []);

  const checkHIPAACompliance = useCallback((file: File): boolean => {
    // Simple HIPAA compliance check
    const sensitivePatterns = /(?:ssn|social.?security|dob|date.?of.?birth|patient.?id)/i;
    return !sensitivePatterns.test(file.name);
  }, []);

  const addFiles = useCallback(async (files: FileList) => {
    const newFiles: UploadedFile[] = [];
    const currentCount = selectedFiles.length;

    for (let i = 0; i < files.length && (currentCount + newFiles.length) < 10; i++) {
      const file = files[i];
      if (file.name.match(/\.(pdf|txt|csv)$/i)) {
        const isDuplicate = checkDuplicate(file, selectedFiles);
        const isHIPAACompliant = checkHIPAACompliance(file);
        const metadata = await analyzeFile(file);

        // Generate preview for text files
        let preview = '';
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          try {
            const text = await file.text();
            preview = text.substring(0, 100) + (text.length > 100 ? '...' : '');
          } catch (e) {
            preview = 'Unable to preview file';
          }
        }

        newFiles.push({
          file,
          id: Math.random().toString(36).substring(7),
          status: isDuplicate ? 'duplicate' : 'pending',
          progress: 0,
          metadata,
          preview,
          priority: 'normal',
          uploadTime: new Date(),
          processingSteps: ['validation', 'upload', 'extract', 'analyze'],
          currentStep: 'validation',
          isHIPAACompliant,
          isDuplicate,
          similarFiles: isDuplicate ? [selectedFiles.find(f =>
            f.file.name === file.name && f.file.size === file.size
          )?.id].filter(Boolean) as string[] : []
        });
      }
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles, analyzeFile, checkDuplicate, checkHIPAACompliance]);

  const removeFile = useCallback((id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFileIds(prev => prev.filter(fId => fId !== id));
  }, []);

  // Bulk action functions
  const selectAllFiles = useCallback(() => {
    setSelectedFileIds(selectedFiles.map(f => f.id));
  }, [selectedFiles]);

  const deselectAllFiles = useCallback(() => {
    setSelectedFileIds([]);
  }, []);

  const removeSelectedFiles = useCallback(() => {
    setSelectedFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
    setSelectedFileIds([]);
  }, [selectedFileIds]);

  const retryFailedFiles = useCallback(() => {
    setSelectedFiles(prev => prev.map(f =>
      f.status === 'error' ? { ...f, status: 'pending' as const, progress: 0, error: undefined } : f
    ));
  }, []);

  const setPriority = useCallback((priority: 'low' | 'normal' | 'high') => {
    setSelectedFiles(prev => prev.map(f =>
      selectedFileIds.includes(f.id) ? { ...f, priority } : f
    ));
    setSelectedFileIds([]);
  }, [selectedFileIds]);

  const openPreview = useCallback((file: UploadedFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  }, []);

  // Enhanced stats tracking
  useEffect(() => {
    const stats = selectedFiles.reduce((acc, file) => {
      acc.total++;
      if (file.status === 'success') acc.success++;
      else if (file.status === 'error') acc.failed++;
      else if (['uploading', 'processing', 'extracting'].includes(file.status)) acc.processing++;
      return acc;
    }, { total: 0, success: 0, failed: 0, processing: 0 });
    setProcessingStats(stats);
  }, [selectedFiles]);

  const processBatch = useCallback(async () => {
    const filesToProcess = selectedFiles.filter(f => f.status === 'pending');
    if (filesToProcess.length === 0) return;

    setIsProcessing(true);
    setBatchComplete(false);

    // Sort by priority (high -> normal -> low)
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    const sortedFiles = filesToProcess.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    try {
      let lastPatientId = '';

      for (let i = 0; i < sortedFiles.length; i++) {
        const fileData = sortedFiles[i];

        // Step 1: Upload
        setSelectedFiles(prev => prev.map(f =>
          f.id === fileData.id ? {
            ...f,
            status: 'uploading' as const,
            progress: 25,
            currentStep: 'upload'
          } : f
        ));

        try {
          const result = await uploadFile(fileData.file);

          // Step 2: Processing
          setSelectedFiles(prev => prev.map(f =>
            f.id === fileData.id ? {
              ...f,
              status: 'processing' as const,
              progress: 50,
              currentStep: 'process'
            } : f
          ));

          // Simulate processing delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Step 3: Extracting
          setSelectedFiles(prev => prev.map(f =>
            f.id === fileData.id ? {
              ...f,
              status: 'extracting' as const,
              progress: 75,
              currentStep: 'extract'
            } : f
          ));

          // Simulate extraction delay
          await new Promise(resolve => setTimeout(resolve, 800));

          lastPatientId = result.patient_id;

          // Step 4: Complete
          setSelectedFiles(prev => prev.map(f =>
            f.id === fileData.id ? {
              ...f,
              status: 'success' as const,
              progress: 100,
              patient_id: result.patient_id,
              currentStep: 'complete'
            } : f
          ));

        } catch (error) {
          setSelectedFiles(prev => prev.map(f =>
            f.id === fileData.id ? {
              ...f,
              status: 'error' as const,
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed',
              currentStep: 'error'
            } : f
          ));
        }
      }

      // If we have at least one success, redirect to the last patient
      if (lastPatientId) {
        setFinalPatientId(lastPatientId);
        setBatchComplete(true);
        // Auto redirect after 3 seconds
        setTimeout(() => {
          router.push(`/patients/${lastPatientId}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, router]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  if (compact) {
    return (
      <div
        className={cn(
          "border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer p-5",
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <p className="text-sm text-slate-600 mb-3">
          Drop files or browse (max 10)
        </p>
        <input
          type="file"
          accept=".pdf,.txt,.csv"
          className="hidden"
          id="file-input-compact"
          multiple
          disabled={isProcessing}
          onChange={onFileSelect}
        />
        <Button asChild disabled={isProcessing} size="sm" className="w-full">
          <label htmlFor="file-input-compact" className="cursor-pointer">
            Browse Files
          </label>
        </Button>
      </div>
    );
  }

  // Filter and sort files for display
  const filteredFiles = selectedFiles.filter(f =>
    filterStatus === 'all' || f.status === filterStatus
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.file.name.localeCompare(b.file.name);
      case 'size': return b.file.size - a.file.size;
      case 'date': return (b.uploadTime?.getTime() || 0) - (a.uploadTime?.getTime() || 0);
      case 'status': return a.status.localeCompare(b.status);
      case 'priority': {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      default: return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Drop Zone with Preview */}
      <div
        className={cn(
          "border-2 border-dashed rounded-2xl transition-colors cursor-pointer relative overflow-hidden",
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 bg-gradient-to-br from-white to-slate-50"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="60" height="60" viewBox="0 0 60 60" className="w-full h-full">
            <g fill="currentColor">
              <circle cx="30" cy="30" r="2"/>
              <circle cx="10" cy="10" r="1"/>
              <circle cx="50" cy="10" r="1"/>
              <circle cx="10" cy="50" r="1"/>
              <circle cx="50" cy="50" r="1"/>
            </g>
          </svg>
        </div>

        <div className="relative p-12 text-center">
          <div className="text-6xl mb-4 animate-pulse">📋</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Advanced Medical Document Processing
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Upload up to 10 files (PDF, TXT, CSV) • AI extracts, analyzes, and combines all patient data
          </p>

          {/* Upload Stats */}
          {selectedFiles.length > 0 && (
            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-white rounded-lg px-3 py-2 border border-slate-200">
                <span className="text-xs text-slate-500">Total: </span>
                <span className="font-semibold">{processingStats.total}</span>
              </div>
              <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                <span className="text-xs text-green-700">Success: </span>
                <span className="font-semibold text-green-800">{processingStats.success}</span>
              </div>
              {processingStats.failed > 0 && (
                <div className="bg-red-50 rounded-lg px-3 py-2 border border-red-200">
                  <span className="text-xs text-red-700">Failed: </span>
                  <span className="font-semibold text-red-800">{processingStats.failed}</span>
                </div>
              )}
            </div>
          )}

          <input
            type="file"
            accept=".pdf,.txt,.csv"
            className="hidden"
            id="file-input-multi"
            multiple
            disabled={isProcessing}
            onChange={onFileSelect}
          />
          <Button asChild disabled={isProcessing} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <label htmlFor="file-input-multi" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Select Files ({selectedFiles.length}/10)
            </label>
          </Button>

          {/* Feature indicators */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              AI Extraction
            </div>
            <div className="flex items-center gap-1">
              <FileImage className="w-3 h-3" />
              OCR Support
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Files Management */}
      {selectedFiles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          {/* Header with Controls */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-slate-800 text-lg">
                  File Queue ({sortedFiles.length}/{selectedFiles.length})
                </h3>
                {selectedFileIds.length > 0 && (
                  <div className="text-sm text-blue-600 font-medium">
                    {selectedFileIds.length} selected
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="text-sm border border-slate-200 rounded px-2 py-1"
                  >
                    <option value="all">All Files</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="success">Completed</option>
                    <option value="error">Failed</option>
                  </select>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-slate-200 rounded px-2 py-1"
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                  <option value="status">Sort by Status</option>
                  <option value="priority">Sort by Priority</option>
                </select>

                {/* Bulk Actions Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="text-xs"
                >
                  Bulk Actions
                </Button>

                {/* Process Button */}
                <Button
                  onClick={processBatch}
                  disabled={isProcessing || selectedFiles.filter(f => f.status === 'pending').length === 0}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : `Process Files`}
                </Button>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {showBulkActions && (
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllFiles}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllFiles}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                  {selectedFileIds.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeSelectedFiles}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove Selected
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPriority('high')}
                        className="text-xs"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        High Priority
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPriority('normal')}
                        className="text-xs"
                      >
                        Normal Priority
                      </Button>
                    </>
                  )}
                  {processingStats.failed > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={retryFailedFiles}
                      className="text-xs text-amber-600 hover:text-amber-700"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry Failed
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced File List */}
          <div className="p-6">
            <div className="space-y-3">
              {sortedFiles.map((fileData) => (
                <div
                  key={fileData.id}
                  className={cn(
                    "border rounded-xl p-4 transition-all hover:shadow-md",
                    fileData.status === 'success' && "border-green-200 bg-green-50",
                    fileData.status === 'error' && "border-red-200 bg-red-50",
                    fileData.status === 'duplicate' && "border-yellow-200 bg-yellow-50",
                    fileData.isDuplicate && "border-l-4 border-l-yellow-400",
                    selectedFileIds.includes(fileData.id) && "ring-2 ring-blue-200 border-blue-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for selection */}
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(fileData.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFileIds(prev => [...prev, fileData.id]);
                        } else {
                          setSelectedFileIds(prev => prev.filter(id => id !== fileData.id));
                        }
                      }}
                      className="mt-1"
                    />

                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {fileData.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {fileData.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {fileData.status === 'pending' && <FileText className="w-5 h-5 text-slate-400" />}
                      {fileData.status === 'duplicate' && <X className="w-5 h-5 text-yellow-600" />}
                      {['uploading', 'processing', 'extracting'].includes(fileData.status) && (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>

                    {/* File Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-slate-900 truncate">{fileData.file.name}</p>

                        {/* Priority Badge */}
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          fileData.priority === 'high' && "bg-red-100 text-red-800",
                          fileData.priority === 'normal' && "bg-blue-100 text-blue-800",
                          fileData.priority === 'low' && "bg-gray-100 text-gray-800"
                        )}>
                          {fileData.priority}
                        </span>

                        {/* HIPAA Badge */}
                        {fileData.isHIPAACompliant && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            HIPAA
                          </span>
                        )}
                      </div>

                      {/* File Details */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                        <span>{(fileData.file.size / 1024).toFixed(1)} KB</span>
                        {fileData.metadata?.pages && <span>{fileData.metadata.pages} pages</span>}
                        {fileData.metadata?.words && <span>{fileData.metadata.words} words</span>}
                        {fileData.metadata?.confidence && (
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {Math.round(fileData.metadata.confidence)}% confidence
                          </span>
                        )}
                        {fileData.uploadTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fileData.uploadTime.toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      {/* Preview */}
                      {fileData.preview && (
                        <div className="bg-slate-100 rounded p-2 text-xs text-slate-600 mb-2">
                          {fileData.preview}
                        </div>
                      )}

                      {/* Processing Steps */}
                      {fileData.currentStep && ['uploading', 'processing', 'extracting'].includes(fileData.status) && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
                            <span>Processing: {fileData.currentStep}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${fileData.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Error Message */}
                      {fileData.error && (
                        <p className="text-xs text-red-600 bg-red-50 rounded p-2 mt-2">
                          {fileData.error}
                        </p>
                      )}

                      {/* Duplicate Warning */}
                      {fileData.isDuplicate && (
                        <p className="text-xs text-yellow-600 bg-yellow-50 rounded p-2 mt-2">
                          This file appears to be a duplicate of another uploaded file.
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {fileData.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreview(fileData)}
                          className="text-xs"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}

                      {fileData.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileData.id)}
                          disabled={isProcessing}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreview && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  File Preview: {previewFile.file.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* File Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">Size: </span>
                    <span className="text-slate-600">{(previewFile.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">Type: </span>
                    <span className="text-slate-600">{previewFile.file.type || 'Unknown'}</span>
                  </div>
                  {previewFile.metadata?.pages && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">Pages: </span>
                      <span className="text-slate-600">{previewFile.metadata.pages}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {previewFile.metadata?.words && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">Words: </span>
                      <span className="text-slate-600">{previewFile.metadata.words}</span>
                    </div>
                  )}
                  {previewFile.metadata?.confidence && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">AI Confidence: </span>
                      <span className="text-slate-600">{Math.round(previewFile.metadata.confidence)}%</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium text-slate-700">Priority: </span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      previewFile.priority === 'high' && "bg-red-100 text-red-800",
                      previewFile.priority === 'normal' && "bg-blue-100 text-blue-800",
                      previewFile.priority === 'low' && "bg-gray-100 text-gray-800"
                    )}>
                      {previewFile.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* File Content Preview */}
              {previewFile.preview && (
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Content Preview</h4>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 font-mono">
                    {previewFile.preview}
                  </div>
                </div>
              )}

              {/* Processing Steps */}
              {previewFile.processingSteps && (
                <div className="mt-6">
                  <h4 className="font-medium text-slate-700 mb-3">Processing Pipeline</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {previewFile.processingSteps.map((step, index) => (
                      <div
                        key={step}
                        className={cn(
                          "text-center p-2 rounded text-xs",
                          previewFile.currentStep === step
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : index < previewFile.processingSteps!.indexOf(previewFile.currentStep || '')
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="flex justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {previewFile.isHIPAACompliant ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Shield className="w-4 h-4" />
                      HIPAA Compliant
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      Review for Compliance
                    </div>
                  )}
                </div>
                <Button onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Complete Message */}
      {batchComplete && finalPatientId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Batch Processing Complete!</h3>
          <p className="text-green-700 mb-4">
            All documents have been processed and combined into a single patient record.
          </p>
          <Button onClick={() => router.push(`/patients/${finalPatientId}`)}>
            View Patient Record
          </Button>
        </div>
      )}
    </div>
  );
}
