package com.docuai.docuai.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class RegisterRequest {

    @NotBlank(message="name is required")
    String name;

    @NotBlank(message = "email is required")
    @Email(message = "Invalid email format")
    String email;

    @NotBlank(message = "passoword is required")
    @Size(min=5, message = "Password must atleast contains 5 Characters")
    String password;

}
