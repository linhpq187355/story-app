package com.storyapp.storyapp.entity;

import com.storyapp.storyapp.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "authors")
public class Author extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String bio;

    @OneToMany(mappedBy = "author")
    private List<Story> stories = new ArrayList<>();
}