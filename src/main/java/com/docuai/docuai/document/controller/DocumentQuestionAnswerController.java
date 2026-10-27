package com.docuai.docuai.document.controller;

import com.docuai.docuai.document.dto.DocumentAnswerResponse;
import com.docuai.docuai.document.dto.DocumentQuestionRequest;
import com.docuai.docuai.document.service.DocumentQuestionAnswerService;
import com.docuai.docuai.entity.User;
import com.docuai.docuai.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/documents")
public class DocumentQuestionAnswerController {

    private final DocumentQuestionAnswerService documentQuestionAnswerService;
    private final UserRepository userRepository;


    public DocumentQuestionAnswerController(DocumentQuestionAnswerService documentQuestionService,
                                            UserRepository userRepository) {
        this.documentQuestionAnswerService = documentQuestionService;
        this.userRepository = userRepository;
    }

    @PostMapping("/ask")
    public DocumentAnswerResponse askQuestion(
            @Valid @RequestBody DocumentQuestionRequest request,
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
                        "Authentication user was not found"));

        return documentQuestionAnswerService.answerQuestion(
                request.question(),
                user.getId()
        );
    }


}
