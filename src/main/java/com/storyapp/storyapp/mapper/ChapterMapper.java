package com.storyapp.storyapp.mapper;

import com.storyapp.storyapp.dto.response.ChapterResponse;
import com.storyapp.storyapp.entity.Chapter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ChapterMapper {

    ChapterMapper INSTANCE = Mappers.getMapper(ChapterMapper.class);

    @Mapping(source = "story.id", target = "storyId")
    @Mapping(source = "story.title", target = "storyTitle")
    ChapterResponse toResponse(Chapter chapter);
}
