
package com.docuai.docuai.document.service;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentSearchService {

    private final VectorStore vectorStore;

    public DocumentSearchService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public List<Document> search(String question) {

        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException(
                    "Search question cannot be empty");
        }

        SearchRequest request = SearchRequest.builder()
                .query(question)
                .topK(3)
                .build();

        return vectorStore.similaritySearch(request);
    }
}
