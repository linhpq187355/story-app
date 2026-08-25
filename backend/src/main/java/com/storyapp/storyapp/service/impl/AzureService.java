package com.storyapp.storyapp.service.impl;

import com.microsoft.cognitiveservices.speech.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AzureService {

    @Value("${azure.speech.key}")
    private String speechKey;

    @Value("${azure.speech.region}")
    private String speechRegion;

    public byte[] synthesize(String text, String voiceName) {

        SpeechConfig speechConfig =
                SpeechConfig.fromSubscription(speechKey, speechRegion);

        speechConfig.setSpeechSynthesisVoiceName(voiceName);
        speechConfig.setSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3);

        try (
                SpeechSynthesizer synthesizer =
                        new SpeechSynthesizer(speechConfig, null)
        ) {

            SpeechSynthesisResult result =
                    synthesizer.SpeakText(text);

            if (result.getReason() == ResultReason.SynthesizingAudioCompleted) {
                return result.getAudioData();
            }

            if (result.getReason() == ResultReason.Canceled) {
                SpeechSynthesisCancellationDetails cancellation =
                        SpeechSynthesisCancellationDetails.fromResult(result);

                throw new RuntimeException(
                        "Azure TTS failed: " + cancellation.getErrorDetails()
                );
            }

            throw new RuntimeException(
                    "Azure TTS failed: " + result.getReason()
            );
        }
    }
}