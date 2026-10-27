package com.docuai.docuai.document.dto;

import java.time.LocalDateTime;

public record DocumentResponse(
        Long id,
        String fileName,
        String contentType,
        Long fileSize,
        LocalDateTime uploadAt
){
}