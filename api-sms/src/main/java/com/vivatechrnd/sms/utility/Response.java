package com.vivatechrnd.sms.utility;

public class Response {

    String result;
    String error;
    Integer errorcode;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    String message;

    public Response() {
        this.result = "SUCCESS";
        this.error = "";
        this.errorcode = 0;
    }

    public Response(String string, String message) {
        this.result = string;
        this.error = message;
        this.errorcode = -1;
   }

    public Integer getErrorcode() {
        return errorcode;
    }

    public void setErrorcode(Integer errorcode) {
        this.errorcode = errorcode;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

}
