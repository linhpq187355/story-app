package com.storyapp.storyapp.service.impl;

import com.storyapp.storyapp.dto.response.UserResponse;
import com.storyapp.storyapp.entity.*;
import com.storyapp.storyapp.enums.AccessLevel;
import com.storyapp.storyapp.exception.BadRequestException;
import com.storyapp.storyapp.exception.ResourceNotFoundException;
import com.storyapp.storyapp.mapper.UserMapper;
import com.storyapp.storyapp.repository.*;
import com.storyapp.storyapp.service.CoinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CoinServiceImpl implements CoinService {

    private final UserRepository userRepository;
    private final ChapterRepository chapterRepository;
    private final StoryRepository storyRepository;
    private final UserChapterPurchaseRepository userChapterPurchaseRepository;
    private final UserStoryPurchaseRepository userStoryPurchaseRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserResponse purchaseChapterWithCoins(Long userId, Long chapterId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new ResourceNotFoundException("Chapter", "id", chapterId));

        if (chapter.getAccessLevel() != AccessLevel.VIP) {
            throw new BadRequestException("Chương này không phải chương VIP.");
        }

        if (userStoryPurchaseRepository.existsByUserIdAndStoryId(userId, chapter.getStory().getId())) {
            throw new BadRequestException("Bạn đã sở hữu trọn bộ truyện này rồi.");
        }

        if (userChapterPurchaseRepository.existsByUserIdAndChapterId(userId, chapterId)) {
            throw new BadRequestException("Bạn đã mua chương VIP này rồi.");
        }

        long price = chapter.getCoinPrice() != null ? chapter.getCoinPrice() : 0L;
        if (price <= 0) {
            throw new BadRequestException("Chương VIP này chưa được thiết lập giá xu.");
        }

        long userCoins = user.getCoins() != null ? user.getCoins() : 0L;
        if (userCoins < price) {
            throw new BadRequestException("Số dư xu của bạn không đủ (" + userCoins + " / " + price + " xu). Vui lòng nạp thêm xu.");
        }

        user.setCoins(userCoins - price);
        userRepository.save(user);

        UserChapterPurchase purchase = new UserChapterPurchase();
        purchase.setUser(user);
        purchase.setChapter(chapter);
        purchase.setPriceCoins(price);
        userChapterPurchaseRepository.save(purchase);

        log.info("User {} purchased chapter {} ({}) for {} coins", userId, chapterId, chapter.getTitle(), price);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse purchaseStoryWithCoins(Long userId, Long storyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResourceNotFoundException("Story", "id", storyId));

        if (userStoryPurchaseRepository.existsByUserIdAndStoryId(userId, storyId)) {
            throw new BadRequestException("Bạn đã mua trọn bộ truyện này rồi.");
        }

        long price = story.getCoinPrice() != null ? story.getCoinPrice() : 0L;
        if (price <= 0) {
            throw new BadRequestException("Truyện này chưa được thiết lập giá xu trọn bộ.");
        }

        long userCoins = user.getCoins() != null ? user.getCoins() : 0L;
        if (userCoins < price) {
            throw new BadRequestException("Số dư xu của bạn không đủ (" + userCoins + " / " + price + " xu). Vui lòng nạp thêm xu.");
        }

        user.setCoins(userCoins - price);
        userRepository.save(user);

        UserStoryPurchase purchase = new UserStoryPurchase();
        purchase.setUser(user);
        purchase.setStory(story);
        purchase.setPriceCoins(price);
        userStoryPurchaseRepository.save(purchase);

        log.info("User {} purchased entire story {} ({}) for {} coins", userId, storyId, story.getTitle(), price);
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserCoins(Long userId, Long coins) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        long newCoins = coins != null ? coins : 0L;
        if (newCoins < 0) {
            throw new BadRequestException("Số xu không được nhỏ hơn 0.");
        }

        user.setCoins(newCoins);
        User saved = userRepository.save(user);

        log.info("Admin updated coins for user {} to {}", userId, newCoins);
        return userMapper.toResponse(saved);
    }
}
