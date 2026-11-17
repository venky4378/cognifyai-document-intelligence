package com.docuai.docuai.repository;

import com.docuai.docuai.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp,Long> {
    Optional<PasswordResetOtp> findByEmailAndOtp(String email,String otp);
    void deleteByEmail(String email);
}
