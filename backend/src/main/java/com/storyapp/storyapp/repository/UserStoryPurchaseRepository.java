package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.UserStoryPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStoryPurchaseRepository extends JpaRepository<UserStoryPurchase, Long> {

    boolean existsByUserIdAndStoryId(Long userId, Long storyId);

    Optional<UserStoryPurchase> findByUserIdAndStoryId(Long userId, Long storyId);
}
