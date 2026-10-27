package com.docuai.docuai.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "document_chunks")
@Setter
@Getter
@NoArgsConstructor
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable= false,columnDefinition = "TEXT")
    private String content;

    @Column(name="chunk_index",nullable = false)
    private Integer chunkIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="document_id",nullable = false)
    private Document document;

    @Column(name = "page_number")
    private Integer pageNumber;

    public DocumentChunk(String content,Integer chunkIndex,Integer pageNumber,Document document){
            this.content = content;
            this.chunkIndex = chunkIndex;
            this.pageNumber = pageNumber;
            this.document = document;
    }

    public DocumentChunk(String content,Integer chunkIndex,Document document){
        this.content = content;
        this.chunkIndex = chunkIndex;
        this.document = document;
    }
}
