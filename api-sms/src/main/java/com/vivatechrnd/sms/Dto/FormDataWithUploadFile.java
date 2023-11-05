/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.vivatechrnd.sms.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author KALAM
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FormDataWithUploadFile {

    private String ivrprompt;

    private MultipartFile uploadfile;



}
