package com.storyapp.storyapp.exception;

import com.storyapp.storyapp.enums.AccessLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<?> handleForbidden(ForbiddenException ex) {
        String code = "FORBIDDEN";
        if (ex.getRequiredLevel() == AccessLevel.VIP) {
            code = "VIP_REQUIRED";
        } else if (ex.getRequiredLevel() == AccessLevel.MEMBER) {
            code = "MEMBER_REQUIRED";
        }
        return buildResponse(HttpStatus.FORBIDDEN, code, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<?> handleBadRequest(BadRequestException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String code;
        switch (status) {
            case NOT_FOUND -> code = "RESOURCE_NOT_FOUND";
            case FORBIDDEN -> code = "FORBIDDEN";
            case UNAUTHORIZED -> code = "UNAUTHORIZED";
            case CONFLICT -> code = "ALREADY_EXISTS";
            case BAD_REQUEST -> code = "BAD_REQUEST";
            case PAYLOAD_TOO_LARGE -> code = "FILE_TOO_LARGE";
            default -> code = "REQUEST_FAILED";
        }

        return buildResponse(status, code, ex.getReason() != null ? ex.getReason() : "Request failed");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldError();
        String message = fieldError != null ? fieldError.getDefaultMessage() : "Validation failed";

        return buildResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        return buildResponse(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "File upload exceeds the maximum allowed size. Please choose a smaller file.");
    }

    @ExceptionHandler({
        org.springframework.orm.ObjectOptimisticLockingFailureException.class,
        jakarta.persistence.OptimisticLockException.class,
        org.springframework.transaction.TransactionSystemException.class
    })
    public ResponseEntity<?> handleOptimisticLockingFailure(Exception ex) {
        if (ex.getCause() != null && ex.getCause().getMessage() != null && ex.getCause().getMessage().contains("Optimistic")) {
            log.warn("Optimistic locking conflict detected: {}", ex.getMessage());
            return buildResponse(
                HttpStatus.CONFLICT,
                "CONCURRENCY_CONFLICT",
                "Dữ liệu đã được cập nhật bởi một người dùng khác. Vui lòng tải lại trang để thấy dữ liệu mới nhất."
            );
        }
        log.warn("Transaction exception detected: {}", ex.getMessage());
        return buildResponse(
            HttpStatus.BAD_REQUEST,
            "TRANSACTION_FAILED",
            "Không thể thực hiện giao dịch. Vui lòng kiểm tra lại dữ liệu và thử lại."
        );
    }

    @ExceptionHandler(org.apache.catalina.connector.ClientAbortException.class)
    public void handleClientAbortException(org.apache.catalina.connector.ClientAbortException ex) {
        log.debug("Client aborted stream connection: {}", ex.getMessage());
    }

    @ExceptionHandler(java.io.IOException.class)
    public void handleIOException(java.io.IOException ex) {
        if (ex.getClass().getName().contains("ClientAbortException")
                || (ex.getMessage() != null && (ex.getMessage().contains("aborted") || ex.getMessage().contains("Broken pipe")))) {
            log.debug("Client closed stream connection: {}", ex.getMessage());
            return;
        }
        log.error("I/O error occurred", ex);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(Exception ex) {
        if (ex.getClass().getName().contains("ClientAbortException")
                || (ex.getCause() != null && ex.getCause().getClass().getName().contains("ClientAbortException"))) {
            log.debug("Client aborted connection: {}", ex.getMessage());
            return null;
        }
        log.error("Unhandled exception", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Internal server error");
    }

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String code, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("code", code);
        body.put("message", message);

        return ResponseEntity.status(status).body(body);
    }
}