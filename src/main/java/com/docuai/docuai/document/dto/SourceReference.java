package com.docuai.docuai.document.dto;

public record SourceReference(
        Long documentId,
        String fileName,
        Integer pageNumber,
        Integer chunkIndex
) {
}
