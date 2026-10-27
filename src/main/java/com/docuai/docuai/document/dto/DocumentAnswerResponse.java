package com.docuai.docuai.document.dto;

import java.util.List;

public record DocumentAnswerResponse(
        String answer,
        List<SourceReference> sources)
{
}
