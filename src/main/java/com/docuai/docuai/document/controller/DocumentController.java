package com.docuai.docuai.document.controller;

import com.docuai.docuai.document.dto.DocumentResponse;
import com.docuai.docuai.document.dto.DocumentUploadResponse;
import com.docuai.docuai.document.service.DocumentManagementService;
import com.docuai.docuai.document.service.DocumentService;
import com.docuai.docuai.entity.User;
import com.docuai.docuai.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentManagementService documentManagementService;
    private final UserRepository userRepository;


    public DocumentController(DocumentService documentService,DocumentManagementService documentManagementService,UserRepository userRepository){
        this.documentService = documentService;
        this.documentManagementService = documentManagementService;
        this.userRepository = userRepository;

    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentUploadResponse> uploadDocument(
            @RequestParam("file")MultipartFile file,
            Authentication authentication)throws IOException{

        String email = authentication.getName();

        DocumentUploadResponse response =
                documentService.uploadDocument(file,email);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public List<DocumentResponse> getUserDocuments(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user was not found"));

        return documentManagementService.getUserDocuments(user.getId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable("id") Long documentId, Authentication authentication){
        if(authentication == null || !authentication.isAuthenticated()){
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                "Authentication was not found"));

        documentManagementService.deleteDocument(documentId,user.getId());

        return ResponseEntity.noContent().build();
    }



}
