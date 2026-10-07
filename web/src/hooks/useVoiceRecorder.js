import { useEffect, useRef, useState } from 'react';
import { uploadFile } from '../api/uploads';

const MAX_VOICE_SECONDS = 600; 

export function useVoiceRecorder(initialVoiceUri = null) {
  const [voiceUri, setVoiceUri] = useState(initialVoiceUri);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const audioElRef = useRef(null);

  const stopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
        .find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blobType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        const extension = blobType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `voice-note.${extension}`, { type: blobType });

        setUploadingVoice(true);
        try {
          const url = await uploadFile(file, 'voice');
          setVoiceUri(url);
        } catch (err) {
          alert(err.message || 'failed to upload voice recording.');
        } finally {
          setUploadingVoice(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= MAX_VOICE_SECONDS) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      alert('microphone access is required to record a voice journal.');
    }
  };

  const removeVoice = () => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setVoiceUri(null);
  };

  const toggleVoicePlayback = () => {
    if (!audioElRef.current) return;
    if (isPlaying) audioElRef.current.pause();
    else audioElRef.current.play();
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return {
    voiceUri, setVoiceUri,
    isRecording, uploadingVoice, recordingSeconds, isPlaying, setIsPlaying,
    audioElRef,
    startRecording, stopRecording, removeVoice, toggleVoicePlayback,
  };
}

export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}