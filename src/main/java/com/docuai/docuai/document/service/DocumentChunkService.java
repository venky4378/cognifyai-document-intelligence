
package com.docuai.docuai.document.service;

import com.docuai.docuai.entity.Document;
import com.docuai.docuai.entity.DocumentChunk;
import com.docuai.docuai.repository.DocumentChunkRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentChunkService {

    private final DocumentChunkRepository chunkRepository;

    public DocumentChunkService(
            DocumentChunkRepository chunkRepository) {
        this.chunkRepository = chunkRepository;
    }

    // Existing method: chunks the document's combined extracted text.
    public void createChunks(Document document) {

        String text = document.getExtractedText();

        if (text == null || text.isBlank()) {
            return;
        }

        int chunkSize = 1000;
        int overlap = 150;
        int start = 0;
        int chunkIndex = 0;

        List<DocumentChunk> chunks = new ArrayList<>();

        while (start < text.length()) {

            int end = Math.min(start + chunkSize, text.length());
            String content = text.substring(start, end).trim();

            if (!content.isBlank()) {
                chunks.add(new DocumentChunk(
                        content,
                        chunkIndex++,
                        document
                ));
            }

            if (end == text.length()) {
                break;
            }

            start = end - overlap;
        }

        chunkRepository.saveAll(chunks);
    }

    // New method: chunks page-by-page and records each PDF page number.
    public void createChunks(
            Document document,
            List<String> pageTexts) {

        if (pageTexts == null || pageTexts.isEmpty()) {
            return;
        }

        int chunkSize = 1000;
        int overlap = 150;
        int chunkIndex = 0;

        List<DocumentChunk> chunks = new ArrayList<>();

        for (int i = 0; i < pageTexts.size(); i++) {

            String text = pageTexts.get(i);

            if (text == null || text.isBlank()) {
                continue;
            }

            int start = 0;

            while (start < text.length()) {

                int end = Math.min(start + chunkSize, text.length());
                String content = text.substring(start, end).trim();

                if (!content.isBlank()) {
                    chunks.add(new DocumentChunk(
                            content,
                            chunkIndex++,
                            i + 1,
                            document
                    ));
                }

                if (end == text.length()) {
                    break;
                }

                start = end - overlap;
            }
        }

        if (!chunks.isEmpty()) {
            chunkRepository.saveAll(chunks);
        }
    }
}
