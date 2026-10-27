package com.docuai.docuai.document.mapper;

import com.docuai.docuai.document.dto.DocumentResponse;
import com.docuai.docuai.entity.Document;
import org.mapstruct.Mapper;

@Mapper(componentModel="spring")
public interface DocumentMapper {

    DocumentResponse toResponse(Document document);

}
