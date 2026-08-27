package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    long countByIsVip(Boolean isVip);

    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:isVip IS NULL OR u.isVip = :isVip)")
    List<User> filterUsers(@Param("keyword") String keyword, @Param("isVip") Boolean isVip);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isVip = true AND (u.vipExpirationDate IS NULL OR u.vipExpirationDate > :now)")
    long countActiveVipUsers(@Param("now") java.time.LocalDateTime now);

    long countByCreatedAtGreaterThanEqual(java.time.LocalDateTime startDate);

    long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    List<User> findTop5ByOrderByCreatedAtDesc();
}
