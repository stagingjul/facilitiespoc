"use client"

import { useState, useRef } from "react"
import { useData, type Task, type TaskEvidence } from "@/components/providers/data-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { v4 as uuidv4 } from "uuid"
import { Camera, X } from "lucide-react"

interface TaskActionFormProps {
  task: Task
  onClose: () => void
}

export default function TaskActionForm({ task, onClose }: TaskActionFormProps) {
  const { updateTaskStatus } = useData()
  const [resolution, setResolution] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const handleStartCamera = async () => {
    setShowCamera(true)
    setCameraError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setCameraError("Could not access camera. Please ensure you've granted camera permissions.")
      setShowCamera(false)
    }
  }

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL("image/jpeg")
        setPhotoEvidence(dataUrl)

        // Stop the camera stream
        const stream = video.srcObject as MediaStream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }

        setShowCamera(false)
      }
    }
  }

  const handleCancelCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
    setShowCamera(false)
  }

  const handleRemovePhoto = () => {
    setPhotoEvidence(null)
  }

  const handleSubmit = () => {
    if (!resolution) {
      return
    }

    setIsSubmitting(true)

    // Create evidence object if photo was taken
    let evidence: TaskEvidence | undefined
    if (photoEvidence) {
      evidence = {
        id: uuidv4(),
        imageUrl: photoEvidence,
        timestamp: new Date().toISOString(),
      }
    }

    // Simulate a delay for better UX
    setTimeout(() => {
      updateTaskStatus(task.id, "completed", resolution, evidence)
      setIsSubmitting(false)
      onClose()
    }, 500)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{task.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="resolution" className="text-sm font-medium">
          Resolution Details
        </label>
        <Textarea
          id="resolution"
          placeholder="Describe how you resolved this task..."
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Photo Evidence</label>

        {showCamera ? (
          <div className="space-y-2">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              {cameraError ? (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                  <p className="text-sm text-destructive">{cameraError}</p>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex justify-center gap-2">
              <Button type="button" onClick={handleCapturePhoto} disabled={!!cameraError}>
                Capture Photo
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelCamera}>
                Cancel
              </Button>
            </div>
          </div>
        ) : photoEvidence ? (
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            <img src={photoEvidence || "/placeholder.svg"} alt="Evidence" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleRemovePhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full h-32 flex flex-col gap-2"
            onClick={handleStartCamera}
          >
            <Camera className="h-6 w-6" />
            <span>Take Photo</span>
          </Button>
        )}

        {/* Hidden canvas for capturing photos */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !resolution}>
          {isSubmitting ? "Submitting..." : "Complete Task"}
        </Button>
      </div>
    </div>
  )
}

