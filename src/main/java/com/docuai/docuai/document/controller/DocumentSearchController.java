package com.docuai.docuai.document.controller;

import com.docuai.docuai.document.service.DocumentSearchService;

import org.springframework.ai.document.Document;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
public class DocumentSearchController {

    private final DocumentSearchService documentSearchService;

    public DocumentSearchController(DocumentSearchService documentSearchService){
        this.documentSearchService = documentSearchService;
    }

    @GetMapping("/search")
    public List<Map<String,Object>> search(@RequestParam String question, Authentication authentication){
        List<Document> results = documentSearchService.search(question);

         return results.stream()
               .map(document -> Map.<String,Object>of(
                       "content",document.getText(),
                        "metadata",document.getMetadata()
                    ))
                 .toList();
    }


}
