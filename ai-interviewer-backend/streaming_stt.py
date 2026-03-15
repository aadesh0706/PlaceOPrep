"""
Sarvam Streaming Speech-to-Text Integration
Real-time transcription using WebSocket
"""

import asyncio
import base64
from sarvamai import AsyncSarvamAI

class StreamingTranscriber:
    def __init__(self, api_key):
        self.client = AsyncSarvamAI(api_subscription_key=api_key)
        self.transcript_buffer = []
        
    async def transcribe_stream(self, audio_chunks, callback):
        """
        Stream audio to Sarvam and get real-time transcripts
        
        Args:
            audio_chunks: Iterator of base64 encoded audio chunks
            callback: Function to call with transcript updates
        """
        try:
            # Create streaming connection
            async with self.client.speech_to_text.stream(
                model="saaras:v3",
                mode="transcribe",
                language_code="en-IN",
                sample_rate=16000,
                input_audio_codec="wav",
                high_vad_sensitivity=True,
                vad_signals=True
            ) as stream:
                
                print("WebSocket connection established")
                
                # Send audio chunks
                for chunk in audio_chunks:
                    # Decode base64 to bytes
                    audio_bytes = base64.b64decode(chunk)
                    await stream.send(audio_bytes)
                
                # Listen for responses
                async for message in stream:
                    if message.type == "speech_start":
                        print("Speech detected")
                        callback({"type": "speech_start"})
                        
                    elif message.type == "speech_end":
                        print("Speech ended")
                        callback({"type": "speech_end"})
                        
                    elif message.type == "transcript":
                        transcript_text = message.text
                        print(f"Transcript: {transcript_text}")
                        self.transcript_buffer.append(transcript_text)
                        callback({
                            "type": "transcript",
                            "text": transcript_text,
                            "is_final": message.is_final
                        })
                
                # Return complete transcript
                return " ".join(self.transcript_buffer)
                
        except Exception as e:
            print(f"Streaming error: {str(e)}")
            raise
