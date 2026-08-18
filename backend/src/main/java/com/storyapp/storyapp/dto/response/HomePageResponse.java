package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class HomePageResponse {

    private List<HomeRecentlyReadResponse> recentlyRead;

    private List<HomeFollowingStoryResponse> following;

    private List<HomeHotStoryResponse> hotStories;

    private List<HomeUpdatingStoryResponse> updatingStories;
}