package com.vivatechrnd.sms.Login;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Spring Web filter for logging request and response.
 *
 * @author Hidetake Iwata
 * @see org.springframework.web.filter.AbstractRequestLoggingFilter
 * @see ContentCachingRequestWrapper
 * @see ContentCachingResponseWrapper
 */
@Slf4j
public class StubLoggingFilter extends OncePerRequestFilter {
    private static final List<MediaType> VISIBLE_TYPES = Arrays.asList(
        MediaType.valueOf("text/plain"),
        MediaType.APPLICATION_FORM_URLENCODED,
        MediaType.APPLICATION_JSON,
        MediaType.APPLICATION_XML,
        MediaType.valueOf("application/*+json"),
        MediaType.valueOf("application/*+xml"),
        MediaType.MULTIPART_FORM_DATA
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (isAsyncDispatch(request)) {
            filterChain.doFilter(request, response);
        } else {
            doFilterWrapped(wrapRequest(request), wrapResponse(response), filterChain);
        }
    }

    private void doFilterWrapped(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response, FilterChain filterChain) throws ServletException, IOException {
        try {
            beforeRequest(request, response);
            filterChain.doFilter(request, response);
        }
        finally {
            afterRequest(request, response);
            response.copyBodyToResponse();
        }
    }

    private void beforeRequest(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response) {
        if (log.isInfoEnabled()) {
            logRequestHeader(request, request.getRemoteAddr() + "|>");
        }
    }

    private void afterRequest(ContentCachingRequestWrapper request, ContentCachingResponseWrapper response) {
        if (log.isInfoEnabled()) {
            logRequestBody(request, request.getRemoteAddr() + "|>");
            logResponse(response, request.getRemoteAddr() + "|<");
        }
    }

    private static void logRequestHeader(ContentCachingRequestWrapper request, String prefix) {
        val queryString = request.getQueryString();
        if (queryString == null) {
            log.info("{} {} {}", prefix, request.getMethod(), request.getRequestURI());
        } else {
            log.info("{} {} {}?{}", prefix, request.getMethod(), request.getRequestURI(), queryString);
        }
        if (log.isDebugEnabled()) {
            Collections.list(request.getHeaderNames()).forEach(headerName ->
                    Collections.list(request.getHeaders(headerName)).forEach(headerValue ->
                            log.debug("{} {}: {}", prefix, headerName, headerValue)));
//            log.debug("{}", prefix);
        }
    }

    private static void logRequestBody(ContentCachingRequestWrapper request, String prefix) {
        val content = request.getContentAsByteArray();
        if (content.length > 0) {
            logContent(content, request.getContentType(), request.getCharacterEncoding(), prefix);
        }
    }

    private static void logResponse(ContentCachingResponseWrapper response, String prefix) {
        val status = response.getStatus();
        log.info("{} {} {}", prefix, status, HttpStatus.valueOf(status).getReasonPhrase());
        if (log.isDebugEnabled()) {
            response.getHeaderNames().forEach(headerName ->
                    response.getHeaders(headerName).forEach(headerValue ->
                            log.debug("{} {}: {}", prefix, headerName, headerValue)));
//            log.debug("{}", prefix);
        }
        val content = response.getContentAsByteArray();
        if (content.length > 0) {
            logContent(content, response.getContentType(), response.getCharacterEncoding(), prefix);
        }
    }

    private static void logContent(byte[] content, String contentType, String contentEncoding, String prefix) {
        val mediaType = MediaType.valueOf(contentType);
        log.info("Content type: {}", contentType);
        log.info("Media type: {}", mediaType);
        val visible = VISIBLE_TYPES.stream().anyMatch(visibleType -> visibleType.includes(mediaType));
        log.info("Visible: {}", visible);
        List<String> skipLog = Arrays.asList("application/javascript", "text/html;charset=ISO-8859-1", "text/css");
        if (visible) {
            try {
                val contentString = new String(content, contentEncoding);
//                Stream.of(contentString.split("\r\n|\r|\n")).forEach(line -> log.info("{} {}", prefix, line));
                log.info("{} {}", prefix, contentString);
            } catch (UnsupportedEncodingException e) {
                log.info("{} [{} bytes content]", prefix, content.length);
            }
        } else {
            if (!skipLog.stream().anyMatch(ele -> ele.equalsIgnoreCase(contentType))) log.info("{} [{} bytes content]", prefix, content.length);
        }
    }

    private static ContentCachingRequestWrapper wrapRequest(HttpServletRequest request) {
        if (request instanceof ContentCachingRequestWrapper) {
            return (ContentCachingRequestWrapper) request;
        } else {
            return new ContentCachingRequestWrapper(request);
        }
    }

    private static ContentCachingResponseWrapper wrapResponse(HttpServletResponse response) {
        if (response instanceof ContentCachingResponseWrapper) {
            return (ContentCachingResponseWrapper) response;
        } else {
            return new ContentCachingResponseWrapper(response);
        }
    }
}