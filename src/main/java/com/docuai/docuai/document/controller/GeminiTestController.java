package com.docuai.docuai.document.controller;

import com.docuai.docuai.document.service.GeminiTestService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class GeminiTestController {

    public final GeminiTestService geminiTestService;

    public GeminiTestController(GeminiTestService geminiTestService) {
        this.geminiTestService = geminiTestService;
    }


    @GetMapping("/test")
    public Map<String,String> testGemini(){
        String response = geminiTestService.testGemini();
        return Map.of("response",response);
    }
}
