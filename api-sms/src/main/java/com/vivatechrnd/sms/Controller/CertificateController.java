package com.vivatechrnd.sms.Controller;

import com.vivatechrnd.sms.Dto.CertificateDto;
import com.vivatechrnd.sms.Entities.Certificates;
import com.vivatechrnd.sms.PaginationDto.CertificatePaginationDto;
import com.vivatechrnd.sms.Services.CertificateService;
import com.vivatechrnd.sms.utility.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping(value = "/certificate")
public class CertificateController {

    @Autowired
    private CertificateService service;

    @RequestMapping(value = "/view", method = RequestMethod.GET)
    public List<CertificateDto> getAllCertificate(){
        return service.getAllCertificate();
    }

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    public Response createCertificate(@RequestPart String dtoData, @RequestPart MultipartFile file){
        return service.saveCertificate(dtoData, file);
    }

    @RequestMapping(value = "/update", method = RequestMethod.POST)
    public Response updateCertificate(@RequestBody CertificateDto certificateDto){
        return service.updateCertificate(certificateDto);
    }

    @RequestMapping(value = "/delete", method = RequestMethod.POST)
    public Response deleteCertificate(@RequestBody Integer certificateDto){
        return service.deleteCertificate(certificateDto);
    }

    @RequestMapping(value = "/read-pdf", method = RequestMethod.POST)
    public CertificateDto readPdf(@RequestPart MultipartFile file){
        return service.readPdfFile(file);
    }

    @RequestMapping(value = "/filter-certificate", method = RequestMethod.POST)
    public CertificatePaginationDto getFilteredCertificate(@RequestBody CertificateDto certificateDto){
        int pageNumber = (certificateDto.getPageNumber() != null && certificateDto.getPageNumber() != 0)? certificateDto.getPageNumber() : 0;
        PageRequest pageRequest = new PageRequest(pageNumber, 5);
        Page<Certificates> certificates = service.getFilteredCertificate(certificateDto, pageRequest);
        CertificatePaginationDto dto = service.certificateDtoPaginationResponse(certificates);
        return dto;
    }

}
