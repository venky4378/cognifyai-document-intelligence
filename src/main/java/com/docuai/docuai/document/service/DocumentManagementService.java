package com.docuai.docuai.document.service;

import com.docuai.docuai.document.dto.DocumentResponse;
import com.docuai.docuai.document.mapper.DocumentMapper;
import com.docuai.docuai.entity.Document;
import com.docuai.docuai.repository.DocumentChunkRepository;
import com.docuai.docuai.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class DocumentManagementService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final DocumentChunkRepository documentChunkRepository;
    private final DocumentEmbeddingService documentEmbeddingService;

    public DocumentManagementService(
            DocumentRepository documentRepository,
            DocumentMapper documentMapper,
            DocumentChunkRepository documentChunkRepository,
            DocumentEmbeddingService embeddingService) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.documentChunkRepository = documentChunkRepository;
        this.documentEmbeddingService = embeddingService;
    }

    public List<DocumentResponse> getUserDocuments(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Authenticated user ID is required");
        }

        return documentRepository.findByUserId(userId)
                .stream()
                .map(documentMapper::toResponse)
                .toList();
    }
    @Transactional
    public void deleteDocument(Long documentId, Long userId) {

        if (documentId == null || userId == null) {
            throw new IllegalArgumentException(
                    "Document ID and authenticated user ID are required");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"));

        // Ensure the document belongs to the authenticated user.
        if (!document.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document not found");
        }

        // Delete embeddings associated with this document.
        documentEmbeddingService.deleteDocumentEmbeddings(documentId);

        // Delete extracted chunks from PostgreSQL.
        documentChunkRepository.deleteByDocumentId(documentId);

        // Delete the locally stored PDF.
        String filePath = document.getFilePath();

        if (filePath != null && !filePath.isBlank()) {
            try {
                Files.deleteIfExists(Path.of(filePath));
            } catch (IOException e) {
                throw new IllegalStateException(
                        "Failed to delete the stored PDF file", e);
            }
        }

        // Delete document metadata.
        documentRepository.delete(document);
    }
}