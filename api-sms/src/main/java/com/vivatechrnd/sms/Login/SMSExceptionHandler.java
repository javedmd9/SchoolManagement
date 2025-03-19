package com.vivatechrnd.sms.Login;


public class SMSExceptionHandler extends RuntimeException{
    public SMSExceptionHandler() {
        super("Not Found");
    }

    public SMSExceptionHandler(String message) {
        super(message);
    }
}
