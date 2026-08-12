package com.storyapp.storyapp.exception;

import com.storyapp.storyapp.enums.AccessLevel;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenException extends RuntimeException {

    private AccessLevel requiredLevel;

    public ForbiddenException(String message) {
        super(message);
    }

    public ForbiddenException(String message, AccessLevel requiredLevel) {
        super(message);
        this.requiredLevel = requiredLevel;
    }
}
