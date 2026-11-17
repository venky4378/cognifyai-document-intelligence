package com.docuai.docuai.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username:venkyswamy437@gmail.com}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail,String otp){
        String subject = "CognifyAI - Password Reset OTP Code";
        String content = "Hello,\n\n"
                + "We received a request to reset your password for your CognifyAI account.\n\n"
                + "Your 6-digit OTP verification code is: " + otp + "\n\n"
                + "This code is valid for 10 minutes. If you did not request this, please ignore this email.\n\n"
                + "Best regards,\n"
                + "CognifyAI Team";

        try{
            if(mailSender != null){
                SimpleMailMessage message = new SimpleMailMessage();
                message.setSubject(subject);
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setText(content);
                mailSender.send(message);
                System.out.println(">> [EMAIL SENT] Reset OTP delivered to : "+toEmail);

            }
        }catch(Exception ex) {
            System.err.println(">> [EMAIL ERROR] Could not send via SMTP: " + ex.getMessage());
        }
        // Always print to console as fallback for seamless testing
        System.out.println("==================================================");
        System.out.println(" [LOCAL DEV FALLBACK] Password Reset OTP");
        System.out.println(" Email: " + toEmail);
        System.out.println(" OTP Code: " + otp + " (Valid for 10 mins)");
        System.out.println("==================================================");
        }
    }

