
package com.docuai.docuai.document.service;

import com.docuai.docuai.entity.DocumentChunk;
import com.docuai.docuai.repository.DocumentChunkRepository;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DocumentEmbeddingService {

    private final DocumentChunkRepository chunkRepository;
    private final VectorStore vectorStore;

    public DocumentEmbeddingService(
            DocumentChunkRepository chunkRepository,
            VectorStore vectorStore) {
        this.chunkRepository = chunkRepository;
        this.vectorStore = vectorStore;
    }

    public void embedDocument(Long documentId) {

        List<DocumentChunk> chunks =
                chunkRepository
                        .findByDocumentIdOrderByChunkIndexAsc(documentId);

        if (chunks.isEmpty()) {
            throw new IllegalArgumentException(
                    "No chunks found for document ID: " + documentId);
        }

        List<Document> documents = chunks.stream()
                .map(chunk -> Document.builder()
                        .text(chunk.getContent())
                        .metadata(Map.of(
                                "documentId",
                                chunk.getDocument().getId(),
                                "chunkIndex",
                                chunk.getChunkIndex(),
                                "userId",
                                chunk.getDocument()
                                        .getUser()
                                        .getId()
                                        .toString(),
                                "pageNumber",
                                chunk.getPageNumber() == null
                                        ? -1
                                        : chunk.getPageNumber()
                        ))
                        .build())
                .toList();

        vectorStore.add(documents);
    }

    public void deleteDocumentEmbeddings(Long documentId) {
        vectorStore.delete(
                "documentId == " + documentId
        );
    }
}
