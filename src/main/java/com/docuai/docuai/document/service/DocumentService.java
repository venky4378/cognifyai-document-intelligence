
package com.docuai.docuai.document.service;

import com.docuai.docuai.document.dto.DocumentUploadResponse;
import com.docuai.docuai.entity.Document;
import com.docuai.docuai.entity.User;
import com.docuai.docuai.repository.DocumentRepository;
import com.docuai.docuai.repository.UserRepository;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final LocalFileStorageService localFileStorageService;
    private final DocumentChunkService documentChunkService;
    private final DocumentEmbeddingService documentEmbeddingService;

    public DocumentService(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            LocalFileStorageService localFileStorageService,
            DocumentChunkService documentChunkService,
            DocumentEmbeddingService documentEmbeddingService) {

        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.localFileStorageService = localFileStorageService;
        this.documentChunkService = documentChunkService;
        this.documentEmbeddingService = documentEmbeddingService;
    }

    public DocumentUploadResponse uploadDocument(
            MultipartFile file,
            String email) throws IOException {

        // 1. Validate the uploaded file
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // 2. Validate the PDF content type
        if (!"application/pdf".equalsIgnoreCase(
                file.getContentType())) {
            throw new IllegalArgumentException(
                    "Only PDF files are allowed");
        }

        // 3. Find the authenticated user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // 4. Extract text separately for each PDF page
        List<String> pageTexts = extractPageTexts(file);

        // Combine page text to preserve the existing Document field
        String extractedText = pageTexts.stream()
                .collect(Collectors.joining("\n\n"));

        // 5. Store the original PDF
        String savedPath = localFileStorageService.store(file);

        // 6. Create the document entity
        Document document = new Document();

        document.setFileName(file.getOriginalFilename());
        document.setContentType(file.getContentType());
        document.setFileSize(file.getSize());
        document.setUploadAt(LocalDateTime.now());
        document.setExtractedText(extractedText);
        document.setUser(user);
        document.setFilePath(savedPath);

        Document savedDocument = documentRepository.save(document);

        // 7. Create chunks with their original PDF page numbers
        documentChunkService.createChunks(
                savedDocument,
                pageTexts
        );

        // 8. Generate embeddings and store them in pgvector
        documentEmbeddingService.embedDocument(
                savedDocument.getId()
        );

        // 9. Return the upload response
        return new DocumentUploadResponse(
                savedDocument.getId(),
                savedDocument.getFileName(),
                savedDocument.getContentType(),
                savedDocument.getFileSize(),
                savedDocument.getUploadAt()
        );
    }

    private List<String> extractPageTexts(
            MultipartFile file) throws IOException {

        List<String> pageTexts = new ArrayList<>();

        try (PDDocument pdfDocument =
                     Loader.loadPDF(file.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);

            // PDF page numbers start at 1
            for (int page = 1;
                 page <= pdfDocument.getNumberOfPages();
                 page++) {

                stripper.setStartPage(page);
                stripper.setEndPage(page);

                String pageText = stripper.getText(pdfDocument);
                pageTexts.add(pageText);
            }
        }

        return pageTexts;
    }
}
