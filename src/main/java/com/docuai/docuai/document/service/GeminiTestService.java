package com.docuai.docuai.document.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class GeminiTestService {

    private final ChatClient chatClient;

    public GeminiTestService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }


    public String testGemini() {
        System.out.println("1. Starting Gemini request...");

        try {
            String response = chatClient.prompt()
                    .user("Reply with exactly: Gemini is working")
                    .call()
                    .content();

            System.out.println("2. Gemini response received: " + response);
            return response;

        } catch (Exception e) {
            System.err.println("3. Gemini request failed:");
            e.printStackTrace();
            throw e;
        }
    }

}