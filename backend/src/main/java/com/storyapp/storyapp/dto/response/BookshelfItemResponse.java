package com.storyapp.storyapp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookshelfItemResponse {

    private Long storyId;

    private String title;

    private String coverImageUrl;

    private String authorName;

    private String genreName;

    private String status;

    private Long firstChapterId;

    private Long lastReadChapterId;

    private Integer lastReadChapterNumber;

    private String lastReadChapterTitle;
}
