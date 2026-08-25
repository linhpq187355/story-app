package com.storyapp.storyapp.entity;

import com.storyapp.storyapp.entity.base.BaseEntity;
import com.storyapp.storyapp.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(length = 255)
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.ROLE_MEMBER;

    @Column(name = "is_vip", nullable = false)
    private Boolean isVip = false;

    @Column(name = "vip_expiration_date")
    private java.time.LocalDateTime vipExpirationDate;

    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long coins = 0L;

    public boolean isVipActive() {
        if (Boolean.TRUE.equals(isVip)) {
            if (vipExpirationDate == null) {
                return true;
            }
            return vipExpirationDate.isAfter(java.time.LocalDateTime.now());
        }
        return false;
    }
}