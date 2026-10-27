package com.docuai.docuai.document.controller;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("api/ai")
public class EmbeddingTestController {

    private final EmbeddingModel embeddingModel;


    public EmbeddingTestController(EmbeddingModel embeddingModel){
        this.embeddingModel = embeddingModel;
    }

    @GetMapping("/embedding-test")
    public Map<String,Object> testEmbedding(
            @RequestParam(defaultValue = "Hello DocuAi") String text){

        float[] embedding = embeddingModel.embed(text);

        return Map.of(
                "success",true,
                "dimensions",embedding.length,
                "message","Embedding generated successfully"
        );
    }

}
