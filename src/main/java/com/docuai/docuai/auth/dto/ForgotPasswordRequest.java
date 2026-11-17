package com.docuai.docuai.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ForgotPasswordRequest {

    @NotBlank(message="Email is Required")
    @Email(message="Please enter a Valid Email")
    private String email;
}
