package com.storyapp.storyapp.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RankingsResponse {

    private List<RankItemResponse> topRated;

    private List<RankItemResponse> topFollowed;

    private List<RankItemResponse> topViewed;
}
