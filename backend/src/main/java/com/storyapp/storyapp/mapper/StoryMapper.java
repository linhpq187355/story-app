package com.storyapp.storyapp.mapper;

import com.storyapp.storyapp.dto.response.StoryResponse;
import com.storyapp.storyapp.entity.Story;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface StoryMapper {

    StoryMapper INSTANCE = Mappers.getMapper(StoryMapper.class);

    @Mapping(source = "story.author.id", target = "authorId")
    @Mapping(source = "story.author.name", target = "authorName")
    @Mapping(source = "story.genre.id", target = "genreId")
    @Mapping(source = "story.genre.name", target = "genreName")
    @Mapping(source = "chapterCount", target = "chapterCount")
    @Mapping(source = "firstChapterId", target = "firstChapterId")
    StoryResponse toResponse(Story story, long chapterCount, Long firstChapterId);
}