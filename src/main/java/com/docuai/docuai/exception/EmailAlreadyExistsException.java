package com.docuai.docuai.exception;


public class EmailAlreadyExistsException extends RuntimeException{
    public EmailAlreadyExistsException(String message){
            super(message);
    }
}

