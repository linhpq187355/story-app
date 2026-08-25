package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.UserChapterPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface UserChapterPurchaseRepository extends JpaRepository<UserChapterPurchase, Long> {

    boolean existsByUserIdAndChapterId(Long userId, Long chapterId);

    Optional<UserChapterPurchase> findByUserIdAndChapterId(Long userId, Long chapterId);

    @Query("SELECT ucp.chapter.id FROM UserChapterPurchase ucp WHERE ucp.user.id = :userId")
    Set<Long> findPurchasedChapterIdsByUserId(@Param("userId") Long userId);
}
