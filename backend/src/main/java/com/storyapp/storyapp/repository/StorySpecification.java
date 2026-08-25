package com.storyapp.storyapp.repository;

import com.storyapp.storyapp.entity.Story;
import com.storyapp.storyapp.enums.StoryStatus;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class StorySpecification {

    public Specification<Story> withFetchJoin() {
        return (root, query, criteriaBuilder) -> {
            Class<?> resultType = query.getResultType();
            if (Long.class.equals(resultType) || long.class.equals(resultType)) {
                return criteriaBuilder.conjunction();
            }
            root.fetch("author", JoinType.LEFT);
            root.fetch("genre", JoinType.LEFT);
            query.distinct(true);
            return criteriaBuilder.conjunction();
        };
    }

    public Specification<Story> hasTitleOrAuthor(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("author").get("name")), pattern)
            );
        };
    }

    public Specification<Story> hasStatus(StoryStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public Specification<Story> hasGenre(Long genreId) {
        return (root, query, criteriaBuilder) -> {
            if (genreId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("genre").get("id"), genreId);
        };
    }

    public Specification<Story> hasAuthor(Long authorId) {
        return (root, query, criteriaBuilder) -> {
            if (authorId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("author").get("id"), authorId);
        };
    }
}