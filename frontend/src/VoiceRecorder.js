import React, { useState, useRef } from 'react';
import axiosInstance from './axiosInstance';
import { API_URL } from './config';

const VoiceRecorder = ({ onTranscription, selectedChat }) => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunks = useRef([]);

    const handleStartRecording = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                chunks.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: 'audio/mp3' });
                setAudioBlob(blob);
                chunks.current = [];
                handleSendAudio(blob);
            };

            mediaRecorderRef.current.start();
            setRecording(true);
        }
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
    };

    const handleSendAudio = async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'recording.mp3');

        try {
            const response = await axiosInstance.post(`/audios/speech-to-text/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const transcription = response.data.text;
            onTranscription(transcription);
        } catch (error) {
            console.error('Error sending audio file:', error);
        }
    };

    return (
        <div>
            <button disabled={!selectedChat} className={recording ? 'recording': null} onClick={recording ? handleStopRecording : handleStartRecording}>
                {recording ? <i class="fa-solid fa-xmark"></i> : <i class="fa-solid fa-microphone"></i>}
            </button>
        </div>
    );
};

export default VoiceRecorder;