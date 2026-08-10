package com.storyapp.storyapp.security;

import com.storyapp.storyapp.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class JwtService {

    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();

    @Value("${app.security.jwt.secret}")
    private String secret;

    @Value("${app.security.jwt.expiration-ms}")
    private Long expirationMs;

    public String generateToken(User user) {
        long issuedAt = Instant.now().getEpochSecond();
        long expiresAt = issuedAt + expirationMs / 1000;

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getUsername());
        payload.put("userId", user.getId());
        payload.put("email", user.getEmail());
        payload.put("role", user.getRole().name());
        payload.put("vip", user.getIsVip());
        payload.put("iat", issuedAt);
        payload.put("exp", expiresAt);

        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = toJson(payload);
        String header = encode(headerJson.getBytes(StandardCharsets.UTF_8));
        String body = encode(payloadJson.getBytes(StandardCharsets.UTF_8));
        String signature = sign(header + "." + body);
        return header + "." + body + "." + signature;
    }

    public String extractUsername(String token) {
        String payload = decodePayload(token);
        return getStringClaim(payload, "sub");
    }

    public boolean isValid(String token, UserPrincipal userPrincipal) {
        String username = extractUsername(token);
        return username.equals(userPrincipal.getUsername()) && !isExpired(token) && hasValidSignature(token);
    }

    public Long getExpirationMs() {
        return expirationMs;
    }

    private boolean isExpired(String token) {
        String payload = decodePayload(token);
        Long exp = getLongClaim(payload, "exp");
        return exp == null || Instant.now().getEpochSecond() >= exp;
    }

    private boolean hasValidSignature(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return false;
        }
        return sign(parts[0] + "." + parts[1]).equals(parts[2]);
    }

    private String decodePayload(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT");
        }
        return new String(BASE64_URL_DECODER.decode(parts[1]), StandardCharsets.UTF_8);
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return encode(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Could not sign JWT", ex);
        }
    }

    private String encode(byte[] bytes) {
        return BASE64_URL_ENCODER.encodeToString(bytes);
    }

    private String toJson(Map<String, Object> values) {
        StringBuilder builder = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : values.entrySet()) {
            if (!first) {
                builder.append(",");
            }
            builder.append("\"").append(entry.getKey()).append("\":");
            Object value = entry.getValue();
            if (value instanceof Number || value instanceof Boolean) {
                builder.append(value);
            } else {
                builder.append("\"").append(escapeJson(String.valueOf(value))).append("\"");
            }
            first = false;
        }
        return builder.append("}").toString();
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private String getStringClaim(String payload, String claim) {
        String pattern = "\"" + claim + "\":\"";
        int start = payload.indexOf(pattern);
        if (start < 0) {
            return null;
        }
        start += pattern.length();
        int end = payload.indexOf("\"", start);
        return end < 0 ? null : payload.substring(start, end);
    }

    private Long getLongClaim(String payload, String claim) {
        String pattern = "\"" + claim + "\":";
        int start = payload.indexOf(pattern);
        if (start < 0) {
            return null;
        }
        start += pattern.length();
        int end = start;
        while (end < payload.length() && Character.isDigit(payload.charAt(end))) {
            end++;
        }
        return end == start ? null : Long.parseLong(payload.substring(start, end));
    }
}
