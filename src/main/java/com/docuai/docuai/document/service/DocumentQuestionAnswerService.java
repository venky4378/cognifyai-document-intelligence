package com.docuai.docuai.document.service;

import com.docuai.docuai.document.dto.DocumentAnswerResponse;
import com.docuai.docuai.document.dto.SourceReference;
import com.docuai.docuai.repository.DocumentRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
 import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DocumentQuestionAnswerService {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;

    public DocumentQuestionAnswerService(ChatClient chatClient, VectorStore vectorStore, DocumentRepository documentRepository) {
        this.chatClient = chatClient;
        this.vectorStore = vectorStore;
        this.documentRepository = documentRepository;

    }

    public DocumentAnswerResponse answerQuestion(String question, Long userId) {

        //1.Validate the student's question
        if (question == null || question.isBlank()) {
            throw new IllegalArgumentException("Queston cannot be empty");
        }
        if (userId == null) {
            throw new IllegalArgumentException(
                    "Authenticated user Id is required");
        }

        //2 . Retieve the relevant Chunks from the vector store
        SearchRequest searchRequest = SearchRequest.builder()
                .query(question)
                .topK(3)
                .filterExpression("userId == '" + userId + "'")
                .build();
        List<Document> relevantChunks = vectorStore.similaritySearch(searchRequest);

// Temporary debugging code
        System.out.println("RAG userId: " + userId);

        System.out.println("Retrieved chunks: "
                + (relevantChunks == null ? 0 : relevantChunks.size()));

        if (relevantChunks != null) {
            relevantChunks.forEach(chunk ->
                    System.out.println("Retrieved metadata: "
                            + chunk.getMetadata()));
        }

        if (relevantChunks == null || relevantChunks.isEmpty()) {
            return new DocumentAnswerResponse("I counldn't find any relevant information in the uploaded documents.", List.of());
        }

        List<com.docuai.docuai.entity.Document> userDocs = documentRepository.findByUserId(userId);
        String userDocList = userDocs.isEmpty()
                ? "No documents currently uploaded."
                : userDocs.stream().map(d -> "• " + d.getFileName()).collect(Collectors.joining("\n"));

        String context = relevantChunks.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        String answer =  chatClient.prompt()
                .system("""
                        You are DocuAI, an intelligent document assistant.
                        Answer user questions using the provided Document Context and the list of documents uploaded in the workspace.
                        
                        The user currently has these uploaded files in their workspace:
                        %s
                        
                        If the user asks what documents they have uploaded or asks to list them, list their document names clearly.
                        For questions about the content, answer using the Document Context.
                        Always format answers cleanly using markdown (bullet points, bold text, or tables when appropriate).
                        """.formatted(userDocList)).user("""
                        Document Context: 
                        %s
                        
                        User question:
                        %s 
                        """.formatted(context, question))
                .call().content();
        Map<String, SourceReference> uniqueSources = new LinkedHashMap<>();

        for (Document chunk : relevantChunks) {
            Map<String, Object> metadata = chunk.getMetadata();

            Object documentIdValue = metadata.get("documentId");
            Object chunkIndexValue = metadata.get("chunkIndex");
            Object pageNumberValue = metadata.get("pageNumber");

            if (!(documentIdValue instanceof Number documentIdNumber)) {
                continue;
            }

            Long documentId = documentIdNumber.longValue();
            com.docuai.docuai.entity.Document document = documentRepository.findById(documentId).orElse(null);

            if (document == null || document.getUser() == null
                    || !userId.equals(document.getUser().getId())) {
                continue;
            }

            Integer chunkIndex = chunkIndexValue instanceof Number number
                    ? number.intValue()
                    : null;

            Integer pageNumber = pageNumberValue instanceof Number number
                    ? number.intValue()
                    : null;

            if (pageNumber != null && pageNumber < 1) {
                pageNumber = null;
            }

            SourceReference source = new SourceReference(
                    document.getId(),
                    document.getFileName(),
                    pageNumber,
                    chunkIndex
            );

            String sourceKey = documentId + "-"
                    +(pageNumber == null ? "unknown" : pageNumber)
                    +"-"
                    +(chunkIndex == null ? "unknown" : chunkIndex);
            uniqueSources.putIfAbsent(sourceKey, source);

        }
        return new DocumentAnswerResponse(
                answer,
                new ArrayList<>(uniqueSources.values())
        );


    }
}
