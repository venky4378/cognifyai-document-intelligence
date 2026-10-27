package com.docuai.docuai.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class RegisterResponse {

    private Long id;
    private String name;
    private String email;
    private LocalDateTime createdAt;
}
